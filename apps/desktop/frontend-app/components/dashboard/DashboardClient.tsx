'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search, LayoutGrid, List, X, Plus } from 'lucide-react'
import { ProjectGrid } from './ProjectGrid'
import { ProjectCard } from './ProjectCard'
import { ProjectListView } from './ProjectListView'
import { CreateProjectModal } from './CreateProjectModal'
import { HistorialSection } from './HistorialSection'
import { syncAPI } from '@/lib/api/client'

interface ProjectItem {
  project: {
    id: string
    name: string
    description: string | null
    updatedAt: Date
    createdAt?: Date
    ownerId: string
    tags?: string[] | null
    deleted_at?: string | Date | null
    isPublic?: boolean
    sourceDatabase?: string | null
    lastSyncedAt?: Date | null
  }
  role: string
  members?: { id: string; name: string }[]
}

interface DashboardClientProps {
  projects: ProjectItem[]
  loading: boolean
  error: string | null
  onRetry: () => void
  onProjectsChanged: () => void
  currentUserId: string
  currentUser?: { id: string; name: string } | null
  activeSection: string
  onSectionChange: (section: string) => void
}

export function DashboardClient({ projects, loading, error, onRetry, onProjectsChanged, currentUserId, currentUser, activeSection }: DashboardClientProps) {
  const [query, setQuery] = useState('')
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const isSyncingRef = useRef(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    try {
      if (typeof window === 'undefined') return 'grid'
      const saved = localStorage.getItem('dbcanvas_view_mode')
      return saved === 'grid' || saved === 'list' ? saved : 'grid'
    } catch {
      return 'grid'
    }
  })

  function handleViewMode(mode: 'grid' | 'list') {
    setViewMode(mode)
    try { localStorage.setItem('dbcanvas_view_mode', mode) } catch {}
  }

  const runAutoSync = useCallback(async () => {
    if (activeSection !== 'proyectos' || isSyncingRef.current) return
    isSyncingRef.current = true
    try {
      const account = await syncAPI.account()
      if (!account.linked) return
      const result = await syncAPI.pullCloud()
      if (result.ok) onProjectsChanged()
    } catch {
      // La sincronizacion no debe bloquear el modo local si Web no esta disponible.
    } finally {
      isSyncingRef.current = false
    }
  }, [activeSection, onProjectsChanged])

  useEffect(() => {
    const timer = window.setTimeout(() => void runAutoSync(), 0)
    const interval = window.setInterval(() => void runAutoSync(), 60_000)
    const onFocus = () => void runAutoSync()
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void runAutoSync()
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearTimeout(timer)
      window.clearInterval(interval)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [runAutoSync])

  // Filtrado según sección activa + búsqueda
  const filtered = useMemo(() => {
    let result = projects

    // Filtrar según sección
    switch (activeSection) {
      case 'proyectos':
        result = result.filter(item => !item.project.deleted_at)
        break
      case 'recientes':
        result = result
          .filter(item => !item.project.deleted_at)
          .sort((a, b) => new Date(b.project.updatedAt).getTime() - new Date(a.project.updatedAt).getTime())
          .slice(0, 5)
        break
      case 'compartidos':
        result = result.filter(item => item.role !== 'owner' && !item.project.deleted_at)
        break
      case 'papelera':
        result = result.filter(item => item.project.deleted_at)
        break
      case 'historial':
        result = []
        break
      default:
        result = result.filter(item => !item.project.deleted_at)
    }

    // Aplicar búsqueda
    return result.filter(item =>
      item.project.name.toLowerCase().includes(query.toLowerCase())
    )
  }, [projects, query, activeSection])

  const grouped = useMemo(() => {
    const visible = filtered.filter((item) => !item.project.deleted_at)
    return {
      cloud: visible.filter((item) => item.project.isPublic),
      database: visible.filter((item) => item.project.sourceDatabase && !item.project.isPublic),
      blank: visible.filter((item) => !item.project.sourceDatabase && !item.project.isPublic),
    }
  }, [filtered])

  return (
    <div>
      {/* Header: título + acciones */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-[#E2E8F0]">Mis Proyectos</h2>
        <button
          onClick={() => setIsCreateProjectOpen(true)}
          className="bg-[#1A6CF6] hover:bg-blue-700 text-white shadow-lg shadow-[#1A6CF6]/20 transition-all hover:-translate-y-[1px] flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Crear Proyecto
        </button>
      </div>
      <CreateProjectModal open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen} onCreated={onProjectsChanged} />

      {/* Toolbar: búsqueda + toggle */}
      <div className="flex items-center gap-3 mb-6">

        {/* Campo de búsqueda */}
        <div className="relative flex-1 max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: '#6B7280' }}
          />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar proyectos..."
            className="w-full pl-9 pr-8 py-2 rounded-lg text-sm text-white placeholder-[#4B5563] outline-none transition-colors"
            style={{ backgroundColor: '#111827', border: '1px solid #1E2A45' }}
            onFocus={e => (e.currentTarget.style.borderColor = '#1A6CF6')}
            onBlur={e => (e.currentTarget.style.borderColor = '#1E2A45')}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
              style={{ color: '#6B7280' }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Toggle grid/lista */}
        <div
          className="flex items-center rounded-lg overflow-hidden flex-shrink-0"
          style={{ border: '1px solid #1E2A45' }}
        >
          <button
            onClick={() => handleViewMode('grid')}
            className="p-2 transition-colors"
            style={{
              backgroundColor: viewMode === 'grid' ? '#1E2A45' : 'transparent',
              color: viewMode === 'grid' ? '#FFFFFF' : '#6B7280',
            }}
            title="Vista de grilla"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => handleViewMode('list')}
            className="p-2 transition-colors"
            style={{
              backgroundColor: viewMode === 'list' ? '#1E2A45' : 'transparent',
              color: viewMode === 'list' ? '#FFFFFF' : '#6B7280',
            }}
            title="Vista de lista"
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="py-24 text-center text-sm text-[#94A3B8]">Cargando proyectos...</div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <p className="text-sm text-red-300">{error}</p>
          <button onClick={onRetry} className="rounded-lg bg-[#1A6CF6] px-4 py-2 text-sm text-white">Reintentar</button>
        </div>
      ) : activeSection === 'historial' ? (
        <HistorialSection />
      ) : filtered.length === 0 && query ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-white font-medium mb-1">
            Sin resultados para &ldquo;{query}&rdquo;
          </p>
          <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
            Intenta con otro nombre de proyecto
          </p>
          <button
            onClick={() => setQuery('')}
            className="text-sm transition-colors hover:opacity-80"
            style={{ color: '#1A6CF6' }}
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-white font-medium mb-1">
            Sin proyectos en esta sección
          </p>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            Crea un nuevo proyecto para comenzar
          </p>
        </div>
      ) : viewMode === 'grid' && activeSection === 'proyectos' && !query ? (
        <div className="space-y-8">
          <ProjectRail title="En la nube" description="Proyectos marcados para sincronizacion o colaboracion." projects={grouped.cloud} currentUserId={currentUserId} currentUser={currentUser} onProjectsChanged={onProjectsChanged} />
          <ProjectRail title="Desde base de datos" description="Diagramas creados desde una conexion local." projects={grouped.database} currentUserId={currentUserId} currentUser={currentUser} onProjectsChanged={onProjectsChanged} />
          <ProjectRail title="Diagramas libres locales" description="Canvas sin relacion directa a una base conectada." projects={grouped.blank} currentUserId={currentUserId} currentUser={currentUser} onProjectsChanged={onProjectsChanged} />
        </div>
      ) : viewMode === 'grid' ? (
        <ProjectGrid projects={filtered} currentUserId={currentUserId} currentUser={currentUser} onProjectsChanged={onProjectsChanged} />
      ) : (
        <ProjectListView
          projects={filtered}
          currentUserId={currentUserId}
        />
      )}
    </div>
  )
}

function ProjectRail({
  title,
  description,
  projects,
  currentUserId,
  currentUser,
  onProjectsChanged,
}: {
  title: string
  description: string
  projects: ProjectItem[]
  currentUserId: string
  currentUser?: { id: string; name: string } | null
  onProjectsChanged: () => void
}) {
  if (projects.length === 0) return null
  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="text-xs text-[#6B7280]">{description}</p>
        </div>
        <span className="rounded-full border border-[#1E2A45] px-2.5 py-1 text-xs text-[#94A3B8]">{projects.length}</span>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:thin] [scrollbar-color:#334155_transparent]">
        {projects.map(({ project, role, members }) => (
          <div key={project.id} className="w-[270px] shrink-0">
            <ProjectCard
              project={project}
              role={role}
              isOwner={project.ownerId === currentUserId}
              members={members ?? []}
              tags={project.tags ?? []}
              currentUser={currentUser}
              onProjectsChanged={onProjectsChanged}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
