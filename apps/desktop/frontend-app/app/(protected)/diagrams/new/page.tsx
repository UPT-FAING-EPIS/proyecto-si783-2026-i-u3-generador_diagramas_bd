'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Brain, Database, FileEdit, Loader2, Wand2 } from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { SchemaViewer } from '@/components/generator/SchemaViewer'
import { connectorAPI, diagramsAPI, type SavedConnection } from '@/lib/api/client'
import type { EditorDialect } from '@/lib/editor-schema'
import { useConnectionStore } from '@/lib/store/useConnectionStore'
import { toast } from 'sonner'

type SourceMode = 'database' | 'blank'
type DatabaseFamily = 'sql' | 'nosql'

const SQL_ENGINES: Array<{ value: EditorDialect; label: string }> = [
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'sqlserver', label: 'SQL Server' },
]

const NOSQL_ENGINES: Array<{ value: Extract<EditorDialect, 'mongodb' | 'neo4j'>; label: string }> = [
  { value: 'mongodb', label: 'MongoDB' },
  { value: 'neo4j', label: 'Neo4j' },
]

const SQL_ENGINE_VALUES = SQL_ENGINES.map((engine) => engine.value)
const NOSQL_ENGINE_VALUES = NOSQL_ENGINES.map((engine) => engine.value)

