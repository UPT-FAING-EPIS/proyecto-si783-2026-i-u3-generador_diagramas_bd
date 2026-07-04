// removed force-dynamic

import { ClientInitProvider } from '@/components/providers/ClientInitProvider'
import { DesktopTelemetryProvider } from '@/components/providers/DesktopTelemetryProvider'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientInitProvider>
      <DesktopTelemetryProvider>
        <div className="h-full min-h-screen">{children}</div>
      </DesktopTelemetryProvider>
    </ClientInitProvider>
  )
}

