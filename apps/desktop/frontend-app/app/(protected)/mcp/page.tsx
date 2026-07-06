'use client'

import { useEffect, useState } from 'react'
import { Copy, Info, Network, ShieldCheck, Terminal } from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { mcpAPI } from '@/lib/api/client'

const TOOL_DETAILS: Record<string, { title: string; description: string; input: string; safety: string }> = {
  fluxy_list_connections: {
    title: 'Listar conexiones locales',
    description: 'Devuelve las conexiones guardadas en este Desktop para que un agente pueda escoger una base sin ver passwords.',
    input: 'No necesita argumentos.',
    safety: 'Solo expone alias, motor, host enmascarado, usuario y capacidades; las credenciales se quedan cifradas localmente.',
  },
  fluxy_get_database_profile: {
    title: 'Perfil de base de datos',
    description: 'Lee el perfil de una conexion: motor, entorno, capacidades disponibles y datos necesarios para resolver skills compatibles.',
    input: 'connection_id de una conexion guardada.',
    safety: 'No devuelve credenciales. Sirve para decidir que herramientas se pueden usar antes de tocar una base.',
  },
  fluxy_inspect_schema: {
    title: 'Inspeccionar schema',
    description: 'Lee tablas, columnas, claves primarias y relaciones desde una conexion local guardada.',
    input: 'conexion_id numerico de una conexion guardada.',
    safety: 'Usa credenciales cifradas dentro del sidecar y devuelve metadatos, no passwords ni cadenas de conexion.',
  },
  fluxy_read_sql: {
    title: 'SQL de solo lectura',
    description: 'Ejecuta consultas SELECT, WITH, SHOW o EXPLAIN con limite automatico para que el agente pueda inspeccionar datos de forma controlada.',
    input: 'conexion_id y una sentencia SQL de lectura.',
    safety: 'Bloquea INSERT, UPDATE, DELETE, ALTER, DROP y otras operaciones de escritura.',
  },
  fluxy_execute_sql: {
    title: 'SQL protegido',
    description: 'Permite ejecutar sentencias CREATE, INSERT o COMMENT en flujos controlados.',
    input: 'conexion_id y una unica sentencia SQL permitida.',
    safety: 'Bloquea operaciones destructivas y mantiene la ejecucion dentro del sidecar local.',
  },
  fluxy_list_skills: {
    title: 'Listar skills instaladas',
    description: 'Devuelve las skills instaladas y activas en este Desktop para que Codex, Antigravity u otro cliente MCP pueda elegir una.',
    input: 'No necesita argumentos.',
    safety: 'Respeta el estado local y la sincronizacion con FluxSQL Web cuando hay cuenta enlazada.',
  },
  fluxy_resolve_skills: {
    title: 'Resolver skills compatibles',
    description: 'Devuelve las skills instaladas y activas que aplican al motor de una base conectada.',
    input: 'conexion_id numerico de una conexion guardada.',
    safety: 'Solo combina perfil local sin secretos con el estado local de Skill Store.',
  },
  fluxy_run_skill: {
    title: 'Ejecutar skill FluxSQL',
    description: 'Ejecuta una skill instalada contra un contexto controlado, por ejemplo revisar schema, generar SQL o preparar documentacion.',
    input: 'skill_id, connection_id y parametros de ejecucion de la skill.',
    safety: 'Pasa por permisos locales y guardas de entorno antes de operaciones riesgosas.',
  },
}

