import { trackWebEvent } from '@/lib/backend/actions/telemetry/trackEvent'

export const dynamic = 'force-dynamic'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // Registra la sesión en telemetría (fire-and-forget, no bloquea el render)
  void trackWebEvent({ event: 'session_start' })

  return <div className="flex h-[100dvh] w-full flex-col overflow-hidden">{children}</div>
}

