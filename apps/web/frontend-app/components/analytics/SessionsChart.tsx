import type { DailySessionCount } from '@/lib/backend/actions/telemetry/getAnalyticsSummary'

interface SessionsChartProps {
  data: DailySessionCount[]
}

export function SessionsChart({ data }: SessionsChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-500">
        Sin datos de sesiones aún
      </div>
    )
  }

  const maxVal = Math.max(...data.flatMap((d) => [d.web, d.desktop]), 1)

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
          Web
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-violet-500" />
          Desktop
        </span>
      </div>

      {/* Chart */}
      <div className="flex h-40 items-end gap-0.5 overflow-x-auto pb-1">
        {data.map((d) => {
          const webH = Math.round((d.web / maxVal) * 100)
          const deskH = Math.round((d.desktop / maxVal) * 100)
          const label = d.date.slice(5) // MM-DD

          return (
            <div key={d.date} className="group relative flex min-w-[20px] flex-1 flex-col items-center">
              {/* Tooltip */}
              <div className="pointer-events-none absolute bottom-full mb-2 hidden rounded-lg border border-slate-700 bg-[#0d1117] px-2.5 py-1.5 text-xs shadow-xl group-hover:flex flex-col gap-0.5 z-10 min-w-[90px]">
                <span className="font-semibold text-white">{d.date}</span>
                <span className="text-blue-400">Web: {d.web}</span>
                <span className="text-violet-400">Desktop: {d.desktop}</span>
              </div>

              {/* Bars */}
              <div className="flex h-full w-full items-end gap-px">
                <div
                  className="flex-1 rounded-t bg-blue-500/70 transition-all duration-300 group-hover:bg-blue-400"
                  style={{ height: `${webH}%` }}
                />
                <div
                  className="flex-1 rounded-t bg-violet-500/70 transition-all duration-300 group-hover:bg-violet-400"
                  style={{ height: `${deskH}%` }}
                />
              </div>

              {/* X Label */}
              <span className="mt-1 hidden text-[9px] text-slate-600 sm:block">{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
