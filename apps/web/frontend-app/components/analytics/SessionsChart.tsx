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
      <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-2">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-blue-500" />
          Web
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-violet-500" />
          Desktop
        </span>
      </div>

      {/* Chart */}
      <div className="flex h-64 items-end gap-1 overflow-visible mt-4 w-full">
        {data.map((d) => {
          const webH = Math.max(Math.round((d.web / maxVal) * 100), d.web > 0 ? 2 : 0)
          const deskH = Math.max(Math.round((d.desktop / maxVal) * 100), d.desktop > 0 ? 2 : 0)
          const label = d.date.slice(5) // MM-DD

          return (
            <div key={d.date} className="group relative flex flex-1 flex-col items-center h-full justify-end">
              {/* Tooltip */}
              <div className="pointer-events-none absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-xl flex-col gap-1 z-50 min-w-[100px] flex items-center justify-center">
                <span className="font-bold text-slate-800 border-b border-slate-100 pb-1 w-full text-center">{d.date}</span>
                <div className="flex justify-between w-full mt-1">
                  <span className="font-semibold text-blue-500">Web</span>
                  <span className="font-bold text-slate-700">{d.web}</span>
                </div>
                <div className="flex justify-between w-full">
                  <span className="font-semibold text-violet-500">Desktop</span>
                  <span className="font-bold text-slate-700">{d.desktop}</span>
                </div>
              </div>

              {/* Bars container with faint background track */}
              <div className="flex h-full w-full items-end gap-0.5 bg-slate-50/50 rounded-t-sm hover:bg-slate-100 transition-colors">
                <div
                  className="flex-1 rounded-t-sm bg-blue-500 transition-all duration-300 group-hover:bg-blue-400"
                  style={{ height: `${webH}%`, minHeight: webH > 0 ? '4px' : '0' }}
                />
                <div
                  className="flex-1 rounded-t-sm bg-violet-500 transition-all duration-300 group-hover:bg-violet-400"
                  style={{ height: `${deskH}%`, minHeight: deskH > 0 ? '4px' : '0' }}
                />
              </div>

              {/* X Label */}
              <span className="mt-2 text-[10px] font-medium text-slate-500">{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