export default function McpPage() {
  const [tools, setTools] = useState<string[]>([])
  const [status, setStatus] = useState('cargando')
  const [endpoint, setEndpoint] = useState('cargando')
  const [bridgePath, setBridgePath] = useState('cargando')
  const [codexConfig, setCodexConfig] = useState('{}')
  const [antigravityConfig, setAntigravityConfig] = useState('{}')
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void Promise.all([mcpAPI.health(), mcpAPI.config()])
        .then(([health, config]) => {
          setStatus(health.status)
          setTools(health.tools)
          setEndpoint(config.endpoint)
          setBridgePath(config.bridge_path)
          setCodexConfig(JSON.stringify(config.codex, null, 2))
          setAntigravityConfig(JSON.stringify(config.antigravity, null, 2))
        })
        .catch(() => setStatus('offline'))
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="flex min-h-screen bg-white text-slate-950 dark:bg-background dark:text-white">
      <DashboardSidebar userName="Usuario Local" userAvatarUrl={null} />
      <main className="flex-1 overflow-auto">
        <div className="border-b border-slate-200 bg-white px-6 py-5 dark:border-border dark:bg-accent">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A6CF6] text-white">
                <Network className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">MCP Local</h1>
                <p className="text-sm text-slate-500 dark:text-muted-foreground">Puente seguro para que agentes usen FluxSQL Desktop y tus conexiones locales.</p>
              </div>
            </div>
            <Badge variant="outline">{status}</Badge>
          </div>
        </div>

        <section className="mx-auto grid max-w-6xl gap-4 px-6 py-8 lg:grid-cols-[1fr_360px]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-border dark:bg-accent">
            <h2 className="mb-4 font-semibold">Herramientas expuestas</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {tools.map((tool) => (
                <div key={tool} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-border dark:bg-background">
                  <div className="font-mono text-xs">{tool}</div>
                  <button
                    type="button"
                    onClick={() => setSelectedTool(tool)}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#1A6CF6] hover:underline"
                  >
                    <Info className="h-3.5 w-3.5" />
                    Mas detalles
                  </button>
                </div>
              ))}
              {tools.length === 0 && <p className="text-sm text-slate-500 dark:text-muted-foreground">Esperando al sidecar local...</p>}
            </div>
          </div>

          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-border dark:bg-accent">
            <Terminal className="mb-3 h-5 w-5 text-[#1A6CF6]" />
            <h2 className="font-semibold">Beneficios</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600 dark:text-muted-foreground">
              <li>Lista conexiones locales sin revelar passwords.</li>
              <li>Permite resolver perfiles de base de datos para skills.</li>
              <li>Ejecuta skills a traves del policy engine local.</li>
              <li>Sirve como puente para agentes externos compatibles con MCP.</li>
            </ul>
            <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-100">
              <ShieldCheck className="mr-2 inline h-4 w-4" />
              Las credenciales permanecen en el sidecar local.
            </div>
          </aside>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-10 lg:grid-cols-2">
          <ConfigCard title="Codex" config={codexConfig} />
          <ConfigCard title="Antigravity / clientes MCP compatibles" config={antigravityConfig} />
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-border dark:bg-accent lg:col-span-2">
            <h2 className="font-semibold">Endpoint local</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-muted-foreground">
              Esta ruta se genera desde la instalacion actual de FluxSQL Desktop, no desde una carpeta fija de desarrollo.
            </p>
            <code className="mt-3 block rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-border dark:bg-background dark:text-muted-foreground">{bridgePath}</code>
            <code className="mt-3 block rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-border dark:bg-background dark:text-muted-foreground">{endpoint}</code>
          </div>
        </section>

        <Dialog open={Boolean(selectedTool)} onOpenChange={(open) => !open && setSelectedTool(null)}>
          <DialogContent className="max-w-2xl border-slate-200 bg-white text-slate-950 dark:border-border dark:bg-accent dark:text-white">
            {selectedTool && (
              <>
                <DialogHeader>
                  <DialogTitle>{TOOL_DETAILS[selectedTool]?.title ?? selectedTool}</DialogTitle>
                  <p className="font-mono text-xs text-slate-500 dark:text-muted-foreground">{selectedTool}</p>
                </DialogHeader>
                <div className="grid gap-3 text-sm leading-6 text-slate-600 dark:text-muted-foreground">
                  <p>{TOOL_DETAILS[selectedTool]?.description ?? 'Herramienta MCP expuesta por FluxSQL Desktop.'}</p>
                  <div className="rounded-lg border border-slate-200 p-3 dark:border-border">
                    <h3 className="font-semibold text-slate-950 dark:text-white">Entrada</h3>
                    <p>{TOOL_DETAILS[selectedTool]?.input ?? 'Depende de la herramienta MCP.'}</p>
                  </div>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-900 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-100">
                    <h3 className="font-semibold">Seguridad</h3>
                    <p>{TOOL_DETAILS[selectedTool]?.safety ?? 'Se ejecuta dentro del sidecar local con las reglas de FluxSQL.'}</p>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

function ConfigCard({ title, config }: { title: string; config: string }) {
  function copy() {
    void navigator.clipboard?.writeText(config)
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-border dark:bg-accent">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-semibold">{title}</h2>
        <Button variant="outline" size="sm" onClick={copy}>
          <Copy className="mr-2 h-4 w-4" />
          Copiar
        </Button>
      </div>
      <pre className="max-h-72 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700 dark:border-border dark:bg-background dark:text-muted-foreground">
        <code>{config}</code>
      </pre>
    </article>
  )
}
