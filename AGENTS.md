# Agent Notes

## Project

Paws for Life is a private shelter-dog adoption MVP. It scrapes sitemap listings, stores pets in SQLite via Prisma, enriches profiles with optional AI copy, and serves a card-first adoption deck.

## Stack

- Next.js App Router, React, TypeScript, Tailwind CSS.
- Prisma + SQLite.
- Cheerio and fast-xml-parser for scraping.
- Motion for swipe gestures and card animation.
- Vitest and Testing Library for tests.

## Key Files

- `src/components/PetDeck.tsx`: deck state and composition.
- `src/components/pet-deck/*`: card, header, filters, shortlist, match/adoption UI.
- `src/content/ro.ts`: user-facing Romanian copy.
- `src/lib/shelters/config.ts`: shelter env config and default shelter lookup.
- `src/lib/shelter/*`: parser, sync, and availability reconciliation.
- `src/lib/pets/*`: repository, filters, sorting, profile generation.
- `prisma/schema.prisma` and `prisma/migrations/*`: data model and migrations.

## Commands

- Install: `npm install`
- Prepare DB: `npm run db:migrate`
- Ensure fallback DB schema: `npm run db:ensure`
- Scrape once: `npm run sync`
- Regenerate AI profiles: `npm run profiles:regenerate`
- Dev server: `npm run dev`
- Build: `npm run build`
- Tests: `npm test`
- Docker: `docker compose up --build`

## Guidelines

- Keep edits small and aligned with existing patterns.
- Update copy in `src/content/ro.ts` instead of hardcoding UI text.
- Frontend is default-shelter-only for now; do not expose shelter fields in `/api/pets`.
- `npm run sync` should process all active shelters and reconcile availability per shelter.
- Add or update tests for behavior changes.
- Use `rg`, excluding heavy folders when needed: `rg "term" -g "!node_modules" -g "!.next"`.
- Do not revert unrelated user changes.

## Local Gotchas

- Network/scraper/dependency commands can need approval.
- Vitest may fail in the sandbox with `spawn EPERM`; rerun the same `npm test` command with escalation.
- Prisma generate/build can fail in the sandbox while checking engine binaries; rerun with escalation.
- Running Next can lock Prisma DLLs on Windows. Stop only local project Node processes before `npm run build` if Prisma reports `EPERM` renaming `query_engine-windows.dll.node`.
- The app displays shelter-hosted image URLs; it does not download pet photos.
