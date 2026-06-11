export default function GalleryLoading() {
  return (
    <main className="min-h-dvh bg-background px-4 py-4 text-foreground sm:px-6 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="h-20 animate-pulse rounded-lg border border-white/70 bg-card/80 shadow-gentle ring-1 ring-border/45" />
        <section className="overflow-hidden rounded-lg border border-white/70 bg-card/80 p-4 shadow-gentle ring-1 ring-border/45">
          <div className="grid grid-cols-[92px_1fr] gap-3 sm:grid-cols-[160px_1fr]">
            <div className="aspect-square animate-pulse rounded-lg bg-muted/55 sm:min-h-40" />
            <div className="space-y-3">
              <div className="h-6 w-28 animate-pulse rounded-full bg-muted/55" />
              <div className="h-8 w-40 animate-pulse rounded-md bg-muted/55" />
              <div className="h-16 animate-pulse rounded-md bg-muted/45" />
              <div className="h-2 animate-pulse rounded-full bg-muted/55" />
            </div>
          </div>
        </section>
        <section className="rounded-lg border border-white/70 bg-card/80 p-4 shadow-gentle ring-1 ring-border/45">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-2">
              <div className="h-7 w-36 animate-pulse rounded-md bg-muted/55" />
              <div className="h-4 w-48 animate-pulse rounded-md bg-muted/45" />
            </div>
            <div className="h-11 w-48 animate-pulse rounded-md bg-muted/55" />
          </div>
          <div className="flex gap-2 overflow-hidden">
            <div className="h-9 w-20 shrink-0 animate-pulse rounded-full bg-muted/55" />
            <div className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-muted/55" />
            <div className="h-9 w-20 shrink-0 animate-pulse rounded-full bg-muted/55" />
            <div className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-muted/55" />
          </div>
        </section>
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-lg border border-white/70 bg-card/80 shadow-gentle ring-1 ring-border/45"
            >
              <div className="aspect-[4/3] animate-pulse bg-muted/55" />
              <div className="space-y-3 p-4">
                <div className="h-7 w-28 animate-pulse rounded-md bg-muted/55" />
                <div className="h-14 animate-pulse rounded-md bg-muted/45" />
                <div className="flex gap-2">
                  <div className="h-7 w-20 animate-pulse rounded-full bg-muted/55" />
                  <div className="h-7 w-24 animate-pulse rounded-full bg-muted/55" />
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
