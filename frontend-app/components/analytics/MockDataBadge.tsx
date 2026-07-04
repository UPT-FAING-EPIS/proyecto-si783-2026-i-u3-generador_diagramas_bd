'use client'

/** Badge visible en el header cuando el dashboard está mostrando datos de demo */
export function MockDataBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-amber-400">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
      Datos Demo
    </span>
  )
}