export default function NewDiagramPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams?.get('projectId') as string
  const { setActiveConnection } = useConnectionStore()

  const [family, setFamily] = useState<DatabaseFamily>('sql')
  const [mode, setMode] = useState<SourceMode>('database')
  const [connections, setConnections] = useState<SavedConnection[]>([])
  const [selectedConnectionId, setSelectedConnectionId] = useState('')
  const [tables, setTables] = useState<{ name: string; rowCount: number }[]>([])
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [isLoadingSchema, setIsLoadingSchema] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [diagramName, setDiagramName] = useState('Diagrama Principal')
  const [blankSqlEngine, setBlankSqlEngine] = useState<EditorDialect>('postgresql')
  const [blankNoSqlEngine, setBlankNoSqlEngine] = useState<Extract<EditorDialect, 'mongodb' | 'neo4j'>>('mongodb')

  const compatibleConnections = useMemo(() => {
    const allowed = family === 'sql' ? SQL_ENGINE_VALUES : NOSQL_ENGINE_VALUES
    return connections.filter((connection) => allowed.includes(connection.engine as EditorDialect))
  }, [connections, family])

  const selectedConnection = useMemo(
    () => compatibleConnections.find((connection) => connection.connection_id === selectedConnectionId) ?? null,
    [compatibleConnections, selectedConnectionId],
  )

  const selectedConfig = useMemo(() => {
    if (!selectedConnection) return null
    return {
      engine: selectedConnection.engine,
      host: selectedConnection.host,
      port: String(selectedConnection.port),
      username: selectedConnection.username || '',
      password: '',
      database: selectedConnection.database,
    }
  }, [selectedConnection])

  const loadConnections = useCallback(async () => {
    try {
      setConnections(await connectorAPI.listSaved())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudieron cargar las conexiones.')
    }
  }, [])

  const loadSchema = useCallback(async () => {
    if (!selectedConnection) return
    setIsLoadingSchema(true)
    try {
      const schemaData = await connectorAPI.savedSchema(selectedConnection.connection_id)
      const tableRows = (schemaData.tables ?? []).map((table) => ({
        name: typeof table === 'string' ? table : table.name,
        rowCount: 100,
      }))
      setTables(tableRows)
      setSelectedTables(tableRows.map((table) => table.name))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cargar el esquema de la base de datos.')
      setTables([])
      setSelectedTables([])
    } finally {
      setIsLoadingSchema(false)
    }
  }, [selectedConnection])

  useEffect(() => {
    if (!projectId) {
      router.push('/dashboard')
      return
    }
    const timer = window.setTimeout(() => void loadConnections(), 0)
    return () => window.clearTimeout(timer)
  }, [loadConnections, projectId, router])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSelectedConnectionId('')
      setTables([])
      setSelectedTables([])
    }, 0)
    return () => window.clearTimeout(timer)
  }, [family])

  useEffect(() => {
    if (mode === 'database' && selectedConnection) {
      const timer = window.setTimeout(() => void loadSchema(), 0)
      return () => window.clearTimeout(timer)
    }
    const timer = window.setTimeout(() => {
      setTables([])
      setSelectedTables([])
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadSchema, mode, selectedConnection])

  const handleToggleTable = (tableName: string) => {
    setSelectedTables((prev) => prev.includes(tableName) ? prev.filter((table) => table !== tableName) : [...prev, tableName])
  }

  const handleGenerate = async () => {
    if (!selectedConnection || !selectedConfig) {
      toast.error('Selecciona una conexion guardada.')
      return
    }
    if (selectedTables.length === 0) {
      toast.error(family === 'sql' ? 'Selecciona al menos una tabla.' : 'Selecciona al menos una coleccion/objeto.')
      return
    }

    setIsGenerating(true)
    try {
      setActiveConnection(selectedConfig)
      await diagramsAPI.generateSaved(projectId, {
        connection_id: selectedConnection.connection_id,
        selected_tables: selectedTables,
        name: diagramName,
      })
      toast.success('Diagrama generado con exito')
      router.push(`/editor?projectId=${projectId}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al generar el diagrama.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCreateBlank = async () => {
    setIsGenerating(true)
    try {
      const engine = family === 'sql' ? blankSqlEngine : blankNoSqlEngine
      const activeDialect = family === 'sql' ? blankSqlEngine : blankNoSqlEngine
      const noSqlSource = blankNoSqlEngine === 'neo4j'
        ? 'CREATE (:User { id: "uuid", name: "Ada" });\nCREATE (:Project { id: "uuid", name: "FluxSQL" });\nMATCH (u:User), (p:Project)\nCREATE (u)-[:OWNS]->(p);'
        : 'const UserSchema = new mongoose.Schema({\n  name: { type: String, required: true },\n  email: { type: String },\n  projects: [{ type: Schema.Types.ObjectId, ref: "Project" }]\n});'
      await diagramsAPI.create({
        project_id: Number(projectId),
        name: diagramName,
        schema_json: JSON.stringify({
          nodes: [],
          edges: [],
          meta: {
            source: 'blank',
            database_family: family,
            engine,
          },
        }),
        sql_content: family === 'sql' ? '' : noSqlSource,
        active_dialect: activeDialect,
      })
      toast.success('Diagrama libre creado')
      router.push(`/editor?projectId=${projectId}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo crear el diagrama libre.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-950 dark:bg-[#0A0F1E] dark:text-white">
      <DashboardSidebar userName="Usuario Local" userAvatarUrl={null} />
      <main className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 shrink-0 border-b border-slate-200 bg-white shadow-sm dark:border-[#1E2A45] dark:bg-[#111827]">
          <div className="container mx-auto flex h-16 items-center justify-between px-6">
            <div className="flex items-center">
              <Link href="/dashboard" className="mr-4 text-slate-500 transition-colors hover:text-slate-950 dark:text-[#94A3B8] dark:hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <Database className="mr-3 h-5 w-5 text-[#1A6CF6]" />
              <span className="text-base font-semibold">Nuevo diagrama</span>
            </div>
            {isLoadingSchema && (
              <div className="flex items-center gap-2 text-xs text-[#1A6CF6]">
                <Loader2 className="h-3 w-3 animate-spin" />
                Cargando esquema...
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="container mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 pb-20">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-[#1E2A45] dark:bg-[#111827]">
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-[#94A3B8]">Nombre del diagrama</label>
              <input
                type="text"
                value={diagramName}
                onChange={(event) => setDiagramName(event.target.value)}
                className="h-11 w-full max-w-md rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#1A6CF6] dark:border-[#1E2A45] dark:bg-[#0B1322]"
              />
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-[#1E2A45] dark:bg-[#111827]">
              <p className="text-sm font-semibold">1. Tipo de base de datos</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <ChoiceButton active={family === 'sql'} icon={<Database className="h-5 w-5" />} title="SQL" description="PostgreSQL, MySQL o SQL Server." onClick={() => setFamily('sql')} />
                <ChoiceButton active={family === 'nosql'} icon={<Database className="h-5 w-5" />} title="NoSQL" description="MongoDB, Neo4j u objetos no relacionales." onClick={() => setFamily('nosql')} />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-[#1E2A45] dark:bg-[#111827]">
              <p className="text-sm font-semibold">2. Origen del diagrama</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <ChoiceButton active={mode === 'database'} icon={<Database className="h-5 w-5" />} title="Desde base conectada" description="Seleccionar una conexion local y escoger tablas u objetos." onClick={() => setMode('database')} />
                <ChoiceButton active={mode === 'blank'} icon={<FileEdit className="h-5 w-5" />} title="Diagrama en blanco" description="Crear el canvas sin conectarse a una base." onClick={() => setMode('blank')} />
              </div>
            </section>

            {mode === 'blank' ? (
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-[#1E2A45] dark:bg-[#111827]">
                <p className="text-sm font-semibold">3. Motor del diagrama</p>
                <select
                  value={family === 'sql' ? blankSqlEngine : blankNoSqlEngine}
                  onChange={(event) => family === 'sql' ? setBlankSqlEngine(event.target.value as EditorDialect) : setBlankNoSqlEngine(event.target.value as Extract<EditorDialect, 'mongodb' | 'neo4j'>)}
                  className="mt-3 h-11 w-full max-w-sm rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#1A6CF6] dark:border-[#1E2A45] dark:bg-[#0B1322]"
                >
                  {(family === 'sql' ? SQL_ENGINES : NOSQL_ENGINES).map((engine) => (
                    <option key={engine.value} value={engine.value}>{engine.label}</option>
                  ))}
                </select>
                <button type="button" onClick={handleCreateBlank} disabled={isGenerating} className="mt-4 inline-flex h-11 items-center gap-2 rounded-lg bg-[#1A6CF6] px-4 text-sm font-medium text-white hover:bg-[#1559d1] disabled:opacity-60">
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileEdit className="h-4 w-4" />}
                  Crear diagrama en blanco
                </button>
              </section>
            ) : (
              <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
                <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-[#1E2A45] dark:bg-[#111827]">
                  <h2 className="font-semibold">3. Selecciona la base conectada</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-[#94A3B8]">Mostrando solo conexiones {family === 'sql' ? 'SQL' : 'NoSQL'}.</p>
                  <select value={selectedConnectionId} onChange={(event) => setSelectedConnectionId(event.target.value)} className="mt-4 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-[#1E2A45] dark:bg-[#0B1322]">
                    <option value="">Selecciona una conexion</option>
                    {compatibleConnections.map((connection) => (
                      <option key={connection.connection_id} value={connection.connection_id}>
                        {connection.alias || connection.database} - {connection.engine}:{connection.port}
                      </option>
                    ))}
                  </select>

                  {selectedConnection && (
                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-[#1E2A45] dark:bg-[#0B1322]">
                      <p className="font-medium">{selectedConnection.database}</p>
                      <p className="mt-1 text-slate-500 dark:text-[#94A3B8]">{selectedConnection.engine} · {selectedConnection.host_masked}:{selectedConnection.port}</p>
                      <button type="button" onClick={() => router.push(`/agent-tools?tool=memory&scope=database&subject=${encodeURIComponent(selectedConnection.connection_id)}`)} className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#1A6CF6] hover:underline">
                        <Brain className="h-4 w-4" />
                        Editar memoria de esta BD
                      </button>
                    </div>
                  )}

                  <button type="button" onClick={handleGenerate} disabled={!selectedConnection || selectedTables.length === 0 || isGenerating} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1A6CF6] text-sm font-medium text-white hover:bg-[#1559d1] disabled:opacity-60">
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    Generar diagrama
                  </button>
                </aside>

                <div className={isLoadingSchema ? 'opacity-50' : ''}>
                  {compatibleConnections.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-[#1E2A45] dark:bg-[#111827] dark:text-[#94A3B8]">
                      No hay conexiones {family === 'sql' ? 'SQL' : 'NoSQL'} guardadas. Ve a Conexiones y agrega una base primero.
                    </div>
                  ) : !selectedConnection ? (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-[#1E2A45] dark:bg-[#111827] dark:text-[#94A3B8]">
                      Selecciona una conexion para cargar su schema y elegir {family === 'sql' ? 'tablas' : 'colecciones u objetos'}.
                    </div>
                  ) : (
                    <SchemaViewer
                      tables={tables}
                      selectedTables={selectedTables}
                      onToggleTable={handleToggleTable}
                      onSelectAll={() => setSelectedTables(tables.map((table) => table.name))}
                      onDeselectAll={() => setSelectedTables([])}
                      onRowCountChange={() => {}}
                    />
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function ChoiceButton({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean
  icon: ReactNode
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border p-4 text-left transition ${
        active
          ? 'border-[#1A6CF6] bg-blue-50 text-[#1A6CF6] dark:bg-blue-500/10'
          : 'border-slate-200 text-slate-700 hover:border-[#1A6CF6] hover:text-[#1A6CF6] dark:border-[#1E2A45] dark:text-[#CBD5E1]'
      }`}
    >
      {icon}
      <span className="mt-3 block font-semibold">{title}</span>
      <span className="mt-1 block text-sm opacity-75">{description}</span>
    </button>
  )
}
