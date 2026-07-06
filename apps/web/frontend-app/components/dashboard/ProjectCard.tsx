'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { InviteCollaboratorModal } from './InviteCollaboratorModal'
import { Clock, MoreVertical, Trash2, RotateCcw, UserPlus, Pencil, Link as LinkIcon } from 'lucide-react'
import { getRelativeDate } from '@/lib/relativeDate'
import { getTagColor } from '@/components/ui/TagInput'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { deleteProjectAction, restoreProjectAction } from '@/lib/backend/actions/projects/delete'
import { renameProject } from '@/lib/backend/actions/projects/update'
import { toast } from 'sonner'

interface Project {
  id: string
  name: string
  description: string | null
  updatedAt: Date
  createdAt?: Date
  ownerId: string
  engineFamily?: string
  deleted_at?: string | Date | null
}

interface ProjectCardProps {
  project: Project
  role: string
  isOwner?: boolean
  members: { id: string; name: string }[]
  tags?: string[]
  currentUser?: { id: string; name: string } | null
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

export function ProjectCard({ project, role, isOwner = false, members, tags, currentUser }: ProjectCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(project.name)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Cerrar menú al hacer clic fuera
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
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    setIsProcessing(true)
    const result = await deleteProjectAction(project.id)
    setIsProcessing(false)
    setIsMenuOpen(false)
    setShowDeleteConfirm(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Proyecto movido a la papelera')
      router.refresh()
    }
  }

  const handleRename = async () => {
    if (!isRenaming) {
      setIsRenaming(true)
      setIsMenuOpen(false)
      return
    }

    if (!newName.trim()) {
      toast.error('El nombre del proyecto no puede estar vacío')
      return
    }

    setIsProcessing(true)
    const result = await renameProject(project.id, newName.trim())
    setIsProcessing(false)
    setIsRenaming(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Proyecto renombrado correctamente')
      router.refresh()
    }
  }

  const handleCopyLink = async () => {
    const publicLink = `${window.location.origin}/public/${project.id}`
    
    try {
      await navigator.clipboard.writeText(publicLink)
      setCopied(true)
      toast.success('✓ Link copiado')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Error al copiar el link')
    }
    setIsMenuOpen(false)
  }

  const handleRestore = async () => {
    setIsProcessing(true)
    const result = await restoreProjectAction(project.id)
    setIsProcessing(false)
    setIsMenuOpen(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Proyecto restaurado correctamente')
      router.refresh()
    }
  }

  const handleDeletePermanent = async () => {
    // TODO: Implementar eliminación permanente cuando se requiera
    toast.info('Función de eliminación permanente próximamente')
    setIsMenuOpen(false)
  }

  function handleOpenProject() {
    if (isRenaming || isMenuOpen || isInviteOpen || isProcessing) return
    router.push(`/editor/${project.id}`)
  }

