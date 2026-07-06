"use server"

import { db } from '../../db'
import { projects, users } from '../../db/schema'
import { eq, and, ne } from 'drizzle-orm'
import { createClient } from '../../supabase/server'
import { revalidatePath } from 'next/cache'

export async function renameProject(
  projectId: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autorizado' }
  }

  if (!name || name.trim().length === 0) {
    return { success: false, error: 'El nombre del proyecto no puede estar vacío' }
  }

  if (name.trim().length > 100) {
    return { success: false, error: 'El nombre del proyecto no puede exceder 100 caracteres' }
  }

  try {
    const [dbUser] = await db.select().from(users).where(eq(users.authId, user.id)).limit(1)
    if (!dbUser) {
      return { success: false, error: 'Usuario no encontrado en la base de datos' }
    }

    // Verificar que el usuario sea owner del proyecto
    const [project] = await db
      .select({ ownerId: projects.ownerId })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1)

    if (!project || project.ownerId !== dbUser.id) {
      return { success: false, error: 'No tienes permisos para renombrar este proyecto' }
    }

    // Verificar que no exista otro proyecto con el mismo nombre para este usuario
    const [existingProject] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(
        eq(projects.ownerId, dbUser.id),
        eq(projects.name, name.trim()),
        ne(projects.id, projectId)
      ))
      .limit(1)

    if (existingProject) {
      return { success: false, error: 'Ya tienes un proyecto con ese nombre' }
    }

    // Actualizar nombre del proyecto
    await db
      .update(projects)
      .set({ 
        name: name.trim(),
        updatedAt: new Date()
      })
      .where(eq(projects.id, projectId))

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Rename project error:', error)
    return { success: false, error: 'Error al renombrar el proyecto' }
  }
}
