import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  className?: string
  accent?: 'blue' | 'emerald' | 'violet' | 'amber' | 'rose'
}

const accentMap = {
  blue: {
    bg: 'bg-blue-500/10',
    icon: 'text-blue-400',
    border: 'border-blue-500/20',
    glow: 'shadow-blue-500/5',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    icon: 'text-emerald-400',
    border: 'border-emerald-500/20',
    glow: 'shadow-emerald-500/5',
  },
  violet: {
    bg: 'bg-violet-500/10',
    icon: 'text-violet-400',
    border: 'border-violet-500/20',
    glow: 'shadow-violet-500/5',
  },
  amber: {
    bg: 'bg-amber-500/10',
    icon: 'text-amber-400',
    border: 'border-amber-500/20',
    glow: 'shadow-amber-500/5',
  },
  rose: {
    bg: 'bg-rose-500/10',
    icon: 'text-rose-400',
    border: 'border-rose-500/20',
    glow: 'shadow-rose-500/5',
  },
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
  accent = 'blue',
}: MetricCardProps) {
  const colors = accentMap[accent]

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-[#0d1117] p-5 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl',
        colors.border,
        colors.glow,
        className,
      )}
    >
      {/* Glow background */}
      <div
        className={cn(
          'absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl',
          colors.bg.replace('/10', '/40'),
        )}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400">{title}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
          {trend && (
            <span
              className={cn(
                'mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                trend.positive !== false
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-rose-500/10 text-rose-400',
              )}
            >
              {trend.positive !== false ? '↑' : '↓'} {trend.value} {trend.label}
            </span>
          )}
        </div>
        <div className={cn('rounded-xl p-2.5', colors.bg)}>
          <span className={cn('block h-5 w-5', colors.icon)}>{icon}</span>
        </div>
      </div>
    </div>
  )
}
