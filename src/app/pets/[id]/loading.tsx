export default function PetDetailLoading() {
  return (
    <main className="min-h-dvh bg-[linear-gradient(135deg,hsl(var(--deck-sky))_0%,hsl(var(--deck-mint))_54%,hsl(var(--background))_100%)] px-4 py-4 text-foreground sm:px-6 sm:py-6">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-3">
          <div className="h-10 w-10 rounded-full border border-white/70 bg-card/80 shadow-sm ring-1 ring-border/45" />
          <div className="h-4 w-28 rounded-md bg-muted/55 motion-safe:animate-pulse" />
          <div className="h-10 w-10 rounded-full border border-white/70 bg-card/80 shadow-sm ring-1 ring-border/45" />
        </header>

        <article className="mt-4 overflow-hidden rounded-lg border border-white/70 bg-card/90 shadow-[0_24px_70px_hsl(var(--shadow-soft)_/_0.16)] ring-1 ring-border/50 backdrop-blur-sm">
          <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-stretch">
            <div className="aspect-[4/5] bg-muted/55 motion-safe:animate-pulse lg:aspect-auto lg:min-h-[560px]" />

            <div className="space-y-5 bg-card/95 p-5 sm:p-7">
              <div className="space-y-3">
                <div className="h-4 w-28 rounded-md bg-muted/55 motion-safe:animate-pulse" />
                <div className="h-12 w-52 rounded-md bg-muted/55 motion-safe:animate-pulse" />
                <div className="h-5 w-44 rounded-md bg-muted/45 motion-safe:animate-pulse" />
              </div>

              <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-4">
                <div className="h-4 w-full rounded-md bg-muted/55 motion-safe:animate-pulse" />
                <div className="h-4 w-[92%] rounded-md bg-muted/55 motion-safe:animate-pulse" />
                <div className="h-4 w-[78%] rounded-md bg-muted/55 motion-safe:animate-pulse" />
                <div className="h-4 w-[86%] rounded-md bg-muted/55 motion-safe:animate-pulse" />
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="h-9 w-24 rounded-full bg-muted/55 motion-safe:animate-pulse" />
                <div className="h-9 w-28 rounded-full bg-muted/55 motion-safe:animate-pulse" />
                <div className="h-9 w-24 rounded-full bg-muted/55 motion-safe:animate-pulse" />
                <div className="h-9 w-36 rounded-full bg-muted/55 motion-safe:animate-pulse" />
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="h-11 w-28 rounded-md bg-muted/55 motion-safe:animate-pulse" />
                <div className="h-11 w-28 rounded-md bg-muted/55 motion-safe:animate-pulse" />
                <div className="h-11 w-44 rounded-md bg-muted/55 motion-safe:animate-pulse" />
              </div>

              <div className="h-12 w-48 rounded-full bg-muted/55 motion-safe:animate-pulse" />
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
