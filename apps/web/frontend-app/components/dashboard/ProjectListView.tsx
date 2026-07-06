'use client'

import { getRelativeDate } from '@/lib/relativeDate'

interface ProjectItem {
  project: {
    id: string
    name: string
    description: string | null
    updatedAt: Date
    createdAt?: Date
    ownerId: string
  }
  role: string
  members?: { id: string; name: string }[]
}

interface ProjectListViewProps {
  projects: ProjectItem[]
  currentUserId: string
}

export function ProjectListView({ projects }: ProjectListViewProps) {
  return (
    <div className="flex flex-col gap-1">
      {projects.map(item => (
        <a
          key={item.project.id}
          href={`/editor/${item.project.id}`}
          className="group flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 text-card-foreground transition-all hover:border-[#1A6CF6]/60 hover:shadow-sm"
        >
          {/* Miniatura */}
          <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#1A6CF6] to-violet-600">
            <span className="text-white text-xs font-bold">
              {item.project.name.slice(0, 2).toUpperCase()}
            </span>
          </div>

          {/* Nombre + descripción */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{item.project.name}</p>
            {item.project.description && (
              <p className="text-xs truncate text-muted-foreground">
                {item.project.description}
              </p>
            )}
          </div>

          {/* Badge rol */}
          <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 border ${
            item.role === 'owner'
              ? 'bg-blue-50 text-[#1A6CF6] border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
          }`}>
            {item.role === 'owner' ? 'Propietario' : 'Colaborador'}
          </span>

          {/* Fecha */}
          <span className="text-xs flex-shrink-0 text-muted-foreground">
            {getRelativeDate(item.project.updatedAt ?? item.project.createdAt ?? new Date())}
          </span>
        </a>
      ))}
    </div>
  )
}
