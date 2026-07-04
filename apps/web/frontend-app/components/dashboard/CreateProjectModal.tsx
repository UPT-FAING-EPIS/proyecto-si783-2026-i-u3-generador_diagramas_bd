'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createProjectAction } from '@/lib/backend/actions/projects/create'
import { TagInput } from '@/components/ui/TagInput'
import { Database, Braces, ArrowLeft } from 'lucide-react'

interface CreateProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type EngineFamily = 'sql' | 'nosql'

export function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [step, setStep] = useState<'select' | 'form'>('select')
  const [engineFamily, setEngineFamily] = useState<EngineFamily>('sql')

  function handleSelectFamily(family: EngineFamily) {
    setEngineFamily(family)
    setStep('form')
  }

  function handleBack() {
    setStep('select')
    setError(null)
  }

  function handleClose(open: boolean) {
    if (!open) {
      setStep('select')
      setError(null)
      setTags([])
    }
    onOpenChange(open)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('tags', JSON.stringify(tags))
    formData.set('engineFamily', engineFamily)
    const result = await createProjectAction(formData)

    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    } else {
      handleClose(false)
      setIsPending(false)
      setTags([])
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] bg-background border-border text-foreground p-0 shadow-xl overflow-hidden rounded-xl">

        {/* ── STEP 1: Selector SQL / NoSQL ── */}
        {step === 'select' && (
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Nuevo Proyecto</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Selecciona el tipo de base de datos para tu proyecto.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 pt-6">
              {/* SQL Card */}
              <button
                type="button"
                onClick={() => handleSelectFamily('sql')}
                className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-6 transition-all hover:border-primary hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1A6CF6]/10 text-[#1A6CF6] transition-colors group-hover:bg-[#1A6CF6]/20">
                  <Database size={28} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">SQL</p>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-tight">
                    PostgreSQL, MySQL, SQL Server
                  </p>
                </div>
              </button>

              {/* NoSQL Card */}
              <button
                type="button"
                onClick={() => handleSelectFamily('nosql')}
                className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-6 transition-all hover:border-emerald-500 hover:bg-emerald-500/5 hover:shadow-lg hover:shadow-emerald-500/10"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 transition-colors group-hover:bg-emerald-500/20">
                  <Braces size={28} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">NoSQL</p>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-tight">
                    MongoDB, Neo4j
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Form ── */}
        {step === 'form' && (
          <div className="p-6">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <ArrowLeft size={16} />
                </button>
                <DialogTitle className="text-xl font-bold text-foreground">
                  Proyecto {engineFamily === 'sql' ? 'SQL' : 'NoSQL'}
                </DialogTitle>
                <span className={`ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  engineFamily === 'sql'
                    ? 'bg-blue-50 text-[#1A6CF6] border border-blue-200'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}>
                  {engineFamily === 'sql' ? 'SQL' : 'NoSQL'}
                </span>
              </div>
              <DialogDescription className="text-muted-foreground">
                Ingresa los detalles para tu nuevo diagrama de base de datos.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground font-medium">Nombre <span className="text-red-500">*</span></Label>
                <Input 
                  id="name" 
                  name="name" 
                  required 
                  maxLength={50}
                  placeholder={engineFamily === 'sql' ? 'Ej. Sistema de Ventas' : 'Ej. Catálogo de Productos'}
                  className="bg-background border-border focus-visible:ring-primary focus-visible:border-primary text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground font-medium">Descripción (opcional)</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  maxLength={200}
                  placeholder="Un breve resumen del proyecto..."
                  className="bg-background border-border focus-visible:ring-primary focus-visible:border-primary text-foreground resize-none"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Tags <span className="text-muted-foreground font-normal">(opcional)</span>
                </Label>
                <TagInput value={tags} onChange={setTags} />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => handleClose(false)}
                  className="hover:bg-muted hover:text-foreground text-muted-foreground"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className={`min-w-[140px] text-primary-foreground ${
                    engineFamily === 'sql'
                      ? 'bg-primary hover:bg-primary/90'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {isPending ? 'Creando...' : 'Crear Proyecto'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
