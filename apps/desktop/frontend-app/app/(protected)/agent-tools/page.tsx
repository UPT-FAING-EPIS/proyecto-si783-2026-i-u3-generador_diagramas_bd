'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { Bot, Brain, DatabaseZap, History, LockKeyhole, ShieldCheck } from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { agentToolsAPI, connectorAPI, type AgentToolsState, type EnvironmentGuardItem, type SavedConnection } from '@/lib/api/client'

const emptyState: AgentToolsState = {
  memories: [],
  skill_permissions: [],
  approvals: [],
  decisions: [],
  environment_guards: [],
}

const tools = [
  { id: 'memory', label: 'Memoria BD', icon: Brain, hint: 'Contexto por conexion' },
  { id: 'permissions', label: 'Permisos', icon: LockKeyhole, hint: 'Skills por base conectada' },
  { id: 'history', label: 'Historial', icon: History, hint: 'Ejecuciones por BD' },
  { id: 'guards', label: 'Guardas', icon: ShieldCheck, hint: 'Reglas de escritura' },
] as const

type ToolId = typeof tools[number]['id']

export default function AgentToolsPage() {
  const [state, setState] = useState<AgentToolsState>(emptyState)
  const [connections, setConnections] = useState<SavedConnection[]>([])
  const [activeTool, setActiveTool] = useState<ToolId>('memory')
  const [selectedConnectionId, setSelectedConnectionId] = useState('')
  const [memoryContent, setMemoryContent] = useState('')
  const [memoryTags, setMemoryTags] = useState('database, schema-context')
  const [permission, setPermission] = useState({
    skill_id: 'safe_migration_basic',
    can_read_schema: true,
    can_generate_sql: true,
    can_execute: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const selectedConnection = useMemo(
    () => connections.find((connection) => connection.connection_id === selectedConnectionId) ?? null,
    [connections, selectedConnectionId],
  )

  const selectedMemory = useMemo(
    () => state.memories.find((item) => item.scope === 'database' && item.subject === selectedConnectionId),
    [selectedConnectionId, state.memories],
  )

  const scopedPermissions = useMemo(
    () => state.skill_permissions.filter((item) => item.environment === permissionScope(selectedConnectionId)),
    [selectedConnectionId, state.skill_permissions],
  )

  async function load() {
    try {
      setError(null)
      const [toolsState, savedConnections] = await Promise.all([agentToolsAPI.state(), connectorAPI.listSaved()])
      setState(toolsState)
      setConnections(savedConnections)
      if (!selectedConnectionId && savedConnections[0]) {
        setSelectedConnectionId(savedConnections[0].connection_id)
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las herramientas agenticas.')
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tool = params.get('tool')
    const subject = params.get('subject')

    if (tool === 'permissions' || tool === 'history' || tool === 'guards' || tool === 'memory') {
      setActiveTool(tool)
    }
    if (subject) setSelectedConnectionId(subject)
  }, [])

  useEffect(() => {
    setMemoryContent(selectedMemory?.content ?? '')
    setMemoryTags(selectedMemory?.tags.join(', ') || 'database, schema-context')
  }, [selectedMemory])

  const activeMeta = tools.find((tool) => tool.id === activeTool) ?? tools[0]

  const submitMemory = () => startTransition(async () => {
    if (!selectedConnection) return
    try {
      setError(null)
      await agentToolsAPI.createMemory({
        scope: 'database',
        subject: selectedConnection.connection_id,
        content: memoryContent,
        tags: memoryTags.split(',').map((tag) => tag.trim()).filter(Boolean),
      })
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar la memoria de esta base.')
    }
  })

  const submitPermission = () => startTransition(async () => {
    if (!selectedConnection) return
    try {
      setError(null)
      await agentToolsAPI.upsertSkillPermission({
        ...permission,
        environment: permissionScope(selectedConnection.connection_id),
        requires_approval: false,
      })
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron guardar los permisos de esta base.')
    }
  })

  const toggleGuard = (guard: EnvironmentGuardItem, field: keyof Pick<EnvironmentGuardItem, 'require_backup' | 'require_sandbox' | 'allow_direct_write'>) => {
    startTransition(async () => {
      try {
        setError(null)
        await agentToolsAPI.upsertEnvironmentGuard({ ...guard, require_approval: false, [field]: !guard[field] })
        await load()
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'No se pudo actualizar la guarda.')
      }
    })
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <DashboardSidebar userName="Usuario Local" userAvatarUrl={null} />
      <main className="flex-1 overflow-auto">
        <div className="border-b border-border bg-card px-6 py-5">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A6CF6] text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Herramientas agenticas</h1>
              <p className="text-sm text-muted-foreground">Gestiona memoria, permisos y ejecuciones por base de datos conectada.</p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-6">
          {error && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <section className="mb-6 rounded-lg border border-border bg-card p-5">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Base conectada</label>
            <select
              value={selectedConnectionId}
              onChange={(event) => setSelectedConnectionId(event.target.value)}
              className="h-11 w-full max-w-xl rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-[#1A6CF6]"
            >
              <option value="">Selecciona una conexion</option>
              {connections.map((connection) => (
                <option key={connection.connection_id} value={connection.connection_id}>
                  {connection.alias || connection.database} / {connection.engine} / {connection.host_masked}:{connection.port}
                </option>
              ))}
            </select>
            {selectedConnection && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Badge variant="outline">{selectedConnection.engine}</Badge>
                <Badge variant="outline">{selectedConnection.database}</Badge>
                <Badge variant="outline">{selectedConnection.environment}</Badge>
              </div>
            )}
          </section>

          <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
            {tools.map(({ id, label, icon: Icon, hint }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTool(id)}
                className={`flex min-w-[180px] items-center gap-3 rounded-lg border p-4 text-left transition ${
                  activeTool === id
                    ? 'border-[#1A6CF6] bg-blue-50 text-[#1A6CF6] dark:bg-blue-500/10'
                    : 'border-border bg-card text-muted-foreground hover:border-[#1A6CF6] hover:text-[#1A6CF6]'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="block text-xs opacity-70">{hint}</span>
                </span>
              </button>
            ))}
          </div>

          <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{activeMeta.label}</h2>
                <p className="text-sm text-muted-foreground">{activeMeta.hint}</p>
              </div>
              <Badge variant="outline">local-first</Badge>
            </div>

            {!selectedConnection ? (
              <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Agrega o selecciona una conexion para configurar herramientas agenticas por base de datos.
              </p>
            ) : activeTool === 'memory' ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(360px,480px)_1fr]">
                <div className="grid gap-3">
                  <Textarea
                    value={memoryContent}
                    onChange={(event) => setMemoryContent(event.target.value)}
                    placeholder="Contexto que el agente debe recordar de esta base: objetivo, etapa, convenciones, riesgos, tablas importantes y reglas de negocio..."
                    className="min-h-48"
                  />
                  <Input value={memoryTags} onChange={(event) => setMemoryTags(event.target.value)} placeholder="tags separados por coma" />
                  <Button disabled={pending || !memoryContent.trim()} onClick={submitMemory}>
                    {selectedMemory ? 'Actualizar memoria de BD' : 'Guardar memoria de BD'}
                  </Button>
                </div>
                <RecordList
                  items={state.memories
                    .filter((item) => item.scope === 'database')
                    .map((item) => ({
                      title: connectionLabel(connections, item.subject),
                      detail: item.content,
                    }))}
                  empty="Sin memoria por base todavia."
                />
              </div>
            ) : activeTool === 'permissions' ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(360px,480px)_1fr]">
                <div className="grid gap-3">
                  <Input value={permission.skill_id} onChange={(event) => setPermission({ ...permission, skill_id: event.target.value })} placeholder="skill_id" />
                  <Toggle label="Leer schema" checked={permission.can_read_schema} onChange={() => setPermission({ ...permission, can_read_schema: !permission.can_read_schema })} />
                  <Toggle label="Generar consultas o migraciones" checked={permission.can_generate_sql} onChange={() => setPermission({ ...permission, can_generate_sql: !permission.can_generate_sql })} />
                  <Toggle label="Ejecutar contra esta BD" checked={permission.can_execute} onChange={() => setPermission({ ...permission, can_execute: !permission.can_execute })} />
                  <Button disabled={pending || !permission.skill_id} onClick={submitPermission}>Guardar permisos para esta BD</Button>
                </div>
                <RecordList
                  items={scopedPermissions.map((item) => ({
                    title: item.skill_id,
                    detail: `schema=${item.can_read_schema} generar=${item.can_generate_sql} ejecutar=${item.can_execute}`,
                  }))}
                  empty="Sin permisos configurados para esta base."
                />
              </div>
            ) : activeTool === 'history' ? (
              <div className="rounded-lg border border-border bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
                <DatabaseZap className="mr-2 inline h-4 w-4 text-[#1A6CF6]" />
                El historial se organiza por base conectada. Para esta BD se auditaran lecturas de schema, generaciones, exportaciones y ejecuciones MCP locales sin guardar passwords ni secretos.
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-3">
                {state.environment_guards.map((guard) => (
                  <div key={guard.id} className="rounded-lg border border-border p-4">
                    <div className="mb-3 flex items-center gap-2 font-medium">
                      <ShieldCheck className="h-4 w-4 text-[#1A6CF6]" />
                      {guard.environment}
                    </div>
                    <div className="grid gap-2 text-sm">
                      <Toggle label="Backup obligatorio" checked={guard.require_backup} onChange={() => toggleGuard(guard, 'require_backup')} />
                      <Toggle label="Sandbox obligatorio" checked={guard.require_sandbox} onChange={() => toggleGuard(guard, 'require_sandbox')} />
                      <Toggle label="Permitir escritura directa" checked={guard.allow_direct_write} onChange={() => toggleGuard(guard, 'allow_direct_write')} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

function permissionScope(connectionId: string) {
  return connectionId ? `database:${connectionId}` : 'database'
}

function connectionLabel(connections: SavedConnection[], connectionId: string) {
  const connection = connections.find((item) => item.connection_id === connectionId)
  if (!connection) return connectionId
  return `${connection.alias || connection.database} / ${connection.engine}`
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={onChange} />
    </label>
  )
}

function RecordList({ items, empty }: { items: Array<{ title: string; detail: string }>; empty: string }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>
  return (
    <div className="max-h-[520px] overflow-auto rounded-lg border border-border">
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="border-b border-border p-4 last:border-b-0">
          <h3 className="text-sm font-semibold">{item.title}</h3>
          <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{item.detail}</p>
        </div>
      ))}
    </div>
  )
}
