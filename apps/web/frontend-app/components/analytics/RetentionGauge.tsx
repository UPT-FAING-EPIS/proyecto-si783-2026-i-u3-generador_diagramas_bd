interface RetentionGaugeProps {
  rate: number  // 0–100
  avgSessions: number
}

/**
 * Gauge circular de retención de usuarios + promedio de sesiones.
 * Construido con SVG puro — sin dependencias externas.
 */
export function RetentionGauge({ rate, avgSessions }: RetentionGaugeProps) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  // Sólo mostramos el arco de la mitad inferior del círculo (semicírculo)
  const arcLength = circumference * 0.75
  const filled = (Math.min(rate, 100) / 100) * arcLength

  // Color del gauge según el rate
  const gaugeColor =
    rate >= 70 ? '#10b981' :   // emerald
    rate >= 50 ? '#f59e0b' :   // amber
    '#ef4444'                   // rose

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-around">
      {/* Gauge SVG */}
      <div className="relative flex flex-col items-center">
        <svg width="140" height="100" viewBox="-10 -10 140 110" className="overflow-visible">
          {/* Track */}
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth="14"
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            strokeDashoffset={circumference * 0.125}
            strokeLinecap="round"
            style={{ transform: 'rotate(135deg)', transformOrigin: '60px 60px' }}
          />
          {/* Filled arc */}
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={gaugeColor}
            strokeWidth="14"
            strokeDasharray={`${filled} ${circumference - filled}`}
            strokeDashoffset={circumference * 0.125}
            strokeLinecap="round"
            style={{ transform: 'rotate(135deg)', transformOrigin: '60px 60px', transition: 'stroke-dasharray 1s ease' }}
          />
          {/* Porcentaje */}
          <text x="60" y="58" textAnchor="middle" fill="white" fontSize="22" fontWeight="700">
            {rate}%
          </text>
          <text x="60" y="74" textAnchor="middle" fill="#64748b" fontSize="9">
            retención
          </text>
        </svg>
      </div>

      {/* Promedio de sesiones */}
      <div className="text-center sm:text-left">
        <p className="text-3xl font-bold text-white">{avgSessions.toFixed(1)}</p>
        <p className="text-xs text-slate-400">sesiones promedio</p>
        <p className="text-xs text-slate-500">por usuario (30 días)</p>
        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <span className={`h-2 w-2 rounded-full ${rate >= 70 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} />
            <span className="text-slate-400">
              {rate >= 70 ? 'Excelente retención' : rate >= 50 ? 'Retención aceptable' : 'Retención baja'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
