import type { HourlyCount } from '@/lib/backend/actions/telemetry/getAnalyticsSummary'

interface HourlyChartProps {
  data: HourlyCount[]
  peakHour: string
}

export function HourlyActivityChart({ data, peakHour }: HourlyChartProps) {
  const maxVal = Math.max(...data.map((d) => d.sessions), 1)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Actividad por hora (últimos 7 días)</span>
        <span className="text-emerald-400 font-medium">🕐 Pico: {peakHour}</span>
      </div>

      <div className="flex h-20 items-end gap-px">
        {data.map((d) => {
          const barH = Math.round((d.sessions / maxVal) * 100)
          const isCurrentHour = d.hour === new Date().getHours()
          const isPeakRange = barH >= 80

          return (
            <div
              key={d.hour}
              className="group relative flex flex-1 flex-col items-center"
            >
              {/* Tooltip */}
              <div className="pointer-events-none absolute bottom-full mb-1 hidden rounded-md border border-slate-700 bg-[#0d1117] px-2 py-1 text-xs shadow-xl group-hover:block z-10 whitespace-nowrap">
                <span className="font-semibold text-white">{String(d.hour).padStart(2, '0')}:00</span>
                <span className="ml-1.5 text-slate-400">{d.sessions} sesiones</span>
              </div>

              <div
                className={`w-full rounded-t transition-all duration-300 group-hover:opacity-100 ${
                  isCurrentHour
                    ? 'bg-emerald-500 opacity-100'
                    : isPeakRange
                    ? 'bg-blue-500 opacity-80'
                    : 'bg-slate-600 opacity-50 group-hover:bg-blue-400'
                }`}
                style={{ height: `${Math.max(barH, 4)}%` }}
              />
            </div>
          )
        })}
      </div>

      {/* X-axis labels (cada 6h) */}
      <div className="flex justify-between text-[10px] text-slate-600 px-0.5">
        {['00h', '06h', '12h', '18h', '23h'].map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  )
}
