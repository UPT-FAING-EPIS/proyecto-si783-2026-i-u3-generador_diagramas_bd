'use server'

import { db } from '@/lib/backend/db'
import { telemetryEvents, users, projects, diagrams } from '@/lib/backend/db/schema'
import { count, countDistinct, gte, eq, isNull, isNotNull, and, sql } from 'drizzle-orm'

export interface DailyCount {
  date: string
  count: number
}

export interface DailySessionCount {
  date: string
  web: number
  desktop: number
}

export interface AnalyticsSummary {
  // Usuarios
  totalUsers: number
  newUsersToday: number
  newUsers7d: number
  newUsers30d: number
  // Sesiones activas
  activeToday: number
  active7d: number
  active30d: number
  // Plataformas
  webSessionsTotal: number
  desktopSessionsTotal: number
  anonymousSessionsTotal: number
  // Contenido
  totalProjects: number
  totalDiagrams: number
  // Series de tiempo
  dailySessions: DailySessionCount[]
  dailyNewUsers: DailyCount[]
}

/**
 * Obtiene el resumen completo de métricas de analytics.
 * Solo debe llamarse desde page.tsx de /analytics después de verificar isAdmin().
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [[{ totalUsers }], [{ newUsersToday }], [{ newUsers7d }], [{ newUsers30d }]] =
    await Promise.all([
      db.select({ totalUsers: count() }).from(users),
      db.select({ newUsersToday: count() }).from(users).where(gte(users.createdAt, today)),
      db.select({ newUsers7d: count() }).from(users).where(gte(users.createdAt, sevenDaysAgo)),
      db.select({ newUsers30d: count() }).from(users).where(gte(users.createdAt, thirtyDaysAgo)),
    ])

  const [[{ activeToday }], [{ active7d }], [{ active30d }]] = await Promise.all([
    db
      .select({ activeToday: countDistinct(telemetryEvents.userId) })
      .from(telemetryEvents)
      .where(and(isNotNull(telemetryEvents.userId), gte(telemetryEvents.createdAt, today))),
    db
      .select({ active7d: countDistinct(telemetryEvents.userId) })
      .from(telemetryEvents)
      .where(and(isNotNull(telemetryEvents.userId), gte(telemetryEvents.createdAt, sevenDaysAgo))),
    db
      .select({ active30d: countDistinct(telemetryEvents.userId) })
      .from(telemetryEvents)
      .where(and(isNotNull(telemetryEvents.userId), gte(telemetryEvents.createdAt, thirtyDaysAgo))),
  ])

  const [[{ webSessionsTotal }], [{ desktopSessionsTotal }], [{ anonymousSessionsTotal }]] =
    await Promise.all([
      db.select({ webSessionsTotal: count() }).from(telemetryEvents).where(eq(telemetryEvents.platform, 'web')),
      db.select({ desktopSessionsTotal: count() }).from(telemetryEvents).where(eq(telemetryEvents.platform, 'desktop')),
      db.select({ anonymousSessionsTotal: count() }).from(telemetryEvents).where(isNull(telemetryEvents.userId)),
    ])

  const [[{ totalProjects }], [{ totalDiagrams }]] = await Promise.all([
    db.select({ totalProjects: count() }).from(projects),
    db.select({ totalDiagrams: count() }).from(diagrams),
  ])

  // Sesiones diarias (últimos 30 días) por plataforma
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

  // Nuevos usuarios diarios (últimos 30 días)
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
    dailySessions,
    dailyNewUsers,
  }
}
