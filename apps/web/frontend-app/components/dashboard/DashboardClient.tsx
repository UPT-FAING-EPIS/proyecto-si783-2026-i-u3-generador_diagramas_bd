'use client'

import { useMemo, useState } from 'react'
import { Plus, Search, Trash2, X } from 'lucide-react'
import { ProjectGrid } from './ProjectGrid'
import { CreateProjectModal } from './CreateProjectModal'
import { HistorialSection } from './HistorialSection'

interface ProjectItem {
  project: {
    id: string
    name: string
    description: string | null
    updatedAt: Date
    createdAt?: Date
    ownerId: string
    engineFamily?: string
    deleted_at?: string | Date | null
  }
  role: string
  members?: { id: string; name: string }[]
}

interface DashboardClientProps {
  projects: ProjectItem[]
  currentUserId: string
  currentUser?: { id: string; name: string } | null
  activeSection: string
  onSectionChange: (section: string) => void
}

export function DashboardClient({ projects, currentUserId, currentUser, activeSection }: DashboardClientProps) {
  const [query, setQuery] = useState('')
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)

  const filtered = useMemo(() => {
    let result = projects

    switch (activeSection) {
      case 'proyectos':
        result = result.filter((item) => !item.project.deleted_at)
        break
      case 'recientes':
        result = result
          .filter((item) => !item.project.deleted_at)
          .sort((a, b) => new Date(b.project.updatedAt).getTime() - new Date(a.project.updatedAt).getTime())
          .slice(0, 5)
        break
      case 'compartidos':
        result = result.filter((item) => item.role !== 'owner' && !item.project.deleted_at)
        break
      case 'papelera':
        result = result.filter((item) => item.project.deleted_at)
        break
      case 'historial':
        result = []
        break
      default:
        result = result.filter((item) => !item.project.deleted_at)
    }

    return result.filter((item) =>
      item.project.name.toLowerCase().includes(query.toLowerCase())
    )
  }, [projects, query, activeSection])

  return (
    <div>
      {activeSection === 'papelera' ? (
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Papelera</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {filtered.length} proyecto{filtered.length !== 1 ? 's' : ''} eliminado{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">Mis Proyectos</h2>
          <button
            onClick={() => setIsCreateProjectOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#1A6CF6] to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-[1px] hover:from-blue-600 hover:to-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Crear Proyecto
          </button>
        </div>
      )}
      <CreateProjectModal open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen} />

      <div className="mb-6 flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar proyectos..."
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-8 text-sm text-foreground shadow-sm outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {activeSection === 'historial' ? (
        <HistorialSection userId={currentUserId} />
      ) : activeSection === 'papelera' && filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Trash2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground">La papelera esta vacia</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Los proyectos eliminados apareceran aqui. Puedes restaurarlos cuando quieras.
          </p>
        </div>
      ) : filtered.length === 0 && query ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="mb-1 font-medium text-foreground">Sin resultados para &ldquo;{query}&rdquo;</p>
          <p className="mb-4 text-sm text-muted-foreground">Intenta con otro nombre de proyecto</p>
          <button
            onClick={() => setQuery('')}
            className="text-sm text-[#1A6CF6] transition-colors hover:opacity-80"
          >
            Limpiar busqueda
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="mb-1 font-medium text-foreground">Sin proyectos en esta seccion</p>
          <p className="text-sm text-muted-foreground">Crea un nuevo proyecto para comenzar</p>
        </div>
      ) : (
        <ProjectGrid
          projects={filtered}
          currentUserId={currentUserId}
          currentUser={currentUser}
          onCreateProject={() => document.getElementById('create-project-btn')?.click()}
        />
      )}
    </div>
  )
}
