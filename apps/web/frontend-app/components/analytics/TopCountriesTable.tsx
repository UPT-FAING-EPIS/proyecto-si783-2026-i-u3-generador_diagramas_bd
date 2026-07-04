import type { CountryCount } from '@/lib/backend/actions/telemetry/getAnalyticsSummary'

interface TopCountriesTableProps {
  data: CountryCount[]
}

export function TopCountriesTable({ data }: TopCountriesTableProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-slate-500">
        Sin datos de geografía aún
      </div>
    )
  }

  const maxSessions = data[0].sessions

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const barWidth = Math.round((item.sessions / maxSessions) * 100)
        return (
          <div key={item.country} className="group flex items-center gap-3">
            {/* Rank */}
            <span className="w-4 text-center text-xs font-bold text-slate-600">
              {index + 1}
            </span>

            {/* Flag + name */}
            <div className="flex w-28 items-center gap-1.5 shrink-0">
              <span className="text-base leading-none">{item.flag}</span>
              <span className="truncate text-sm text-slate-300">{item.country}</span>
            </div>

            {/* Bar */}
            <div className="flex-1 overflow-hidden rounded-full bg-slate-800/60 h-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-700"
                style={{ width: `${barWidth}%` }}
              />
            </div>

            {/* Count */}
            <span className="w-14 text-right text-xs font-semibold text-slate-300">
              {item.sessions.toLocaleString()}
            </span>
          </div>
        )
      })}
    </div>
  )
}
