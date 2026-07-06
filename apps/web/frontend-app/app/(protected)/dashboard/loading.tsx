export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div className="hidden w-[220px] border-r border-border bg-card lg:block" />
      <main className="flex-1">
        <div className="h-16 border-b border-border bg-card/80" />
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
          <div className="h-9 w-52 animate-pulse rounded-lg bg-muted" />
          <div className="flex gap-3">
            <div className="h-10 w-80 animate-pulse rounded-lg bg-muted" />
            <div className="h-10 w-16 animate-pulse rounded-lg bg-muted" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-56 animate-pulse rounded-xl border border-border bg-card shadow-sm">
                <div className="h-28 rounded-t-xl bg-muted/70" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-2/3 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                  <div className="h-8 rounded bg-muted/60" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
