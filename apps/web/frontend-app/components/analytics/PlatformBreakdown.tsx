interface PlatformBreakdownProps {
  web: number
  desktop: number
  anonymous: number
}

export function PlatformBreakdown({ web, desktop, anonymous }: PlatformBreakdownProps) {
  const total = web + desktop + anonymous || 1
  const webPct = Math.round((web / total) * 100)
  const deskPct = Math.round((desktop / total) * 100)
  const anonPct = Math.round((anonymous / total) * 100)

  const bars = [
    { label: 'Web', value: web, pct: webPct, color: 'bg-blue-500' },
    { label: 'Desktop', value: desktop, pct: deskPct, color: 'bg-violet-500' },
    { label: 'Anónimo', value: anonymous, pct: anonPct, color: 'bg-slate-600' },
  ]

  return (
    <div className="space-y-4">
      {/* Stacked bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full">
        <div className="bg-blue-500 transition-all" style={{ width: `${webPct}%` }} />
        <div className="bg-violet-500 transition-all" style={{ width: `${deskPct}%` }} />
        <div className="bg-slate-600 transition-all" style={{ width: `${anonPct}%` }} />
      </div>

      {/* Legend rows */}
      <div className="space-y-2">
        {bars.map((b) => (
          <div key={b.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
              <span className="text-slate-400">{b.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-white">{b.value.toLocaleString()}</span>
              <span className="w-10 text-right text-xs text-slate-500">{b.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
