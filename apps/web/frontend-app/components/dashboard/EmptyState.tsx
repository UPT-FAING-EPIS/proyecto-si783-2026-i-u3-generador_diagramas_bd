'use client'

import { useState } from 'react'
import { Database } from 'lucide-react'
import { CreateProjectModal } from './CreateProjectModal'

export function EmptyState() {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-border rounded-xl bg-card mt-8">
      <div className="bg-[#1A6CF6]/10 p-4 rounded-full mb-4">
        <Database className="w-12 h-12 text-[#1A6CF6]" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">Aun no tienes proyectos</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Crea tu primer diagrama de base de datos para empezar a organizar y visualizar tus esquemas.
      </p>
      <CreateProjectModal open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen} />
    </div>
  )
}
