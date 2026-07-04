/**
 * Datos de demostración para el dashboard de analytics.
 *
 * Estos datos son completamente ficticios pero realistas.
 * Cuando el compañero conecte Supabase, esta función NO se usa —
 * se usa `getAnalyticsSummary.ts` con queries reales a la BD.
 *
 * Para activar datos reales: ANALYTICS_DATA_SOURCE=database en .env.local
 */

import type { AnalyticsSummary } from './getAnalyticsSummary'

/** Genera 30 días de sesiones con tendencia creciente + variación natural */
function generateDailySessionsLast30Days(): AnalyticsSummary['dailySessions'] {
  const result: AnalyticsSummary['dailySessions'] = []
  const today = new Date()

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const label = date.toISOString().split('T')[0]

    // Tendencia creciente desde el día 30 al día 0
    const growthFactor = (29 - i) * 1.8
    // Variación sinusoidal para simular ciclos semanales (menos fines de semana)
    const weekdayBoost = [0, 1, 2, 3, 4].includes(date.getDay()) ? 12 : 4
    const web =
      Math.round(30 + growthFactor + weekdayBoost + Math.sin(i * 0.9) * 7)
    const desktop =
      Math.round(10 + growthFactor * 0.35 + Math.cos(i * 0.7) * 4)

    result.push({
      date: label,
      web: Math.max(web, 1),
      desktop: Math.max(desktop, 0),
    })
  }

  return result
}

/** Genera 30 días de nuevos registros con picos de lanzamiento */
function generateDailyNewUsersLast30Days(): AnalyticsSummary['dailyNewUsers'] {
  const result: AnalyticsSummary['dailyNewUsers'] = []
  const today = new Date()

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const label = date.toISOString().split('T')[0]

    // Pico en el día 20 (simula un lanzamiento o publicación)
    const launchPeak = i === 20 ? 18 : i === 19 ? 12 : i === 21 ? 10 : 0
    const base = 3 + Math.round((29 - i) * 0.25)
    const variation = Math.round(Math.sin(i * 0.5 + 1) * 2)
    const count = base + variation + launchPeak

    result.push({ date: label, count: Math.max(count, 0) })
  }

  return result
}

/** Genera distribución de actividad por hora (0-23) */
function generateHourlyActivity(): AnalyticsSummary['hourlyActivity'] {
  return Array.from({ length: 24 }, (_, hour) => {
    // Patrón típico: pico 9-11am y 3-5pm, bajo 0-6am
    let sessions = 0
    if (hour >= 0 && hour <= 5) sessions = Math.round(2 + Math.random() * 3)
    else if (hour >= 6 && hour <= 8) sessions = Math.round(15 + hour * 3)
    else if (hour >= 9 && hour <= 11) sessions = Math.round(60 + (11 - hour) * 8 + Math.random() * 10)
    else if (hour === 12 || hour === 13) sessions = Math.round(45 + Math.random() * 10)
    else if (hour >= 14 && hour <= 17) sessions = Math.round(55 + (17 - hour) * 5)
    else if (hour >= 18 && hour <= 20) sessions = Math.round(35 - (hour - 18) * 5)
    else sessions = Math.round(12 - (hour - 20) * 2)

    return { hour, sessions: Math.max(sessions, 1) }
  })
}

export async function getMockAnalyticsSummary(): Promise<AnalyticsSummary> {
  return {
    // ── Usuarios ────────────────────────────────────────────────────────────
    totalUsers: 247,
    newUsersToday: 8,
    newUsers7d: 34,
    newUsers30d: 112,

    // ── Usuarios activos ────────────────────────────────────────────────────
    activeToday: 41,
    active7d: 138,
    active30d: 203,

    // ── Sesiones por plataforma ─────────────────────────────────────────────
    webSessionsTotal: 1843,
    desktopSessionsTotal: 612,
    anonymousSessionsTotal: 289,

    // ── Contenido ───────────────────────────────────────────────────────────
    totalProjects: 389,
    totalDiagrams: 1124,
    totalVersionsSaved: 4821,
    totalDiagramsCreatedToday: 23,
    avgDiagramsPerProject: 2.9,

    // ── Engagement ──────────────────────────────────────────────────────────
    retentionRate: 68,        // % usuarios activos esta semana vs semana anterior
    avgSessionsPerUser: 7.4,  // promedio de sesiones por usuario único

    // ── Geografía ───────────────────────────────────────────────────────────
    topCountries: [
      { country: 'México',    sessions: 612, flag: '🇲🇽' },
      { country: 'Argentina', sessions: 387, flag: '🇦🇷' },
      { country: 'Colombia',  sessions: 241, flag: '🇨🇴' },
      { country: 'España',    sessions: 198, flag: '🇪🇸' },
      { country: 'Chile',     sessions: 156, flag: '🇨🇱' },
    ],

    // ── Horario ─────────────────────────────────────────────────────────────
    peakHour: '10:00 – 11:00',
    hourlyActivity: generateHourlyActivity(),

    // ── Series de tiempo ────────────────────────────────────────────────────
    dailySessions:  generateDailySessionsLast30Days(),
    dailyNewUsers:  generateDailyNewUsersLast30Days(),

    // ── Listados Recientes ──────────────────────────────────────────────────
    recentUsers: [
      { id: '1', name: 'Alice', email: 'alice@example.com', avatarUrl: null, createdAt: new Date() },
      { id: '2', name: 'Bob', email: 'bob@example.com', avatarUrl: null, createdAt: new Date() },
    ],
    recentProjects: [
      { id: '1', name: 'Project A', createdAt: new Date(), ownerName: 'Alice', ownerEmail: 'alice@example.com' },
      { id: '2', name: 'Project B', createdAt: new Date(), ownerName: 'Bob', ownerEmail: 'bob@example.com' },
    ]
  }
}
