'use server'

import { db } from '@/lib/backend/db'
import { telemetryEvents } from '@/lib/backend/db/schema'
import { createClient } from '@/lib/backend/supabase/server'
import { users } from '@/lib/backend/db/schema'
import { eq } from 'drizzle-orm'

export type TelemetryEvent = 'session_start' | 'page_view' | 'session_end'

interface TrackEventOptions {
  event?: TelemetryEvent
  metadata?: Record<string, unknown>
}

/**
 * Registra un evento de telemetría para la plataforma web.
 * Funciona tanto para usuarios autenticados como anónimos.
 * Se llama desde Server Components / layouts (no hace round-trip al cliente).
 */
export async function trackWebEvent(options: TrackEventOptions = {}): Promise<void> {
  try {
    const { event = 'session_start', metadata = {} } = options

    let dbUserId: string | null = null

    // Intentar obtener el usuario autenticado (si existe)
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const [dbUser] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.authId, user.id))
          .limit(1)
        dbUserId = dbUser?.id ?? null
      }
    } catch {
      // Sin sesión activa → sesión anónima (userId null)
    }

    await db.insert(telemetryEvents).values({
      userId: dbUserId,
      platform: 'web',
      event,
      metadata,
    })
  } catch (err) {
    // Silenciar errores de telemetría para no afectar la UX
    console.error('[Telemetry] Error tracking web event:', err)
  }
}
