'use client'

import { useEffect, useRef } from 'react'

const TELEMETRY_ENDPOINT =
  process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/telemetry/event`
    : 'http://localhost:3001/telemetry/event'

interface TrackEventPayload {
  userId?: string | null
  platform: 'desktop'
  event: 'session_start' | 'page_view' | 'session_end'
  metadata?: Record<string, unknown>
}

/**
 * Envía un evento de telemetría al backend NestJS desde el cliente desktop (Tauri).
 * No lanza errores — falla silenciosamente para no afectar la UX.
 */
async function sendTelemetryEvent(payload: TrackEventPayload): Promise<void> {
  try {
    await fetch(TELEMETRY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // keepalive para que el envío no se cancele si la página cambia
      keepalive: true,
    })
  } catch {
    // Silenciar errores de red (modo offline, servidor no disponible, etc.)
  }
}

interface UseDesktopTelemetryOptions {
  userId?: string | null
}

/**
 * Hook que registra session_start al montar y session_end al desmontar
 * el componente. Diseñado para usarse en el layout protegido del desktop.
 */
export function useDesktopTelemetry({ userId }: UseDesktopTelemetryOptions = {}) {
  const hasFired = useRef(false)

  useEffect(() => {
    // Evitar doble disparo en StrictMode
    if (hasFired.current) return
    hasFired.current = true

    sendTelemetryEvent({
      userId: userId ?? null,
      platform: 'desktop',
      event: 'session_start',
      metadata: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        timestamp: new Date().toISOString(),
      },
    })

    return () => {
      sendTelemetryEvent({
        userId: userId ?? null,
        platform: 'desktop',
        event: 'session_end',
      })
    }
  }, [userId])
}
