'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createProjectAction } from '@/lib/backend/actions/projects/create'
import { TagInput } from '@/components/ui/TagInput'
import { ArrowLeft, Braces, Database, FileJson, GitBranch } from 'lucide-react'
import type { EditorDialect } from '@/lib/editor-schema'

interface CreateProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type EngineFamily = 'sql' | 'nosql'
type DialectOption = {
  value: EditorDialect
  label: string
  description: string
  icon: typeof Database
}

const SQL_DIALECTS: DialectOption[] = [
  { value: 'postgresql', label: 'PostgreSQL', description: 'Recomendado para Supabase y SQL estandar.', icon: Database },
  { value: 'mysql', label: 'MySQL', description: 'Ideal para apps web clasicas y MariaDB.', icon: Database },
  { value: 'sqlserver', label: 'SQL Server', description: 'Para entornos Microsoft y T-SQL.', icon: Database },
]

const NOSQL_DIALECTS: DialectOption[] = [
  { value: 'mongodb', label: 'MongoDB', description: 'Recomendado para colecciones y documentos.', icon: Braces },
  { value: 'neo4j', label: 'Neo4j', description: 'Para grafos con nodos y relaciones fuertes.', icon: GitBranch },
  { value: 'json', label: 'JSON', description: 'Flexible para importar o bosquejar estructuras.', icon: FileJson },
]

const DEFAULT_DIALECT_BY_FAMILY: Record<EngineFamily, EditorDialect> = {
  sql: 'postgresql',
  nosql: 'mongodb',
}

export function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [step, setStep] = useState<'select' | 'form'>('select')
  const [engineFamily, setEngineFamily] = useState<EngineFamily>('sql')
  const [dialect, setDialect] = useState<EditorDialect>('postgresql')

  const dialectOptions = engineFamily === 'sql' ? SQL_DIALECTS : NOSQL_DIALECTS
  const selectedDialect = dialectOptions.find((option) => option.value === dialect) ?? dialectOptions[0]

  function handleSelectFamily(family: EngineFamily) {
    setEngineFamily(family)
    setDialect(DEFAULT_DIALECT_BY_FAMILY[family])
    setStep('form')
  }

  function handleBack() {
    setStep('select')
    setError(null)
  }

  function handleClose(openState: boolean) {
    if (!openState) {
      setStep('select')
      setError(null)
      setTags([])
      setEngineFamily('sql')
      setDialect('postgresql')
    }
    onOpenChange(openState)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('tags', JSON.stringify(tags))
    formData.set('engineFamily', engineFamily)
    formData.set('dialect', dialect)
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
      <DialogContent className="sm:max-w-[520px] bg-background border-border text-foreground p-0 shadow-xl overflow-hidden rounded-xl">
        {step === 'select' && (
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Nuevo Proyecto</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Selecciona el tipo de base de datos para tu proyecto.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 pt-6">
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
                    MongoDB, Neo4j, JSON
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

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
                    ? 'bg-blue-50 text-[#1A6CF6] border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30'
                }`}>
                  {selectedDialect.label}
                </span>
              </div>
              <DialogDescription className="text-muted-foreground">
                Elige el motor para abrir el editor con el dialecto correcto desde el inicio.
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
                  placeholder={engineFamily === 'sql' ? 'Ej. Sistema de Ventas' : 'Ej. Catalogo de Productos'}
                  className="bg-background border-border focus-visible:ring-primary focus-visible:border-primary text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground font-medium">Motor / base de datos</Label>
                <div className="grid gap-2">
                  {dialectOptions.map(({ value, label, description, icon: Icon }) => {
                    const active = dialect === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setDialect(value)}
                        className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${
                          active
                            ? engineFamily === 'sql'
                              ? 'border-primary bg-primary/10 shadow-sm shadow-primary/10'
                              : 'border-emerald-500 bg-emerald-500/10 shadow-sm shadow-emerald-500/10'
                            : 'border-border bg-card hover:bg-muted'
                        }`}
                      >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          active
                            ? engineFamily === 'sql'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-emerald-600 text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <Icon size={17} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-foreground">{label}</span>
                          <span className="block text-xs leading-snug text-muted-foreground">{description}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground font-medium">Descripcion (opcional)</Label>
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
                <div className="bg-red-50 border border-red-200 p-3 rounded-md dark:bg-red-500/10 dark:border-red-500/30">
                  <p className="text-red-600 text-sm font-medium dark:text-red-300">{error}</p>
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
