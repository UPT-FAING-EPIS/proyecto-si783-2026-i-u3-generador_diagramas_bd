export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen bg-[#060a10] text-white">
      {/* Header skeleton */}
      <header className="border-b border-slate-800/60 px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 w-40 animate-pulse rounded bg-slate-800" />
            <div className="h-3 w-32 animate-pulse rounded bg-slate-800" />
          </div>
          <div className="h-8 w-28 animate-pulse rounded-lg bg-slate-800" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        {/* Metric cards skeleton */}
        {[1, 2].map((section) => (
          <section key={section}>
            <div className="mb-4 h-3 w-24 animate-pulse rounded bg-slate-800" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-2xl border border-slate-800 bg-[#0d1117]"
                />
              ))}
            </div>
          </section>
        ))}

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-2xl border border-slate-800 bg-[#0d1117]"
            />
          ))}
        </div>
      </main>
    </div>
  )
}
