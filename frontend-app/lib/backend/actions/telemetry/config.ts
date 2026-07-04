/**
 * ¿Estamos en modo demo (mock) o datos reales?
 *
 * - ANALYTICS_DATA_SOURCE no definida  → mock (por defecto, seguro)
 * - ANALYTICS_DATA_SOURCE=mock         → mock
 * - ANALYTICS_DATA_SOURCE=database     → datos reales de Supabase/Postgres
 */
export const IS_MOCK_MODE =
  !process.env.ANALYTICS_DATA_SOURCE ||
  process.env.ANALYTICS_DATA_SOURCE === 'mock'
