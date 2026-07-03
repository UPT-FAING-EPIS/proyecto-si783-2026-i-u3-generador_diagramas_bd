'use server'

export type { AnalyticsSummary } from './getAnalyticsSummary'

import { IS_MOCK_MODE } from './config'

/**
 * Punto de entrada ÚNICO para obtener datos del dashboard de analytics.
 *
 * En MODO MOCK:
 *   → Devuelve 247 usuarios, 30 días de series de tiempo, etc.
 *   → Funciona sin ninguna BD ni variable de entorno.
 *   → Ideal para demos y presentaciones.
 *
 * En MODO REAL (ANALYTICS_DATA_SOURCE=database):
 *   → Conecta a PostgreSQL/Supabase via Drizzle.
 *   → Retorna TODOS los usuarios reales registrados.
 *   → Retorna sesiones reales de web y desktop.
 *   → Retorna proyectos y diagramas reales.
 *   → Requiere DATABASE_URL en .env.local.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * PARA EL COMPAÑERO (activar datos reales):
 *   1. Agregar al archivo apps/web/frontend-app/.env.local:
 *      DATABASE_URL=postgresql://postgres.[ref]:[pw]@...supabase.com:6543/postgres
 *      NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
 *      NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
 *      ANALYTICS_DATA_SOURCE=database
 *   2. pnpm --filter @fluxy/web db:push   (crea la tabla telemetry_events)
 *   3. pnpm dev:web
 *   4. Login con admin@fluxy.dev → ir a /analytics
 * ──────────────────────────────────────────────────────────────────────────
 */
export async function getAnalyticsData() {
  if (IS_MOCK_MODE) {
    const { getMockAnalyticsSummary } = await import('./getMockAnalyticsSummary')
    return getMockAnalyticsSummary()
  }

  const { getAnalyticsSummary } = await import('./getAnalyticsSummary')
  return getAnalyticsSummary()
}
