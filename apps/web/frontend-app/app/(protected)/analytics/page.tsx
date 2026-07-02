import { redirect } from 'next/navigation'
import { createClient } from '@/lib/backend/supabase/server'
import { isAdmin } from '@/lib/backend/guards/adminGuard'
import { getAnalyticsSummary } from '@/lib/backend/actions/telemetry/getAnalyticsSummary'
import { MetricCard } from '@/components/analytics/MetricCard'
import { SessionsChart } from '@/components/analytics/SessionsChart'
import { NewUsersChart } from '@/components/analytics/NewUsersChart'
import { PlatformBreakdown } from '@/components/analytics/PlatformBreakdown'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Analytics — Fluxy Admin',
  description: 'Dashboard de telemetría y métricas de uso de Fluxy',
}

// ── Íconos SVG inline ────────────────────────────────────────────────────────

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

function MonitorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function DiagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M17.5 17.5v-4M17.5 13.5h-4M6.5 10.5v3" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default async function AnalyticsPage() {
  // 1. Autenticación
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 2. Guard de admin — redirige si no es admin
  if (!isAdmin(user?.email)) {
    redirect('/dashboard')
  }

  // 3. Cargar datos
  const summary = await getAnalyticsSummary()

  const now = new Date().toLocaleString('es-MX', {
    dateStyle: 'long',
    timeStyle: 'short',
  })

  return (
    <div className="min-h-screen bg-[#060a10] text-white">
      {/* Header */}
      <header className="border-b border-slate-800/60 bg-[#060a10]/80 px-6 py-4 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              {/* Logo pulse */}
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <h1 className="text-lg font-semibold tracking-tight">Fluxy Analytics</h1>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-amber-400">
                Admin
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">Actualizado: {now}</p>
          </div>
          <a
            href="/dashboard"
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 transition hover:border-slate-500 hover:text-white"
          >
            ← Volver al dashboard
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        {/* ── Usuarios ── */}
        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Usuarios
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total usuarios"
              value={summary.totalUsers}
              icon={<UsersIcon />}
              accent="blue"
              trend={{ value: summary.newUsersToday, label: 'nuevos hoy', positive: true }}
            />
            <MetricCard
              title="Activos hoy"
              value={summary.activeToday}
              subtitle="Usuarios autenticados"
              icon={<ActivityIcon />}
              accent="emerald"
            />
            <MetricCard
              title="Activos (7 días)"
              value={summary.active7d}
              icon={<ActivityIcon />}
              accent="violet"
            />
            <MetricCard
              title="Activos (30 días)"
              value={summary.active30d}
              icon={<ActivityIcon />}
              accent="amber"
            />
          </div>
        </section>

        {/* ── Sesiones ── */}
        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Sesiones
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MetricCard
              title="Sesiones web"
              value={summary.webSessionsTotal}
              icon={<GlobeIcon />}
              accent="blue"
            />
            <MetricCard
              title="Sesiones desktop"
              value={summary.desktopSessionsTotal}
              icon={<MonitorIcon />}
              accent="violet"
            />
            <MetricCard
              title="Sesiones anónimas"
              value={summary.anonymousSessionsTotal}
              subtitle="Sin usuario autenticado"
              icon={<UsersIcon />}
              accent="rose"
            />
          </div>
        </section>

        {/* ── Contenido ── */}
        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Contenido
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <MetricCard
              title="Proyectos totales"
              value={summary.totalProjects}
              icon={<FolderIcon />}
              accent="emerald"
            />
            <MetricCard
              title="Diagramas totales"
              value={summary.totalDiagrams}
              icon={<DiagramIcon />}
              accent="amber"
            />
          </div>
        </section>

        {/* ── Gráficos ── */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Sesiones por día */}
          <div className="rounded-2xl border border-slate-800/60 bg-[#0d1117] p-6">
            <h3 className="mb-1 text-sm font-semibold text-white">Sesiones por día</h3>
            <p className="mb-4 text-xs text-slate-500">Últimos 30 días · Web vs Desktop</p>
            <SessionsChart data={summary.dailySessions} />
          </div>

          {/* Nuevos usuarios por día */}
          <div className="rounded-2xl border border-slate-800/60 bg-[#0d1117] p-6">
            <h3 className="mb-1 text-sm font-semibold text-white">Nuevos usuarios por día</h3>
            <p className="mb-4 text-xs text-slate-500">Últimos 30 días</p>
            <NewUsersChart data={summary.dailyNewUsers} />
          </div>
        </section>

        {/* ── Distribución de plataformas ── */}
        <section>
          <div className="rounded-2xl border border-slate-800/60 bg-[#0d1117] p-6">
            <h3 className="mb-1 text-sm font-semibold text-white">Distribución por plataforma</h3>
            <p className="mb-6 text-xs text-slate-500">Total de todas las sesiones registradas</p>
            <PlatformBreakdown
              web={summary.webSessionsTotal}
              desktop={summary.desktopSessionsTotal}
              anonymous={summary.anonymousSessionsTotal}
            />
          </div>
        </section>

        {/* ── Crecimiento resumen ── */}
        <section>
          <div className="rounded-2xl border border-slate-800/60 bg-[#0d1117] p-6">
            <h3 className="mb-4 text-sm font-semibold text-white">Crecimiento de usuarios</h3>
            <div className="grid grid-cols-3 divide-x divide-slate-800">
              {[
                { label: 'Hoy', value: summary.newUsersToday },
                { label: '7 días', value: summary.newUsers7d },
                { label: '30 días', value: summary.newUsers30d },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center py-4 first:pl-0">
                  <span className="text-2xl font-bold text-white">+{item.value}</span>
                  <span className="mt-1 text-xs text-slate-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800/40 pt-6 text-center text-xs text-slate-600">
          Fluxy Analytics · Solo accesible por administradores · admin@fluxy.dev
        </footer>
      </main>
    </div>
  )
}
