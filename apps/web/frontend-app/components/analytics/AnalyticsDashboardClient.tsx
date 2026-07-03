'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AnalyticsSummary } from '@/lib/backend/actions/telemetry/getAnalyticsSummary'
import { MetricCard } from '@/components/analytics/MetricCard'
import { SessionsChart } from '@/components/analytics/SessionsChart'
import { NewUsersChart } from '@/components/analytics/NewUsersChart'
import { PlatformBreakdown } from '@/components/analytics/PlatformBreakdown'
import { TopCountriesTable } from '@/components/analytics/TopCountriesTable'
import { LiveUsersList } from '@/components/analytics/LiveUsersList'
import { LogOut, LayoutDashboard, Users as UsersIconLucide, FolderKanban, Activity as ActivityLucide } from 'lucide-react'
import { logoutAction } from '@/lib/backend/actions/auth/logout'
import { cn } from '@/lib/utils'

// ── Íconos SVG inline ─────────────────────────────────────────────────────────

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
function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
}

interface AnalyticsDashboardClientProps {
  summary: AnalyticsSummary
}

type TabType = 'overview' | 'users' | 'projects' | 'live'

export function AnalyticsDashboardClient({ summary }: AnalyticsDashboardClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  useEffect(() => {
    // Auto-refresh the server component data every 10 seconds
    const interval = setInterval(() => {
      router.refresh()
    }, 10000)
    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="flex h-screen w-full font-sans">
      {/* ── SIDEBAR (SerQ Style) ── */}
      <aside className="w-64 bg-[#0B1739] text-white flex flex-col shrink-0">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Fluxy</h1>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3.5 text-sm font-semibold rounded-xl transition-all",
              activeTab === 'overview' ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <LayoutDashboard size={18} />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3.5 text-sm font-semibold rounded-xl transition-all",
              activeTab === 'live' ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <ActivityLucide size={18} />
            En Vivo
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3.5 text-sm font-semibold rounded-xl transition-all",
              activeTab === 'users' ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <UsersIconLucide size={18} />
            Usuarios
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3.5 text-sm font-semibold rounded-xl transition-all",
              activeTab === 'projects' ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <FolderKanban size={18} />
            Proyectos
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
            >
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-y-auto p-8 bg-[#F8F9FD]">
        
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {activeTab === 'overview' && 'Welcome back, Admin 👋'}
              {activeTab === 'live' && 'Monitoreo en Vivo'}
              {activeTab === 'users' && 'Gestión de Usuarios'}
              {activeTab === 'projects' && 'Gestión de Proyectos'}
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Here's what's happening with your platform today.</p>
          </div>
        </header>

        {/* ── TAB: LIVE ── */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            <LiveUsersList />
          </div>
        )}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Personas Conectadas"
                value={summary.activeToday}
                subtitle="Usuarios activos hoy"
                icon={<ActivityIcon />}
                accent="emerald"
              />
              <MetricCard
                title="Total Usuarios"
                value={summary.totalUsers}
                icon={<UsersIcon />}
                accent="blue"
                trend={{ value: summary.newUsersToday, label: 'nuevos hoy', positive: true }}
              />
              <MetricCard
                title="Total Proyectos"
                value={summary.totalProjects}
                icon={<FolderIcon />}
                accent="violet"
              />
              <MetricCard
                title="Proyectos Hoy"
                value={summary.totalDiagramsCreatedToday}
                subtitle="Diagramas nuevos creados"
                icon={<DiagramIcon />}
                accent="amber"
              />
            </div>

            <section className="grid grid-cols-1 gap-6">
              <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="mb-1 text-lg font-bold text-slate-900">Sesiones por día</h3>
                <p className="mb-6 text-sm font-medium text-slate-500">Comportamiento de los últimos 14 días (Web vs Desktop)</p>
                <div className="h-[350px]">
                  <SessionsChart data={summary.dailySessions} />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ── TAB: USERS ── */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <MetricCard
                title="Visitas al Landing"
                value={summary.anonymousSessionsTotal}
                subtitle="Entran sin cuenta registrada"
                icon={<UsersIcon />}
                accent="rose"
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

            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-base font-bold text-slate-900">Últimos Usuarios Registrados</h3>
              <div className="space-y-4">
                {summary.recentUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-4 border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 overflow-hidden shrink-0">
                      {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" /> : (user.name?.charAt(0) || user.email.charAt(0)).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name || 'Sin nombre'}</p>
                      <p className="text-xs font-medium text-slate-500 truncate">{user.email}</p>
                    </div>
                    <div className="text-xs font-semibold text-slate-500 whitespace-nowrap bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {summary.recentUsers.length === 0 && (
                  <p className="text-sm font-medium text-slate-500">No hay usuarios recientes.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: PROJECTS ── */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              <MetricCard
                title="Total Proyectos"
                value={summary.totalProjects}
                icon={<FolderIcon />}
                accent="emerald"
              />
              <MetricCard
                title="Total Diagramas"
                value={summary.totalDiagrams}
                icon={<DiagramIcon />}
                accent="amber"
              />
              <MetricCard
                title="Versiones Guardadas"
                value={summary.totalVersionsSaved}
                icon={<LayersIcon />}
                accent="violet"
              />
              <MetricCard
                title="Diagramas Hoy"
                value={summary.totalDiagramsCreatedToday}
                subtitle={`${summary.avgDiagramsPerProject} prom/proyecto`}
                icon={<DiagramIcon />}
                accent="blue"
              />
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-base font-bold text-slate-900">Últimos Proyectos Creados</h3>
              <div className="space-y-4">
                {summary.recentProjects.map(project => (
                  <div key={project.id} className="flex items-center justify-between gap-4 border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{project.name}</p>
                      <p className="text-xs font-medium text-slate-500 truncate">Creado por {project.ownerName || project.ownerEmail}</p>
                    </div>
                    <div className="text-xs font-semibold text-slate-500 whitespace-nowrap bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {summary.recentProjects.length === 0 && (
                  <p className="text-sm font-medium text-slate-500">No hay proyectos recientes.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
