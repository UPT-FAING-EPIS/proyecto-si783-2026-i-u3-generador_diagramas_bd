'use client'

import { useEffect, useState, type ElementType } from 'react'
import { ReactFlowProvider, useReactFlow, type Edge, type Node } from '@xyflow/react'
import { ArrowLeft, Braces, CheckCircle2, Code2, Database, DatabaseZap, FileJson, GitBranch, LayoutGrid, PanelRight, Play, Plus, Save, History } from 'lucide-react'
import { toast } from 'sonner'
import { Canvas } from './Canvas'
import { EditorPanel } from './EditorPanel'
import { Neo4jTopBar } from './Neo4jTopBar'
import { EditorInspector } from './EditorInspector'
import { ExportMenu } from './ExportMenu'
import { VersionHistorySheet } from './VersionHistorySheet'
import { PublicShareToggle } from './PublicShareToggle'
import { PresenceToolbar } from './PresenceToolbar'
import { DiffViewerModal } from './DiffViewerModal'
import { CollaboratorCursors } from './CollaboratorCursors'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useEditorStore } from '@/store/useEditorStore'
import { useCollaboratorCursors } from '@/hooks/useCollaboratorCursors'
import { useRealtimeSync } from '@/hooks/useRealtimeSync'
import { saveDiagramAction } from '@/lib/backend/actions/diagrams/save'
import { restoreVersionAction } from '@/lib/backend/actions/versions/restore'
import { getVersionDetailAction } from '@/lib/backend/actions/versions/detail'
import { getSchemaStats, type EditorDialect } from '@/lib/editor-schema'
import { toFlowJson } from '@/lib/flow-types'
import { parseSQL, parseJSON } from '@/lib/parsers'

interface EditorLayoutProps {
  projectName: string
  projectId: string
  initialSQL?: string
  initialNodes?: Node[]
  initialEdges?: Edge[]
  dialect?: string
  engineFamily: 'sql' | 'nosql'
  currentUser: { id: string, name: string }
  initialIsPublic?: boolean
  initialShareAccess?: 'view' | 'edit'
}

const DIALECTS: Array<{ value: EditorDialect; label: string; icon: ElementType; family: 'sql' | 'nosql' }> = [
  { value: 'postgresql', label: 'PostgreSQL', icon: Database, family: 'sql' },
  { value: 'mysql', label: 'MySQL', icon: Database, family: 'sql' },
  { value: 'sqlserver', label: 'SQL Server', icon: Database, family: 'sql' },
  { value: 'json', label: 'JSON', icon: FileJson, family: 'nosql' },
  { value: 'mongodb', label: 'MongoDB', icon: Database, family: 'nosql' },
  { value: 'neo4j', label: 'Neo4j', icon: Database, family: 'nosql' },
]

