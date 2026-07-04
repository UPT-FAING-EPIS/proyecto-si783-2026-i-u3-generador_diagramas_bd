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
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-100',
  },
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    border: 'border-emerald-100',
  },
  violet: {
    bg: 'bg-violet-50',
    icon: 'text-violet-600',
    border: 'border-violet-100',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    border: 'border-amber-100',
  },
  rose: {
    bg: 'bg-rose-50',
    icon: 'text-rose-600',
    border: 'border-rose-100',
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
        'relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md border-slate-100',
        className,
      )}
    >
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-2">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-slate-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <div className="mt-3 flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                  trend.positive !== false
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-rose-50 text-rose-600',
                )}
              >
                {trend.positive !== false ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-xs text-slate-500">{trend.label}</span>
            </div>
          )}
          {subtitle && !trend && <p className="mt-3 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className={cn('rounded-full p-3', colors.bg)}>
          <span className={cn('block h-6 w-6', colors.icon)}>{icon}</span>
        </div>
      </div>
    </div>
  )
}
