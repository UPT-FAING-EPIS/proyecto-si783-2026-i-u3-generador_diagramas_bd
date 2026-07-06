'use client'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import Link from 'next/link'
import { Clock, MoreVertical, Trash2, RotateCcw, Cloud, HardDrive, UploadCloud, Database } from 'lucide-react'
import { getRelativeDate } from '@/lib/relativeDate'
import { getTagColor } from '@/components/ui/TagInput'
import { useState, useRef, useEffect } from 'react'
import { deleteProjectAction, restoreProjectAction, permanentlyDeleteProjectAction } from '@/lib/backend/actions/projects/delete'
import { syncAPI } from '@/lib/api/client'
import { toast } from 'sonner'

interface Project {
  id: string
  name: string
  description: string | null
  updatedAt: Date
  createdAt?: Date
  ownerId: string
  deleted_at?: string | Date | null
  isPublic?: boolean
  sourceDatabase?: string | null
  lastSyncedAt?: Date | null
}

interface ProjectCardProps {
  project: Project
  role: string
  isOwner?: boolean
  members: { id: string; name: string }[]
  tags?: string[]
  currentUser?: { id: string; name: string } | null
  onProjectsChanged?: () => void
}

const getProjectGradient = (id: string) => {
  const gradients = [
    'from-blue-50 via-sky-50 to-indigo-50 dark:from-blue-950/55 dark:via-slate-900 dark:to-indigo-950/45',
    'from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/50 dark:via-slate-900 dark:to-teal-950/40',
    'from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/40 dark:via-slate-900 dark:to-rose-950/35',
    'from-purple-50 via-violet-50 to-fuchsia-50 dark:from-purple-950/45 dark:via-slate-900 dark:to-fuchsia-950/35',
    'from-rose-50 via-pink-50 to-slate-50 dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-950',
  ]
  const charCode = id.length > 0 ? id.charCodeAt(0) + id.charCodeAt(id.length - 1) : 0;
  return gradients[charCode % gradients.length]
}

export function ProjectCard({ project, isOwner = false, tags, onProjectsChanged }: ProjectCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const isDeleted = Boolean(project.deleted_at)
  const isCloud = Boolean(project.isPublic)
  const isDatabaseDiagram = Boolean(project.sourceDatabase)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const handleDelete = async () => {
    if (!window.confirm(`¿Mover "${project.name}" a la papelera?`)) return
    const result = await deleteProjectAction(project.id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Proyecto movido a la papelera')
    onProjectsChanged?.()
  }

  const handleRestore = async () => {
    const result = await restoreProjectAction(project.id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Proyecto restaurado')
    onProjectsChanged?.()
  }

  const handlePermanentDelete = async () => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar definitivamente "${project.name}"? Esta acción no se puede deshacer.`)) return
    const result = await permanentlyDeleteProjectAction(project.id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Proyecto eliminado definitivamente')
    onProjectsChanged?.()
  }

  const handleSaveToCloud = async () => {
    try {
      await syncAPI.pushProject(project.id)
      toast.success('Proyecto subido a tu cuenta FluxSQL Web')
      onProjectsChanged?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo subir el proyecto a la nube.')
    }
  }

  return (
    <Link href={isDeleted ? '#' : `/editor?projectId=${project.id}`} onClick={(event) => { if (isDeleted) event.preventDefault() }} className="block h-full">
      <Card className={`h-full flex flex-col bg-card text-card-foreground group relative rounded-xl border border-border transition-all duration-300 ${isDeleted ? 'cursor-default opacity-80' : 'cursor-pointer hover:border-primary/60 hover:shadow-xl hover:-translate-y-1'}`}>
        <div className={`relative h-28 bg-gradient-to-br ${getProjectGradient(project.id)} flex items-end p-3 rounded-t-xl border-b border-border/70`}>
          <div
            className="absolute inset-0 rounded-t-xl"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              opacity: 0.3,
            }}
          />
          <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-border bg-card/90 shadow-sm backdrop-blur-md px-2 py-1 text-[11px] font-bold text-foreground">
            {isCloud ? <Cloud size={12} /> : <HardDrive size={12} />}
            {isCloud ? 'Nube' : 'Local'}
          </span>

          <div className="absolute top-2 right-2 z-20" ref={menuRef}>
            <button
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                setIsMenuOpen(!isMenuOpen)
              }}
              className="p-1.5 rounded-full bg-card/70 hover:bg-card transition-colors text-card-foreground shadow-sm backdrop-blur-md border border-border"
            >
              <MoreVertical size={16} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-8 z-[80] min-w-44 rounded-lg bg-popover text-popover-foreground border border-border shadow-xl py-1">
                {isDeleted ? (
                  <>
                    <button
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        setIsMenuOpen(false)
                        handleRestore()
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30 transition-colors rounded-t-lg"
                    >
                      <RotateCcw size={16} />
                      Restaurar
                    </button>
                    <button
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        setIsMenuOpen(false)
                        handlePermanentDelete()
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors rounded-b-lg border-t border-border"
                    >
                      <Trash2 size={16} />
                      Eliminar definitivamente
                    </button>
                  </>
                ) : (
                  <>
                    {!isCloud && (
                      <button
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          setIsMenuOpen(false)
                          handleSaveToCloud()
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30 transition-colors rounded-t-lg"
                      >
                        <UploadCloud size={16} />
                        Guardar en la nube
                      </button>
                    )}
                    <button
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        setIsMenuOpen(false)
                        handleDelete()
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ${isCloud ? 'rounded-lg' : 'rounded-b-lg border-t border-border'}`}
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <h3 className="text-foreground font-bold text-lg leading-tight z-10 relative">
            {project.name}
          </h3>
          {isDeleted && (
            <span className="absolute bottom-3 right-3 z-10 rounded-full border border-red-500/30 bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-200">
              Papelera
            </span>
          )}
        </div>

        <CardContent className="flex-grow pb-2 px-4 pt-4">
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {project.description}
            </p>
          )}

          <div className="mb-2 flex flex-wrap gap-1">
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              <Database size={12} />
              {isCloud ? 'Sincronizado desde Web' : isDatabaseDiagram ? project.sourceDatabase : 'Diagrama libre'}
            </span>
          </div>

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: getTagColor(tag) + '22',
                    color: getTagColor(tag),
                    border: `1px solid ${getTagColor(tag)}33`,
                  }}
                >
                  {tag}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 bg-muted/30 border-t border-border mt-auto rounded-b-xl">
          <div className="flex items-center justify-between w-full">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${isOwner ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800' : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800'}`}>
              {isOwner ? 'Propietario' : 'Proyecto'}
            </span>

            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <Clock size={14} />
              <span>Hace {getRelativeDate(project.updatedAt ?? project.createdAt)}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