function EditorLayoutInner({
  projectName,
  projectId,
  initialSQL,
  initialNodes = [],
  initialEdges = [],
  dialect = 'postgresql',
  engineFamily,
  currentUser,
  initialIsPublic = false,
  initialShareAccess = 'view'
}: EditorLayoutProps) {
  const { toObject, fitView } = useReactFlow()
  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)
  const sqlValue = useEditorStore((state) => state.sqlValue)
  const mode = useEditorStore((state) => state.dialect)
  const setDialect = useEditorStore((state) => state.setDialect)
  const setSqlValue = useEditorStore((state) => state.setSqlValue)
  const setNodesAndEdges = useEditorStore((state) => state.setNodesAndEdges)
  const addTable = useEditorStore((state) => state.addTable)
  const syncSqlFromCanvas = useEditorStore((state) => state.syncSqlFromCanvas)
  const [saving, setSaving] = useState(false)
  const [savedLabel, setSavedLabel] = useState('Listo para editar')
  const [showSqlPanel, setShowSqlPanel] = useState(false)
  const [showInspector, setShowInspector] = useState(true)
  const [diffModal, setDiffModal] = useState<{ open: boolean; originalCode: string; modifiedCode: string; versionLabel: string } | null>(null)

  const { cursors, handleMouseMove } = useCollaboratorCursors(projectId, currentUser.id, currentUser.name)
  const { emitNodeMove, emitSqlChange, consumeRemoteSchemaUpdate } = useRealtimeSync(projectId, currentUser.id)
  const stats = getSchemaStats(nodes, edges)
  const activeDialect = DIALECTS.find((item) => item.value === mode)
  const ActiveDialectIcon = activeDialect?.icon

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    setDialect((dialect as EditorDialect) || 'postgresql')
    if (initialSQL) setSqlValue(initialSQL)
    if (initialNodes.length > 0) setNodesAndEdges(initialNodes, initialEdges)
    
    return () => {
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (nodes.length === 0) return
    if (consumeRemoteSchemaUpdate()) return

    const timeout = window.setTimeout(() => {
      emitSqlChange(nodes, edges)
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [nodes, edges, emitSqlChange, consumeRemoteSchemaUpdate])

  async function handleSave() {
    setSaving(true)
    try {
      const flowObject = toObject()
      const result = await saveDiagramAction({
        projectId,
        sqlContent: sqlValue,
        flowJson: flowObject,
        dialect: mode,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      setSavedLabel(`Guardado ${new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`)
      toast.success('Diagrama guardado correctamente')
    } catch {
      toast.error('No se pudo guardar el diagrama')
    } finally {
      setSaving(false)
    }
  }

  async function handleRestore(versionId: string) {
    if (!window.confirm('Se perderán los cambios no guardados. ¿Restaurar esta versión?')) return

    const result = await restoreVersionAction(versionId, projectId)
    if (result.error) {
      toast.error(result.error)
      return
    }

    const flow = toFlowJson(result.flowJson)
    setSqlValue(result.sqlContent ?? '')
    setNodesAndEdges(flow.nodes ?? [], flow.edges ?? [])
    toast.success(`Versión v${result.versionNumber} restaurada`)
  }

  async function handleCompare(versionId: string, versionNumber: number) {
    const result = await getVersionDetailAction(versionId)
    if (result.error || !result.data) {
      toast.error(result.error ?? 'No se pudo cargar la versión')
      return
    }

    setDiffModal({
      open: true,
      originalCode: result.data.sqlContent ?? '',
      modifiedCode: sqlValue,
      versionLabel: `v${versionNumber} vs actual`,
    })
  }

  function handleValidate() {
    if (stats.warnings > 0) {
      toast.warning(`Hay ${stats.warnings} advertencia(s): revisa claves primarias o tablas vacías.`)
      return
    }
    toast.success('Todo listo. No se encontraron errores.')
  }

  function handleManualExecute() {
    useEditorStore.getState().setUserEditedSql(true)
    const result = mode === 'json'
        ? parseJSON(sqlValue)
        : parseSQL(sqlValue, mode)
        
    if (result.errors && result.errors.length > 0) {
      toast.error(result.errors[0].message)
      return
    }
    if (result.nodes.length === 0) {
      toast.error('No se detectaron tablas/colecciones. Revisa la sintaxis.')
      return
    }
    
    // Merge positions manually (similar to useSyncEditor) to guarantee an immediate update on click
    const currentNodes = useEditorStore.getState().nodes
    const positionMap = new Map<string, { x: number; y: number }>()
    currentNodes.forEach((node) => positionMap.set(node.id, node.position))

    const newNodes: Node[] = result.nodes.map((parserNode) => ({
      ...parserNode,
      position: positionMap.get(parserNode.id) ?? parserNode.position,
    }))

    const { toReactFlowEdge } = require('@/store/useEditorStore')
    const newEdges = result.edges.map((e: Edge) => toReactFlowEdge(e))

    setNodesAndEdges(newNodes, newEdges)
    toast.success('Diagrama actualizado correctamente.')
  }

  function focusRelations() {
    useEditorStore.getState().setHoveredNodeId(null)
    fitView({ duration: 350, padding: 0.24 })
    toast.info('Mostrando todas las relaciones del diagrama.')
  }

  // Now Neo4j uses the same responsive grid as SQL, 
  // with EditorPanel on the left, canvas in the center, and inspector on the right.
  const isNeo4j = mode === 'neo4j'
  const editorGridClass = showSqlPanel && showInspector
      ? 'grid-cols-[34%_1fr_320px]'
      : showSqlPanel
        ? 'grid-cols-[34%_1fr]'
        : showInspector
          ? 'grid-cols-[1fr_320px]'
          : 'grid-cols-[1fr]'

  return (
    <div className="flex h-full w-full flex-1 overflow-hidden bg-background text-foreground" onMouseMove={handleMouseMove}>
      <aside className="flex w-14 shrink-0 flex-col items-center border-r border-border bg-card py-4">
        <Database className="mb-7 h-5 w-5 text-muted-foreground" />
        <NavButton icon={Code2} active={showSqlPanel} label="Mostrar u ocultar SQL" onClick={() => setShowSqlPanel((value) => !value)} />
        <NavButton icon={PanelRight} active={showInspector} label="Mostrar u ocultar inspector" onClick={() => setShowInspector((value) => !value)} />
        
        <VersionHistorySheet projectId={projectId} onRestore={handleRestore} onCompare={handleCompare}>
          <button
            type="button"
            title="Historial de versiones"
            className="mb-2 rounded-xl p-3 text-muted-foreground transition hover:bg-muted hover:text-[#1A6CF6]"
          >
            <History size={18} />
          </button>
        </VersionHistorySheet>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur">
          <a href="/dashboard" className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-[#1A6CF6]">
            <ArrowLeft size={17} />
          </a>
          <span className="text-sm text-muted-foreground">Proyectos</span>
          <span className="text-muted-foreground/50">/</span>
          <h1 className="max-w-52 truncate text-sm font-semibold">{projectName}</h1>

          <div className="mx-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-xs font-semibold text-foreground">
              {ActiveDialectIcon && <ActiveDialectIcon size={13} />}
              {activeDialect?.label ?? mode}
            </div>
          </div>

          <div className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
            <CheckCircle2 size={15} className="text-emerald-400" />
            {saving ? 'Guardando...' : savedLabel}
          </div>
          <PresenceToolbar projectId={projectId} currentUser={currentUser} />
          <PublicShareToggle diagramId={projectId} initialIsPublic={initialIsPublic} initialShareAccess={initialShareAccess} />
          <button
            type="button"
            onClick={() => toast.info('El generador de datos estara disponible desde FluxSQL Desktop para insertar datos en una conexion local.')}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-[#1A6CF6]"
          >
            <DatabaseZap size={14} />
            Generar datos
          </button>
          <ExportMenu projectName={projectName} />
          <ThemeToggle />
        </header>

        <section className={`grid min-h-0 flex-1 ${editorGridClass}`}>

          {/* ── ALL DIALECTS: Unified 3-column layout ── */}
          <>
            {showSqlPanel && (
              <div className="flex h-full min-w-0 flex-col border-r border-border bg-card">
                <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-3">
                  {mode !== 'mongodb' && mode !== 'neo4j' && (
                    <>
                      <button onClick={syncSqlFromCanvas} className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground hover:text-[#1A6CF6]">
                        Formatear
                      </button>
                      <button onClick={handleValidate} className="rounded-lg border border-emerald-500/20 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                        Validar
                      </button>
                    </>
                  )}
                  <button onClick={handleManualExecute} className="rounded-lg bg-[#1A6CF6] px-3 py-1.5 text-xs text-white">
                    <Play className="mr-1 inline h-3 w-3" />
                    Ejecutar
                  </button>
                  <button onClick={addTable} className="ml-auto rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" title={engineFamily === 'nosql' ? 'Agregar Colección' : 'Agregar tabla visual'}>
                    <Plus size={15} />
                  </button>
                </div>
                <div className="flex-1 min-h-0">
                  <EditorPanel mode={mode} emitSqlChange={emitSqlChange} />
                </div>
                <div className="shrink-0 border-t border-border bg-muted/40 p-3">
                  <div className={`rounded-xl border p-3 text-sm ${stats.warnings ? 'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200' : 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200'}`}>
                    <CheckCircle2 className="mr-2 inline h-4 w-4" />
                    {stats.warnings ? `${stats.warnings} advertencia(s) por revisar.` : 'Todo listo. No se encontraron errores.'}
                    <span className="ml-2 text-xs text-muted-foreground">{stats.tables} tablas/nodos · {stats.relations} relaciones</span>
                  </div>
                </div>
              </div>
            )}

            <div className="relative flex h-full min-w-0 flex-1 flex-col">
              {isNeo4j && (
                <div className="absolute top-0 left-0 w-full z-20">
                  <Neo4jTopBar />
                </div>
              )}
              {!isNeo4j && (
                <div className="absolute left-5 top-5 z-10 grid grid-cols-3 gap-2">
                  <Metric label="Tablas" value={stats.tables} />
                  <Metric label="Relaciones" value={stats.relations} />
                  <Metric label="Advertencias" value={stats.warnings} />
                </div>
              )}
              <div className={`relative min-h-0 flex-1 ${isNeo4j ? 'mt-[52px]' : ''}`}>
                <Canvas emitNodeMove={emitNodeMove} projectId={projectId} onSave={handleSave} />
              </div>
            </div>

            {showInspector && <EditorInspector />}
          </>
        </section>
      </main>

      <CollaboratorCursors cursors={cursors} />
      <DiffViewerModal
        open={diffModal?.open ?? false}
        onClose={() => setDiffModal(null)}
        originalCode={diffModal?.originalCode ?? ''}
        modifiedCode={diffModal?.modifiedCode ?? ''}
        versionLabel={diffModal?.versionLabel ?? ''}
      />
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card/90 px-4 py-2 shadow-xl shadow-black/5 backdrop-blur">
      <div className="text-lg font-semibold text-foreground">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  )
}

function NavButton({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: ElementType
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`mb-2 rounded-xl p-3 transition ${active ? 'bg-[#1A6CF6] text-white shadow-lg shadow-[#1A6CF6]/30' : 'text-muted-foreground hover:bg-muted hover:text-[#1A6CF6]'}`}
    >
      <Icon size={18} />
    </button>
  )
}

export function EditorLayout(props: EditorLayoutProps) {
  return (
    <ReactFlowProvider>
      <EditorLayoutInner {...props} />
    </ReactFlowProvider>
  )
}
