import { redirect } from 'next/navigation'
import { createClient } from '@/lib/backend/supabase/server'
import { isAdmin } from '@/lib/backend/guards/adminGuard'
import { getAnalyticsData } from '@/lib/backend/actions/telemetry/getAnalyticsData'
import { IS_MOCK_MODE } from '@/lib/backend/actions/telemetry/config'
import { MockDataBadge } from '@/components/analytics/MockDataBadge'
import { AnalyticsDashboardClient } from '@/components/analytics/AnalyticsDashboardClient'
import { logoutAction } from '@/lib/backend/actions/auth/logout'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LogOut } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Analytics — FluxSQL Admin',
  description: 'Dashboard de telemetría y métricas de uso de FluxSQL',
}

export default async function AnalyticsPage() {
  // 1. Verificar autenticación con Supabase
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Guard de admin — redirige si no tiene acceso
  if (!isAdmin(user?.email)) {
    redirect('/dashboard')
  }

  // 3. Obtener datos (mock o reales según ANALYTICS_DATA_SOURCE)
  const summary = await getAnalyticsData()

  const now = new Date().toLocaleString('es-MX', {
    dateStyle: 'long',
    timeStyle: 'short',
  })

  return (
    <div className="flex min-h-screen bg-[#F8F9FD] text-slate-900 overflow-hidden font-sans">
      <AnalyticsDashboardClient summary={summary} />
    </div>
  )
}
