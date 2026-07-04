'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createProjectAction } from '@/lib/backend/actions/projects/create'
import { TagInput } from '@/components/ui/TagInput'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { connectorAPI, diagramsAPI, projectsAPI, type SavedConnection } from '@/lib/api/client'
import type { EditorDialect } from '@/lib/editor-schema'
import { Database, FileEdit, Loader2 } from 'lucide-react'

interface CreateProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

type CreationMode = 'database' | 'blank'
type DatabaseFamily = 'sql' | 'nosql'

const SQL_ENGINES: Array<{ value: EditorDialect; label: string }> = [
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'sqlserver', label: 'SQL Server' },
]

const NOSQL_ENGINES = [
  { value: 'mongodb', label: 'MongoDB' },
  { value: 'neo4j', label: 'Neo4j' },
]

const SQL_VALUES = SQL_ENGINES.map((engine) => engine.value)
const NOSQL_VALUES = NOSQL_ENGINES.map((engine) => engine.value)

export function CreateProjectModal({ open, onOpenChange, onCreated }: CreateProjectModalProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [family, setFamily] = useState<DatabaseFamily>('sql')
  const [creationMode, setCreationMode] = useState<CreationMode>('database')
  const [connections, setConnections] = useState<SavedConnection[]>([])
  const [selectedConnectionId, setSelectedConnectionId] = useState('')
  const [blankSqlEngine, setBlankSqlEngine] = useState<EditorDialect>('postgresql')
  const [blankNoSqlEngine, setBlankNoSqlEngine] = useState('mongodb')
  const [tables, setTables] = useState<string[]>([])
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [isLoadingSchema, setIsLoadingSchema] = useState(false)

  const compatibleConnections = useMemo(() => {
    const allowed = family === 'sql' ? SQL_VALUES : NOSQL_VALUES
    return connections.filter((connection) => allowed.includes(connection.engine as EditorDialect))
  }, [connections, family])

  const selectedConnection = useMemo(
    () => compatibleConnections.find((connection) => connection.connection_id === selectedConnectionId) ?? null,
    [compatibleConnections, selectedConnectionId],
  )

  const loadConnections = useCallback(async () => {
    try {
      setConnections(await connectorAPI.listSaved())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las conexiones locales.')
    }
  }, [])

  const loadSchema = useCallback(async () => {
    if (!selectedConnection) return
    setIsLoadingSchema(true)
    setError(null)
    try {
      const schemaData = await connectorAPI.savedSchema(selectedConnection.connection_id)
      const names = (schemaData.tables ?? []).map((table) => typeof table === 'string' ? table : table.name)
      setTables(names)
      setSelectedTables(names)
    } catch (cause) {
      setTables([])
      setSelectedTables([])
      setError(cause instanceof Error ? cause.message : 'No se pudo leer el esquema de la base de datos.')
    } finally {
      setIsLoadingSchema(false)
    }
  }, [selectedConnection])

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => void loadConnections(), 0)
    return () => window.clearTimeout(timer)
  }, [loadConnections, open])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSelectedConnectionId('')
      setTables([])
      setSelectedTables([])
      setError(null)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [family])

  useEffect(() => {
    if (!open || creationMode !== 'database' || !selectedConnection) return
    const timer = window.setTimeout(() => void loadSchema(), 0)
    return () => window.clearTimeout(timer)
  }, [creationMode, loadSchema, open, selectedConnection])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (creationMode === 'database' && (!selectedConnection || selectedTables.length === 0)) {
      setError(`Selecciona una conexion y al menos ${family === 'sql' ? 'una tabla' : 'un objeto'}.`)
      return
    }

    setIsPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const result = await createProjectAction(name, description)

    if (result?.error) {
      setError(result.error)
      setIsPending(false)
      return
    }

    const projectId = String(result.id)
    try {
      if (creationMode === 'database' && selectedConnection) {
        await diagramsAPI.generateSaved(projectId, {
          connection_id: selectedConnection.connection_id,
          selected_tables: selectedTables,
          name: 'Diagrama Principal',
        })
      } else {
        const engine = family === 'sql' ? blankSqlEngine : blankNoSqlEngine
        await diagramsAPI.create({
          project_id: Number(projectId),
          name: 'Diagrama Principal',
          schema_json: JSON.stringify({ nodes: [], edges: [], meta: { source: 'blank', database_family: family, engine } }),
          sql_content: family === 'sql' ? '' : JSON.stringify({ engine, collections: [] }, null, 2),
          active_dialect: family === 'sql' ? blankSqlEngine : 'json',
        })
      }
    } catch (cause) {
      await projectsAPI.permanentlyDelete(projectId).catch(() => undefined)
      setError(cause instanceof Error ? cause.message : 'No se pudo preparar el diagrama.')
      setIsPending(false)
      return
    }

    toast.success('Proyecto creado')
    onOpenChange(false)
    setIsPending(false)
    setTags([])
    setTables([])
    setSelectedTables([])
    setCreationMode('database')
    onCreated?.()
    router.push(`/editor?projectId=${projectId}`)
  }

  const toggleTable = (tableName: string) => {
    setSelectedTables((prev) => prev.includes(tableName) ? prev.filter((item) => item !== tableName) : [...prev, tableName])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] flex-col border-slate-200 bg-white p-6 text-slate-950 shadow-xl dark:border-[#1E2A45] dark:bg-[#111827] dark:text-[#E2E8F0] sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Nuevo Proyecto ER</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-[#94A3B8]">
            Primero elige SQL o NoSQL, luego decide si usaras una conexion local o un diagrama libre.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto pt-4 pr-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre <span className="text-red-400">*</span></Label>
              <Input id="name" name="name" required maxLength={50} placeholder="Ej. Sistema de Ventas" />
            </div>
            <div className="space-y-2">
              <Label>Tags <span className="text-slate-400">(opcional)</span></Label>
              <TagInput value={tags} onChange={setTags} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion (opcional)</Label>
            <Textarea id="description" name="description" maxLength={200} placeholder="Un breve resumen del proyecto..." className="resize-none" rows={2} />
          </div>

          <WizardSection title="1. Tipo de base de datos">
            <ModeButton active={family === 'sql'} icon={<Database className="h-5 w-5" />} title="SQL" description="PostgreSQL, MySQL o SQL Server." onClick={() => setFamily('sql')} />
            <ModeButton active={family === 'nosql'} icon={<Database className="h-5 w-5" />} title="NoSQL" description="MongoDB, Neo4j u objetos no relacionales." onClick={() => setFamily('nosql')} />
          </WizardSection>

          <WizardSection title="2. Origen del diagrama">
            <ModeButton active={creationMode === 'database'} icon={<Database className="h-5 w-5" />} title="Desde base conectada" description="Escoge una conexion y selecciona tablas u objetos." onClick={() => setCreationMode('database')} />
            <ModeButton active={creationMode === 'blank'} icon={<FileEdit className="h-5 w-5" />} title="Diagrama libre" description="Sin relacion a una base de datos existente." onClick={() => setCreationMode('blank')} />
          </WizardSection>

          {creationMode === 'blank' ? (
            <div className="rounded-lg border border-slate-200 p-4 dark:border-[#1E2A45]">
              <Label>3. Motor del diagrama libre</Label>
              <select
                value={family === 'sql' ? blankSqlEngine : blankNoSqlEngine}
                onChange={(event) => family === 'sql' ? setBlankSqlEngine(event.target.value as EditorDialect) : setBlankNoSqlEngine(event.target.value)}
                className="mt-3 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-[#1E2A45] dark:bg-[#0B1322]"
              >
                {(family === 'sql' ? SQL_ENGINES : NOSQL_ENGINES).map((engine) => <option key={engine.value} value={engine.value}>{engine.label}</option>)}
              </select>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 p-4 dark:border-[#1E2A45]">
              <div className="flex items-center justify-between">
                <Label>3. Conexion y {family === 'sql' ? 'tablas' : 'objetos'}</Label>
                {isLoadingSchema && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
              </div>
              <select value={selectedConnectionId} onChange={(event) => setSelectedConnectionId(event.target.value)} className="mt-3 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-[#1E2A45] dark:bg-[#0B1322]">
                <option value="">Selecciona una conexion {family === 'sql' ? 'SQL' : 'NoSQL'}</option>
                {compatibleConnections.map((connection) => (
                  <option key={connection.connection_id} value={connection.connection_id}>
                    {connection.alias || connection.database} - {connection.engine}:{connection.port}
                  </option>
                ))}
              </select>
              {selectedConnection && tables.length > 0 ? (
                <div className="mt-3 max-h-44 space-y-1.5 overflow-y-auto rounded-lg border border-slate-200 p-2 dark:border-[#1E2A45]">
                  <label className="flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-medium dark:border-[#1E2A45]">
                    <input type="checkbox" checked={selectedTables.length === tables.length} onChange={(event) => setSelectedTables(event.target.checked ? tables : [])} />
                    Seleccionar todo
                  </label>
                  {tables.map((table) => (
                    <label key={table} className="flex cursor-pointer items-center gap-2 rounded p-1 text-sm hover:bg-slate-100 dark:hover:bg-[#1E2A45]">
                      <input type="checkbox" checked={selectedTables.includes(table)} onChange={() => toggleTable(table)} />
                      {table}
                    </label>
                  ))}
                </div>
              ) : (
                <div className="mt-3 rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 dark:border-[#1E2A45] dark:text-[#94A3B8]">
                  {compatibleConnections.length === 0 ? `No hay conexiones ${family === 'sql' ? 'SQL' : 'NoSQL'} guardadas.` : 'Selecciona una conexion para cargar el schema.'}
                </div>
              )}
            </div>
          )}

          {error && <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">{error}</div>}

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-[#1E2A45]">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending} className="min-w-[140px] bg-[#1A6CF6] text-white hover:bg-blue-700">
              {isPending ? 'Creando...' : 'Crear Proyecto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function WizardSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4 dark:border-[#1E2A45]">
      <p className="mb-3 text-sm font-semibold">{title}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </div>
  )
}

function ModeButton({ active, icon, title, description, onClick }: { active: boolean; icon: ReactNode; title: string; description: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border p-3 text-left transition ${
        active
          ? 'border-[#1A6CF6] bg-blue-50 text-[#1A6CF6] dark:bg-[#1A6CF6]/15 dark:text-white'
          : 'border-slate-200 text-slate-600 hover:border-[#1A6CF6] hover:text-[#1A6CF6] dark:border-[#1E2A45] dark:text-[#94A3B8] dark:hover:bg-[#0B1322]'
      }`}
    >
      {icon}
      <p className="mt-2 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs opacity-75">{description}</p>
    </button>
  )
}
