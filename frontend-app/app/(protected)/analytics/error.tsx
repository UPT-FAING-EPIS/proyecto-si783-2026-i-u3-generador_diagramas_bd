'use client'

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060a10] text-white">
      <div className="max-w-md space-y-5 text-center">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-xl font-semibold">Error al cargar analytics</h2>
        <p className="text-sm text-slate-400">
          {error.message.includes('DATABASE_URL')
            ? 'No se pudo conectar a la base de datos. Verifica que DATABASE_URL está configurada en .env.local y que ANALYTICS_DATA_SOURCE=database.'
            : error.message}
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 transition-colors"
          >
            Reintentar
          </button>
          <a
            href="/dashboard"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Ir al dashboard
          </a>
        </div>
        <p className="text-xs text-slate-600">
          ¿Sin acceso a BD? Cambia{' '}
          <code className="rounded bg-slate-800 px-1 text-amber-400">ANALYTICS_DATA_SOURCE=mock</code>{' '}
          en <code className="rounded bg-slate-800 px-1">.env.local</code>
        </p>
      </div>
    </div>
  )
}
