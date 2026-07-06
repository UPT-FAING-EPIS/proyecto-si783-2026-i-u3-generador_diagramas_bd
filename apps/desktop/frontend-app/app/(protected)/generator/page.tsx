'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Database, PlugZap } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { SchemaViewer } from '@/components/generator/SchemaViewer'
import { DataPreview } from '@/components/generator/DataPreview'
import { ExportPanel } from '@/components/generator/ExportPanel'
import { DatabaseRowsPanel, type DatabaseRows } from '@/components/generator/DatabaseRowsPanel'
import { connectorAPI, generatorAPI, type SavedConnection } from '@/lib/api/client'

export default function GeneratorPage() {
  const [connections, setConnections] = useState<SavedConnection[]>([])
  const [selectedConnectionId, setSelectedConnectionId] = useState('')
  const [tables, setTables] = useState<{ name: string; rowCount: number }[]>([])
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [previewData, setPreviewData] = useState<Record<string, unknown> | null>(null)
  const [databaseRows, setDatabaseRows] = useState<DatabaseRows | null>(null)
  const [databaseRowsError, setDatabaseRowsError] = useState<string | null>(null)
  const [listingTable, setListingTable] = useState<string | null>(null)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isInserting, setIsInserting] = useState(false)
  const [isLoadingSchema, setIsLoadingSchema] = useState(false)
  const [isLoadingConnections, setIsLoadingConnections] = useState(true)

  const selectedConnection = useMemo(
    () => connections.find((connection) => connection.connection_id === selectedConnectionId) ?? null,
    [connections, selectedConnectionId],
  )

  useEffect(() => {
    let mounted = true

    connectorAPI.listSaved()
      .then((items) => {
        if (!mounted) return
        setConnections(items)
        setSelectedConnectionId((current) => current || items[0]?.connection_id || '')
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'No se pudieron cargar las conexiones guardadas.')
      })
      .finally(() => {
        if (mounted) setIsLoadingConnections(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const loadSchema = useCallback(async () => {
    if (!selectedConnectionId) return

    setIsLoadingSchema(true)
    try {
      const schemaData = await connectorAPI.savedSchema(selectedConnectionId)
      setTables(schemaData.tables.map((table) => ({
        name: typeof table === 'string' ? table : table.name,
        rowCount: 100,
      })))
      setSelectedTables([])
      setPreviewData(null)
      setDatabaseRows(null)
      setDatabaseRowsError(null)
    } catch (error) {
      setTables([])
      toast.error(error instanceof Error ? error.message : 'No se pudo cargar el esquema.')
    } finally {
      setIsLoadingSchema(false)
    }
  }, [selectedConnectionId])

  useEffect(() => {
    if (!selectedConnectionId) return
    const timer = window.setTimeout(() => void loadSchema(), 0)
    return () => window.clearTimeout(timer)
  }, [selectedConnectionId, loadSchema])

  const selectedConfigs = () => tables
    .filter((table) => selectedTables.includes(table.name))
    .map((table) => ({ table_name: table.name, record_count: table.rowCount, selected: true }))

  async function handleGeneratePreview() {
    if (!selectedConnectionId) return
    setIsPreviewing(true)
    try {
      const schema = await connectorAPI.savedSchema(selectedConnectionId)
      setPreviewData(await generatorAPI.generatePreview({
        schema,
        table_configs: selectedConfigs(),
        preview_rows: 10,
        locale: 'es_ES',
      }))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo generar la vista previa.')
    } finally {
      setIsPreviewing(false)
    }
  }

  async function handleListRows(tableName: string, page = 1) {
    if (!selectedConnectionId) return
    setListingTable(tableName)
    setDatabaseRowsError(null)
    try {
      setDatabaseRows(await connectorAPI.savedTableRows(selectedConnectionId, tableName, page))
    } catch (error) {
      setDatabaseRowsError(error instanceof Error ? error.message : 'No se pudieron listar los datos.')
    } finally {
      setListingTable(null)
    }
  }

  async function handleExport(format: 'sql' | 'csv' | 'json') {
    if (!selectedConnectionId) return
    setIsExporting(true)
    try {
      const schema = await connectorAPI.savedSchema(selectedConnectionId)
      await generatorAPI.exportData({ schema, table_configs: selectedConfigs(), format, locale: 'es_ES' })
      toast.success(`Exportacion ${format.toUpperCase()} generada.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo exportar.')
    } finally {
      setIsExporting(false)
    }
  }

  async function handleInsertDirectly() {
    if (!selectedConnectionId) return
    setIsInserting(true)
    try {
      const schema = await connectorAPI.savedSchema(selectedConnectionId)
      await generatorAPI.insertSavedData({
        connection_id: selectedConnectionId,
        schema,
        table_configs: selectedConfigs(),
        locale: 'es_ES',
        allow_direct_write: true,
        human_approved: true,
        environment: selectedConnection?.environment ?? 'unknown',
      })
      toast.success('Datos insertados exitosamente.')
      if (databaseRows) await handleListRows(databaseRows.table_name, databaseRows.page)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudieron insertar los datos.')
    } finally {
      setIsInserting(false)
    }
  }

  const isConfigured = Boolean(selectedConnectionId) && selectedTables.length > 0

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-950 dark:bg-background dark:text-white">
      <DashboardSidebar userName="Usuario Local" activeSection="" onSectionChange={() => {}} />
      <main className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm dark:border-border dark:bg-accent">
          <div className="flex items-center">
            <Database className="mr-3 h-5 w-5 text-blue-500" />
            <span className="text-base font-semibold">Generador de Datos Ficticios</span>
          </div>
          {isLoadingSchema && <span className="text-xs text-blue-400">Cargando esquema...</span>}
        </header>

        <div className="flex-1 overflow-auto">
          <div className="container mx-auto flex max-w-5xl flex-col gap-8 px-6 py-8 pb-20">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <PlugZap className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Base de datos destino</h2>
                    <p className="text-sm text-slate-500 dark:text-gray-400">Elige una conexion guardada antes de generar o insertar datos.</p>
                  </div>
                </div>
                {isLoadingConnections && <span className="text-xs text-blue-500">Cargando conexiones...</span>}
              </div>

              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-500">Conexion guardada</span>
                  <select
                    value={selectedConnectionId}
                    onChange={(event) => setSelectedConnectionId(event.target.value)}
                    className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  >
                    {connections.length === 0 && <option value="">No hay conexiones guardadas</option>}
                    {connections.map((connection) => (
                      <option key={connection.connection_id} value={connection.connection_id}>
                        {connection.alias || connection.database} - {connection.engine} - {connection.username}@{connection.host}:{connection.port}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => void loadSchema()}
                  disabled={!selectedConnectionId || isLoadingSchema}
                  className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Recargar esquema
                </button>
              </div>

              {selectedConnection && (
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-gray-300">
                  <span className="rounded-full border border-slate-200 px-3 py-1 dark:border-gray-700">{selectedConnection.database}</span>
                  <span className="rounded-full border border-slate-200 px-3 py-1 dark:border-gray-700">{selectedConnection.engine}</span>
                  <span className="rounded-full border border-slate-200 px-3 py-1 dark:border-gray-700">{selectedConnection.environment}</span>
                </div>
              )}
            </section>

            <SchemaViewer
              tables={tables}
              selectedTables={selectedTables}
              onToggleTable={(name) => setSelectedTables((current) => current.includes(name) ? current.filter((table) => table !== name) : [...current, name])}
              onSelectAll={() => setSelectedTables(tables.map((table) => table.name))}
              onDeselectAll={() => setSelectedTables([])}
              onRowCountChange={(name, count) => setTables((current) => current.map((table) => table.name === name ? { ...table, rowCount: count } : table))}
              onListRows={(name) => void handleListRows(name)}
              listingTable={listingTable}
            />

            <DatabaseRowsPanel
              data={databaseRows}
              loading={Boolean(listingTable)}
              error={databaseRowsError}
              onPageChange={(page) => databaseRows && void handleListRows(databaseRows.table_name, page)}
              onClose={() => {
                setDatabaseRows(null)
                setDatabaseRowsError(null)
              }}
            />

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
              <DataPreview previewData={previewData} isLoading={isPreviewing} onGeneratePreview={() => void handleGeneratePreview()} disabled={!isConfigured} />
              <ExportPanel onExport={(format) => void handleExport(format)} onInsertDirectly={() => void handleInsertDirectly()} isExporting={isExporting} isInserting={isInserting} disabled={!isConfigured} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
