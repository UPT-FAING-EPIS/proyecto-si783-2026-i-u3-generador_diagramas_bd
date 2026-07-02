'use server'

import { db } from '@/lib/backend/db'
import { telemetryEvents, users, projects, diagrams, diagramVersions } from '@/lib/backend/db/schema'
import { count, countDistinct, gte, eq, isNull, isNotNull, and, sql } from 'drizzle-orm'

// ── Tipos exportados ──────────────────────────────────────────────────────────

export interface DailyCount {
  date: string
  count: number
}

export interface DailySessionCount {
  date: string
  web: number
  desktop: number
}

export interface CountryCount {
  country: string
  sessions: number
  flag: string
}

export interface HourlyCount {
  hour: number
  sessions: number
}

export interface AnalyticsSummary {
  // ── Usuarios ────────────────────────────────────────────────────────────
  totalUsers: number
  newUsersToday: number
  newUsers7d: number
  newUsers30d: number
  // ── Usuarios activos (autenticados) ─────────────────────────────────────
  activeToday: number
  active7d: number
  active30d: number
  // ── Sesiones por plataforma ─────────────────────────────────────────────
  webSessionsTotal: number
  desktopSessionsTotal: number
  anonymousSessionsTotal: number
  // ── Contenido ───────────────────────────────────────────────────────────
  totalProjects: number
  totalDiagrams: number
  totalVersionsSaved: number
  totalDiagramsCreatedToday: number
  avgDiagramsPerProject: number
  // ── Engagement ──────────────────────────────────────────────────────────
  retentionRate: number          // % usuarios activos esta semana vs semana anterior
  avgSessionsPerUser: number     // sesiones promedio por usuario único (30d)
  // ── Geografía ───────────────────────────────────────────────────────────
  topCountries: CountryCount[]
  // ── Horario pico ────────────────────────────────────────────────────────
  peakHour: string               // "10:00 – 11:00"
  hourlyActivity: HourlyCount[]  // 24 puntos, uno por hora (últimos 7 días)
  // ── Series de tiempo ────────────────────────────────────────────────────
  dailySessions: DailySessionCount[]
  dailyNewUsers: DailyCount[]
}

