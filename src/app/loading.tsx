export default function DeckLoading() {
  return (
    <main className="min-h-dvh bg-background px-4 py-4 text-foreground sm:px-6 sm:py-5">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="h-4 w-36 animate-pulse rounded-md bg-muted/55" />
            <div className="h-9 w-52 animate-pulse rounded-md bg-muted/55" />
            <div className="h-4 w-72 animate-pulse rounded-md bg-muted/45" />
          </div>
          <div className="flex gap-2">
            <div className="h-11 w-24 animate-pulse rounded-md bg-muted/55" />
            <div className="h-11 w-44 animate-pulse rounded-lg bg-muted/45" />
            <div className="h-11 w-32 animate-pulse rounded-md bg-muted/55" />
          </div>
        </div>
        <section className="flex flex-1 items-start justify-center py-5 sm:items-center sm:py-7">
          <div className="w-full max-w-[450px] overflow-hidden rounded-lg border border-white/70 bg-card/80 shadow-[0_24px_70px_hsl(var(--shadow-soft)_/_0.14)] ring-1 ring-border/45 backdrop-blur-sm">
            <div className="aspect-[3/4] animate-pulse bg-muted/55" />
            <div className="space-y-4 bg-card/95 p-4 sm:p-5">
              <div className="h-24 animate-pulse rounded-lg bg-muted/45" />
              <div className="flex gap-2">
                <div className="h-8 w-24 animate-pulse rounded-full bg-muted/45" />
                <div className="h-8 w-28 animate-pulse rounded-full bg-muted/45" />
                <div className="h-8 w-20 animate-pulse rounded-full bg-muted/45" />
              </div>
              <div className="h-11 animate-pulse rounded-md bg-muted/45" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
