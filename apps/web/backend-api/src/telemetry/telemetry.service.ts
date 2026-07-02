import { Injectable } from '@nestjs/common';
import { db } from '../db';
import { telemetryEvents, users } from '../db/schema';
import { eq, sql, gte, and, isNull, isNotNull, count, countDistinct } from 'drizzle-orm';

export interface TrackEventDto {
  userId?: string | null;
  platform: 'web' | 'desktop';
  event: 'session_start' | 'page_view' | 'session_end';
  metadata?: Record<string, unknown>;
}

export interface AnalyticsSummary {
  totalUsers: number;
  activeToday: number;
  active7d: number;
  active30d: number;
  webSessionsTotal: number;
  desktopSessionsTotal: number;
  anonymousSessionsTotal: number;
  newUsersToday: number;
  newUsers7d: number;
  dailySessions: { date: string; web: number; desktop: number }[];
  dailyNewUsers: { date: string; count: number }[];
}

@Injectable()
export class TelemetryService {
  async trackEvent(dto: TrackEventDto): Promise<void> {
    await db.insert(telemetryEvents).values({
      userId: dto.userId ?? null,
      platform: dto.platform,
      event: dto.event,
      metadata: dto.metadata ?? {},
    });
  }

  async getSummary(): Promise<AnalyticsSummary> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total usuarios registrados
    const [{ totalUsers }] = await db
      .select({ totalUsers: count() })
      .from(users);

    // Usuarios activos hoy (sesiones únicas)
    const [{ activeToday }] = await db
      .select({ activeToday: countDistinct(telemetryEvents.userId) })
      .from(telemetryEvents)
      .where(and(
        isNotNull(telemetryEvents.userId),
        gte(telemetryEvents.createdAt, today),
      ));

    // Usuarios activos en 7 días
    const [{ active7d }] = await db
      .select({ active7d: countDistinct(telemetryEvents.userId) })
      .from(telemetryEvents)
      .where(and(
        isNotNull(telemetryEvents.userId),
        gte(telemetryEvents.createdAt, sevenDaysAgo),
      ));

    // Usuarios activos en 30 días
    const [{ active30d }] = await db
      .select({ active30d: countDistinct(telemetryEvents.userId) })
      .from(telemetryEvents)
      .where(and(
        isNotNull(telemetryEvents.userId),
        gte(telemetryEvents.createdAt, thirtyDaysAgo),
      ));

    // Sesiones por plataforma
    const [{ webSessionsTotal }] = await db
      .select({ webSessionsTotal: count() })
      .from(telemetryEvents)
      .where(eq(telemetryEvents.platform, 'web'));

    const [{ desktopSessionsTotal }] = await db
      .select({ desktopSessionsTotal: count() })
      .from(telemetryEvents)
      .where(eq(telemetryEvents.platform, 'desktop'));

    // Sesiones anónimas
    const [{ anonymousSessionsTotal }] = await db
      .select({ anonymousSessionsTotal: count() })
      .from(telemetryEvents)
      .where(isNull(telemetryEvents.userId));

    // Nuevos usuarios hoy
    const [{ newUsersToday }] = await db
      .select({ newUsersToday: count() })
      .from(users)
      .where(gte(users.createdAt, today));

    // Nuevos usuarios en 7 días
    const [{ newUsers7d }] = await db
      .select({ newUsers7d: count() })
      .from(users)
      .where(gte(users.createdAt, sevenDaysAgo));

    // Sesiones diarias (últimos 30 días) por plataforma usando SQL raw
    const dailySessionsRaw = await db.execute<{
      date: string;
      platform: string;
      cnt: number;
    }>(sql`
      SELECT
        DATE(created_at AT TIME ZONE 'UTC') as date,
        platform,
        COUNT(*) as cnt
      FROM telemetry_events
      WHERE created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(created_at AT TIME ZONE 'UTC'), platform
      ORDER BY date ASC
    `);

    // Nuevos usuarios diarios (últimos 30 días)
    const dailyNewUsersRaw = await db.execute<{
      date: string;
      cnt: number;
    }>(sql`
      SELECT
        DATE(created_at AT TIME ZONE 'UTC') as date,
        COUNT(*) as cnt
      FROM users
      WHERE created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(created_at AT TIME ZONE 'UTC')
      ORDER BY date ASC
    `);

    // Pivot sesiones diarias en { date, web, desktop }
    const sessionsMap = new Map<string, { web: number; desktop: number }>();
    for (const row of dailySessionsRaw) {
      const entry = sessionsMap.get(row.date) ?? { web: 0, desktop: 0 };
      if (row.platform === 'web') entry.web = Number(row.cnt);
      if (row.platform === 'desktop') entry.desktop = Number(row.cnt);
      sessionsMap.set(row.date, entry);
    }
    const dailySessions = Array.from(sessionsMap.entries()).map(([date, v]) => ({
      date,
      ...v,
    }));

    const dailyNewUsers = dailyNewUsersRaw.map((r) => ({
      date: r.date,
      count: Number(r.cnt),
    }));

    return {
      totalUsers: Number(totalUsers),
      activeToday: Number(activeToday),
      active7d: Number(active7d),
      active30d: Number(active30d),
      webSessionsTotal: Number(webSessionsTotal),
      desktopSessionsTotal: Number(desktopSessionsTotal),
      anonymousSessionsTotal: Number(anonymousSessionsTotal),
      newUsersToday: Number(newUsersToday),
      newUsers7d: Number(newUsers7d),
      dailySessions,
      dailyNewUsers,
    };
  }
}