// ── Función de datos reales (BD PostgreSQL / Supabase) ────────────────────────
/**
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  DATOS REALES — Para el compañero que tiene acceso a Supabase            │
 * │                                                                           │
 * │  Pasos para activar:                                                      │
 * │  1. Configura DATABASE_URL en apps/web/frontend-app/.env.local            │
 * │  2. Ejecuta: pnpm --filter @fluxy/web db:push                             │
 * │  3. Cambia: ANALYTICS_DATA_SOURCE=database en .env.local                  │
 * │  4. Crea usuario admin@fluxy.dev en Supabase Auth                         │
 * │                                                                           │
 * │  Todos los datos que se muestran son REALES: usuarios registrados,        │
 * │  sesiones web/desktop, proyectos, diagramas y actividad horaria.          │
 * └──────────────────────────────────────────────────────────────────────────┘
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  // ── Usuarios ──────────────────────────────────────────────────────────────
  const [[{ totalUsers }], [{ newUsersToday }], [{ newUsers7d }], [{ newUsers30d }]] =
    await Promise.all([
      db.select({ totalUsers: count() }).from(users),
      db.select({ newUsersToday: count() }).from(users).where(gte(users.createdAt, today)),
      db.select({ newUsers7d: count() }).from(users).where(gte(users.createdAt, sevenDaysAgo)),
      db.select({ newUsers30d: count() }).from(users).where(gte(users.createdAt, thirtyDaysAgo)),
    ])

  // ── Usuarios activos ──────────────────────────────────────────────────────
  const [[{ activeToday }], [{ active7d }], [{ active30d }], [{ active7dPrev }]] =
    await Promise.all([
      db.select({ activeToday: countDistinct(telemetryEvents.userId) }).from(telemetryEvents)
        .where(and(isNotNull(telemetryEvents.userId), gte(telemetryEvents.createdAt, today))),
      db.select({ active7d: countDistinct(telemetryEvents.userId) }).from(telemetryEvents)
        .where(and(isNotNull(telemetryEvents.userId), gte(telemetryEvents.createdAt, sevenDaysAgo))),
      db.select({ active30d: countDistinct(telemetryEvents.userId) }).from(telemetryEvents)
        .where(and(isNotNull(telemetryEvents.userId), gte(telemetryEvents.createdAt, thirtyDaysAgo))),
      // Semana anterior (para calcular retención)
      db.select({ active7dPrev: countDistinct(telemetryEvents.userId) }).from(telemetryEvents)
        .where(and(
          isNotNull(telemetryEvents.userId),
          gte(telemetryEvents.createdAt, fourteenDaysAgo),
          sql`${telemetryEvents.createdAt} < ${sevenDaysAgo}`,
        )),
    ])

  // ── Sesiones por plataforma ───────────────────────────────────────────────
  const [[{ webSessionsTotal }], [{ desktopSessionsTotal }], [{ anonymousSessionsTotal }], [{ totalSessions }]] =
    await Promise.all([
      db.select({ webSessionsTotal: count() }).from(telemetryEvents).where(eq(telemetryEvents.platform, 'web')),
      db.select({ desktopSessionsTotal: count() }).from(telemetryEvents).where(eq(telemetryEvents.platform, 'desktop')),
      db.select({ anonymousSessionsTotal: count() }).from(telemetryEvents).where(isNull(telemetryEvents.userId)),
      db.select({ totalSessions: count() }).from(telemetryEvents),
    ])

  // ── Contenido ─────────────────────────────────────────────────────────────
  const [[{ totalProjects }], [{ totalDiagrams }], [{ totalVersionsSaved }], [{ totalDiagramsCreatedToday }]] =
    await Promise.all([
      db.select({ totalProjects: count() }).from(projects),
      db.select({ totalDiagrams: count() }).from(diagrams),
      db.select({ totalVersionsSaved: count() }).from(diagramVersions),
      db.select({ totalDiagramsCreatedToday: count() }).from(diagrams).where(gte(diagrams.createdAt, today)),
    ])

  const avgDiagramsPerProject =
    Number(totalProjects) > 0
      ? Number((Number(totalDiagrams) / Number(totalProjects)).toFixed(1))
      : 0

  // ── Engagement ────────────────────────────────────────────────────────────
  const retentionRate =
    Number(active7dPrev) > 0
      ? Math.round((Number(active7d) / Number(active7dPrev)) * 100)
      : 0

  const avgSessionsPerUser =
    Number(active30d) > 0
      ? Number((Number(totalSessions) / Number(active30d)).toFixed(1))
      : 0

  // ── Actividad por hora (últimos 7 días) ────────────────────────────────────
  const hourlyRows = await db.execute<{ hour: string; cnt: string }>(sql`
    SELECT
      EXTRACT(HOUR FROM created_at AT TIME ZONE 'UTC')::int AS hour,
      COUNT(*) as cnt
    FROM telemetry_events
    WHERE created_at >= ${sevenDaysAgo}
    GROUP BY EXTRACT(HOUR FROM created_at AT TIME ZONE 'UTC')::int
    ORDER BY hour ASC
  `)

  const hourlyMap = new Map<number, number>()
  for (const row of hourlyRows) {
    hourlyMap.set(Number(row.hour), Number(row.cnt))
  }
  const hourlyActivity: HourlyCount[] = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    sessions: hourlyMap.get(h) ?? 0,
  }))

  const peakHourEntry = hourlyActivity.reduce((max, cur) =>
    cur.sessions > max.sessions ? cur : max, hourlyActivity[0])
  const peakHour = `${String(peakHourEntry.hour).padStart(2, '0')}:00 – ${String(peakHourEntry.hour + 1).padStart(2, '0')}:00`

  // ── Top países (desde metadata->country) ──────────────────────────────────
  // El campo metadata.country se llena desde el trackEvent server action
  // usando los headers de la petición (Vercel/Cloudflare incluyen geolocalización)
  const countryRows = await db.execute<{ country: string; cnt: string }>(sql`
    SELECT
      COALESCE(metadata->>'country', 'Desconocido') as country,
      COUNT(*) as cnt
    FROM telemetry_events
    WHERE metadata->>'country' IS NOT NULL
    GROUP BY metadata->>'country'
    ORDER BY cnt DESC
    LIMIT 5
  `)

  const countryFlagMap: Record<string, string> = {
    'México': '🇲🇽', 'Mexico': '🇲🇽',
    'Argentina': '🇦🇷', 'Colombia': '🇨🇴',
    'España': '🇪🇸', 'Spain': '🇪🇸',
    'Chile': '🇨🇱', 'Perú': '🇵🇪', 'Peru': '🇵🇪',
    'Venezuela': '🇻🇪', 'Ecuador': '🇪🇨',
    'United States': '🇺🇸', 'Brazil': '🇧🇷', 'Brasil': '🇧🇷',
  }
  const topCountries: CountryCount[] = countryRows.map((r) => ({
    country: r.country,
    sessions: Number(r.cnt),
    flag: countryFlagMap[r.country] ?? '🌍',
  }))

  // ── Series de tiempo (últimos 30 días) ────────────────────────────────────
  const sessionRows = await db.execute<{ date: string; platform: string; cnt: string }>(sql`
    SELECT
      TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') as date,
      platform,
      COUNT(*) as cnt
    FROM telemetry_events
    WHERE created_at >= ${thirtyDaysAgo}
    GROUP BY TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD'), platform
    ORDER BY date ASC
  `)

  const sessionsMap = new Map<string, { web: number; desktop: number }>()
  for (const row of sessionRows) {
    const entry = sessionsMap.get(row.date) ?? { web: 0, desktop: 0 }
    if (row.platform === 'web') entry.web = Number(row.cnt)
    if (row.platform === 'desktop') entry.desktop = Number(row.cnt)
    sessionsMap.set(row.date, entry)
  }
  const dailySessions: DailySessionCount[] = Array.from(sessionsMap.entries()).map(
    ([date, v]) => ({ date, ...v }),
  )

  const userRows = await db.execute<{ date: string; cnt: string }>(sql`
    SELECT
      TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') as date,
      COUNT(*) as cnt
    FROM users
    WHERE created_at >= ${thirtyDaysAgo}
    GROUP BY TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD')
    ORDER BY date ASC
  `)
  const dailyNewUsers: DailyCount[] = userRows.map((r) => ({
    date: r.date,
    count: Number(r.cnt),
  }))

  return {
    totalUsers: Number(totalUsers),
    newUsersToday: Number(newUsersToday),
    newUsers7d: Number(newUsers7d),
    newUsers30d: Number(newUsers30d),
    activeToday: Number(activeToday),
    active7d: Number(active7d),
    active30d: Number(active30d),
    webSessionsTotal: Number(webSessionsTotal),
    desktopSessionsTotal: Number(desktopSessionsTotal),
    anonymousSessionsTotal: Number(anonymousSessionsTotal),
    totalProjects: Number(totalProjects),
    totalDiagrams: Number(totalDiagrams),
    totalVersionsSaved: Number(totalVersionsSaved),
    totalDiagramsCreatedToday: Number(totalDiagramsCreatedToday),
    avgDiagramsPerProject,
    retentionRate,
    avgSessionsPerUser,
    topCountries,
    peakHour,
    hourlyActivity,
    dailySessions,
    dailyNewUsers,
  }
}
