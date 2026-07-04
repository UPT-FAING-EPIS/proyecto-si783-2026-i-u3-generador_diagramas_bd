import type { DailyCount } from '@/lib/backend/actions/telemetry/getAnalyticsSummary'

interface NewUsersChartProps {
  data: DailyCount[]
}

export function NewUsersChart({ data }: NewUsersChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-500">
        Sin datos de usuarios aún
      </div>
    )
  }

  const maxVal = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Nuevos usuarios
        </span>
      </div>

      <div className="flex h-40 items-end gap-0.5 overflow-x-auto pb-1">
        {data.map((d) => {
          const barH = Math.round((d.count / maxVal) * 100)
          const label = d.date.slice(5)

          return (
            <div key={d.date} className="group relative flex min-w-[20px] flex-1 flex-col items-center">
              {/* Tooltip */}
              <div className="pointer-events-none absolute bottom-full mb-2 hidden rounded-lg border border-slate-700 bg-[#0d1117] px-2.5 py-1.5 text-xs shadow-xl group-hover:flex flex-col gap-0.5 z-10 min-w-[80px]">
                <span className="font-semibold text-white">{d.date}</span>
                <span className="text-emerald-400">+{d.count} usuarios</span>
              </div>

              {/* Bar */}
              <div className="flex h-full w-full items-end">
                <div
                  className="w-full rounded-t bg-emerald-500/70 transition-all duration-300 group-hover:bg-emerald-400"
                  style={{ height: `${barH}%` }}
                />
              </div>

              <span className="mt-1 hidden text-[9px] text-slate-600 sm:block">{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
