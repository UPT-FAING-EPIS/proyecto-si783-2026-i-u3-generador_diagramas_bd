'use client'

import { useDesktopTelemetry } from '@/lib/telemetry'

interface DesktopTelemetryProviderProps {
  children: React.ReactNode
  userId?: string | null
}

/**
 * Provider que activa el tracking de telemetría para el desktop.
 * Se monta dentro del layout protegido, DESPUÉS de que ClientInitProvider
 * confirma que el backend local está disponible.
 */
export function DesktopTelemetryProvider({ children, userId }: DesktopTelemetryProviderProps) {
  useDesktopTelemetry({ userId })
  return <>{children}</>
}
