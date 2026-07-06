'use server'

import { z } from 'zod'
import { createClient } from '../../supabase/server'
import { db } from '../../db'
import { projects, collaborators, users, diagrams } from '../../db/schema'
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { logActivity } from '../activity/logActivity'

const SQL_DIALECTS = ['postgresql', 'mysql', 'sqlserver'] as const
const NOSQL_DIALECTS = ['mongodb', 'neo4j', 'json'] as const
const ALL_DIALECTS = [...SQL_DIALECTS, ...NOSQL_DIALECTS] as const

const CreateProjectSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(50, 'Maximo 50 caracteres'),
  description: z.string().max(200, 'Maximo 200 caracteres').optional(),
  tags: z.array(z.string()).optional(),
  engineFamily: z.enum(['sql', 'nosql']).default('sql'),
  dialect: z.enum(ALL_DIALECTS).optional(),
})

export async function createProjectAction(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const engineFamily = (formData.get('engineFamily') as string) || 'sql'
  const dialect = formData.get('dialect') as string | null
  let tags: string[] = []
  try { tags = JSON.parse(formData.get('tags') as string ?? '[]') } catch { tags = [] }

  const result = CreateProjectSchema.safeParse({
    name,
    description,
    tags,
    engineFamily,
    dialect: dialect || undefined,
  })

  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const allowedDialects: readonly string[] = result.data.engineFamily === 'sql' ? SQL_DIALECTS : NOSQL_DIALECTS
  const selectedDialect = result.data.dialect ?? (result.data.engineFamily === 'nosql' ? 'mongodb' : 'postgresql')

  if (!allowedDialects.includes(selectedDialect)) {
    return { error: 'El motor seleccionado no pertenece al tipo de proyecto.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  try {
    const [dbUser] = await db.select().from(users).where(eq(users.authId, user.id)).limit(1)

    if (!dbUser) {
      return { error: 'Usuario no encontrado en la base de datos' }
    }

    const newProject = await db.transaction(async (tx) => {
      const [project] = await tx.insert(projects).values({
        name: result.data.name,
        description: result.data.description || null,
        ownerId: dbUser.id,
        tags: result.data.tags ?? [],
        engineFamily: result.data.engineFamily,
      }).returning()

      await tx.insert(collaborators).values({
        projectId: project.id,
        userId: dbUser.id,
        role: 'owner',
      })

      await tx.insert(diagrams).values({
        projectId: project.id,
        name: 'Main Diagram',
        sourceCode: '',
        dialect: selectedDialect,
        flowJson: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
        mermaidString: '',
        isPublic: false,
        shareAccess: 'view',
      })

      return project
    })

    await logActivity(dbUser.id, 'project_created', newProject.id, {
      projectName: newProject.name,
    })

    revalidatePath('/dashboard')
    return { success: true, project: newProject }
  } catch (error) {
    console.error('Error creating project:', error)
    return { error: 'Error interno al crear el proyecto' }
  }
}
