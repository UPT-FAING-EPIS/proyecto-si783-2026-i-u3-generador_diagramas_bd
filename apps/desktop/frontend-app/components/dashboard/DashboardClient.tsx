'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search, X, Plus, RefreshCw } from 'lucide-react'
import { ProjectGrid } from './ProjectGrid'
import { ProjectCard } from './ProjectCard'
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
  const [isSyncing, setIsSyncing] = useState(false)
  const isSyncingRef = useRef(false)

  const runAutoSync = useCallback(async () => {
    if (activeSection !== 'proyectos' || isSyncingRef.current) return
    isSyncingRef.current = true
    setIsSyncing(true)
    try {
      const account = await syncAPI.account()
      if (!account.linked) return
      const result = await syncAPI.syncCloud()
      if (result.ok) onProjectsChanged()
    } catch {
      // La sincronizacion no debe bloquear el modo local si Web no esta disponible.
    } finally {
      isSyncingRef.current = false
      setIsSyncing(false)
    }
  }, [activeSection, onProjectsChanged])



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
        <div className="flex items-center gap-2">
          <button
            onClick={() => void runAutoSync()}
            disabled={isSyncing}
            title="Traer cambios desde FluxSQL Web"
            className="bg-card hover:bg-muted text-foreground border border-border transition-all flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-[#1A6CF6]' : ''}`} />
            Sincronizar
          </button>
          <button
            onClick={() => setIsCreateProjectOpen(true)}
            className="bg-[#1A6CF6] hover:bg-blue-700 text-white shadow-lg shadow-[#1A6CF6]/20 transition-all hover:-translate-y-[1px] flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Crear Proyecto
          </button>
        </div>
      </div>
      <CreateProjectModal open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen} onCreated={onProjectsChanged} />

      {/* Toolbar: búsqueda + toggle */}
      <div className="flex items-center gap-3 mb-6">

        {/* Campo de búsqueda */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
          />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar proyectos..."
            className="w-full pl-10 pr-8 py-2 rounded-lg text-sm text-foreground bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground shadow-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          )}
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
      ) : activeSection === 'proyectos' && !query ? (
        <div className="space-y-8">
          <ProjectRail title="En la nube" description="Proyectos marcados para sincronizacion o colaboracion." projects={grouped.cloud} currentUserId={currentUserId} currentUser={currentUser} onProjectsChanged={onProjectsChanged} />
          <ProjectRail title="Desde base de datos" description="Diagramas creados desde una conexion local." projects={grouped.database} currentUserId={currentUserId} currentUser={currentUser} onProjectsChanged={onProjectsChanged} />
          <ProjectRail title="Diagramas libres locales" description="Canvas sin relacion directa a una base conectada." projects={grouped.blank} currentUserId={currentUserId} currentUser={currentUser} onProjectsChanged={onProjectsChanged} />
        </div>
      ) : (
        <ProjectGrid projects={filtered} currentUserId={currentUserId} currentUser={currentUser} onProjectsChanged={onProjectsChanged} />
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
