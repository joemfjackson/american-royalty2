export default function AdminLoading() {
  return (
    <div className="space-y-6">
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-dark-border bg-dark-card p-6"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="h-3 w-20 animate-pulse rounded bg-white/5" />
                <div className="h-7 w-14 animate-pulse rounded bg-white/10" />
              </div>
              <div className="h-9 w-9 animate-pulse rounded-lg bg-white/5" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div className="flex gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-36 animate-pulse rounded-lg bg-white/5"
          />
        ))}
      </div>

      {/* Table skeletons */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quotes table skeleton */}
        <div className="rounded-xl border border-dark-border bg-dark-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-5 w-48 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-16 animate-pulse rounded bg-white/5" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-8 w-8 animate-pulse rounded-full bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-20 animate-pulse rounded bg-white/5" />
                </div>
                <div className="h-5 w-16 animate-pulse rounded-full bg-white/5" />
              </div>
            ))}
          </div>
        </div>

        {/* Bookings list skeleton */}
        <div className="rounded-xl border border-dark-border bg-dark-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-5 w-44 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-16 animate-pulse rounded bg-white/5" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-lg border border-dark-border p-3"
              >
                <div className="h-12 w-12 animate-pulse rounded-lg bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-56 animate-pulse rounded bg-white/5" />
                </div>
                <div className="h-5 w-16 animate-pulse rounded bg-white/5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
