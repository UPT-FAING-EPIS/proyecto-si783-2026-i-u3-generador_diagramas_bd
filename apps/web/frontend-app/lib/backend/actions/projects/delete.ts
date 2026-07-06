'use server'

import { db } from '../../db'
import { projects, users } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { createClient } from '../../supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteProjectAction(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autorizado' }
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
      return { success: false, error: 'No tienes permisos para eliminar este proyecto' }
    }

    // Mover a papelera (soft delete)
    await db
      .update(projects)
      .set({ deleted_at: new Date() })
      .where(eq(projects.id, projectId))

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Delete project error:', error)
    return { success: false, error: 'Error al eliminar el proyecto' }
  }
}

export async function restoreProjectAction(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autorizado' }
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
      return { success: false, error: 'No tienes permisos para restaurar este proyecto' }
    }

    // Restaurar de papelera (unset deleted_at)
    await db
      .update(projects)
      .set({ deleted_at: null })
      .where(eq(projects.id, projectId))

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Restore project error:', error)
    return { success: false, error: 'Error al restaurar el proyecto' }
  }
}