  return (
      <Card
        role="button"
        tabIndex={0}
        onClick={handleOpenProject}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleOpenProject()
          }
        }}
        className="h-full flex flex-col p-0 gap-0 overflow-hidden bg-card text-card-foreground group relative rounded-xl border border-border hover:border-[#1A6CF6]/60 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-950/25 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      >
        {/* PORTADA CON GRADIENTE Y BADGES ABSOLUTOS */}
        <div className={`relative h-28 bg-gradient-to-br ${getProjectGradient(project.id)} flex items-end p-3 border-b border-border/70`}>
          
          {/* Badge Plan (esquina superior izquierda) */}
          <div className="absolute top-3 left-3 z-10">
            <div className={`text-xs font-bold px-3 py-1 rounded-full shadow-sm backdrop-blur-md ${
              role === 'owner' 
                ? 'bg-card/90 text-card-foreground border border-border' 
                : 'bg-card/90 text-card-foreground border border-border'
            }`}>
              {role === 'owner' ? 'Pro' : 'Free'}
            </div>
            {project.engineFamily && (
              <div className={`mt-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm backdrop-blur-md ${
                project.engineFamily === 'nosql'
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-blue-100 text-[#1A6CF6] border border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800'
              }`}>
                {project.engineFamily === 'nosql' ? 'NoSQL' : 'SQL'}
              </div>
            )}
          </div>

          {/* MENÚ DE 3 PUNTOS (reemplaza botón Invitar) */}
          {role === 'owner' && (
            <div 
              className="absolute top-2 right-2 z-20"
              ref={menuRef}
            >
              {/* Botón MoreVertical */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsMenuOpen(!isMenuOpen)
                }}
                className="p-1.5 rounded-full bg-card/70 hover:bg-card transition-colors text-card-foreground shadow-sm backdrop-blur-md border border-border"
                disabled={isProcessing}
              >
                <MoreVertical size={16} />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 top-8 z-50 min-w-40 rounded-lg bg-popover text-popover-foreground border border-border shadow-xl py-1">
                  {!project.deleted_at ? (
                    <>
                      {/* Opción: Invitar Colaborador */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setIsMenuOpen(false)
                          setIsInviteOpen(true)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
                      >
                        <UserPlus size={16} />
                        Invitar colaborador
                      </button>

                      {/* Opción: Renombrar Proyecto */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setIsMenuOpen(false)
                          setIsRenaming(true)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
                      >
                        <Pencil size={16} />
                        Renombrar proyecto
                      </button>

                      {/* Opción: Copiar Link Público */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleCopyLink()
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
                      >
                        <LinkIcon size={16} />
                        Copiar link público
                      </button>

                      {/* Separador */}
                      <div className="border-t border-border my-1"></div>
                      {showDeleteConfirm ? (
                        <div className="px-4 py-2 text-sm">
                          <p className="text-popover-foreground mb-2">¿Mover a papelera?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setShowDeleteConfirm(false)
                                setIsMenuOpen(false)
                              }}
                              className="flex-1 px-2 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDelete()
                              }}
                              className="flex-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                              disabled={isProcessing}
                            >
                              {isProcessing ? 'Eliminando...' : 'Confirmar'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDelete()
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <Trash2 size={16} />
                          Eliminar proyecto
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Opción: Restaurar Proyecto */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleRestore()
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30 transition-colors disabled:opacity-50"
                        disabled={isProcessing}
                      >
                        <RotateCcw size={16} />
                        {isProcessing ? 'Restaurando...' : 'Restaurar proyecto'}
                      </button>

                      {/* Separador */}
                      <div className="border-t border-border my-1"></div>

                      {/* Opción: Eliminar Permanente */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleDeletePermanent()
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <Trash2 size={16} />
                        Eliminar permanente
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Input inline para renombrar */}
          {isRenaming && (
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-30 rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-background p-4 rounded-lg border border-border shadow-xl w-80">
                <input
                  ref={inputRef}
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleRename()
                    } else if (e.key === 'Escape') {
                      e.preventDefault()
                      setIsRenaming(false)
                      setNewName(project.name)
                    }
                  }}
                  className="w-full px-3 py-2 bg-background text-foreground rounded border border-border focus:border-primary outline-none"
                  placeholder="Nuevo nombre del proyecto"
                  autoFocus
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsRenaming(false)
                      setNewName(project.name)
                    }}
                    className="flex-1 px-3 py-1 text-sm bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRename()
                    }}
                    className="flex-1 px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <CardContent className="flex-grow pb-2 px-4 pt-4">
          {/* Nombre del proyecto */}
          {!isRenaming && (
            <h3 className="text-foreground font-bold text-lg leading-tight mb-2">
              {project.name}
            </h3>
          )}
          {/* Description */}
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {project.description}
            </p>
          )}
          
          {/* Tags si existen */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: getTagColor(tag) + '22',
                    color: getTagColor(tag),
                    border: `1px solid ${getTagColor(tag)}33`,
                  }}>
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

        <CardFooter className="p-4 bg-muted/30 border-t border-border mt-auto">
          <div className="flex items-center justify-between w-full">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
              isOwner 
                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800'
                : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800'
            }`}>
              {isOwner ? 'Propietario' : 'Colaborador'}
            </span>

            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <Clock size={14} />
              <span>Hace {getRelativeDate(project.updatedAt ?? project.createdAt)}</span>
            </div>
          </div>
        </CardFooter>

        {/* InviteCollaboratorModal controlado por estado */}
        {isInviteOpen && (
          <InviteCollaboratorModal 
            projectId={project.id} 
            open={isInviteOpen}
            onOpenChange={setIsInviteOpen}
          />
        )}
      </Card>
  )
}
