# Gallery View, Shareable Pet Details, and Cleaner UI V1

## Summary
Build a coherent v1 that keeps the current swipe deck as the default view, adds a toggleable gallery view, introduces shareable pet detail pages at `/pets/[id]`, and applies a targeted UI refresh inspired by the mockups. Gallery mode will include a “Dog of the day” spotlight, quick filter pills, a compact full-sort/filter control, silent save hearts, and mobile progressive reveal/infinite scroll.

## Key Changes
- Keep `/` defaulting to the current deck. Add a view toggle that uses `?view=gallery`; returning to deck clears or sets `?view=deck`.
- Add `/pets/[id]` as the canonical share/detail route for all devices. Gallery cards, dog-of-day “Meet” actions, and share links open this route.
- Extend the `PetCard` client shape with ISO `captureDate` and likely `firstSeenAt` metadata, without exposing shelter fields or requiring a database migration.
- Add a shared shortlist hook so deck, gallery, and detail pages use the same localStorage behavior. Gallery/detail hearts silently toggle saved state; deck likes keep the match dialog.
- Update pet-specific adoption CTAs to include the generated pet name with sex-aware Romanian copy, e.g. “Adoptă-l pe Bruno” / “Adopt-o pe Luna”, with neutral fallback.

## Gallery And Detail UX
- Gallery desktop: responsive card grid, cleaner shared header, filter/sort controls, and a top “Dog of the day” band/card.
- Gallery mobile: list-style cards similar to the mockup, initial batch shown first, then more revealed via an `IntersectionObserver` sentinel as the user scrolls.
- Quick filter pills: `small`, `medium`, `large`, `young`, `adult`, `senior`. Age buckets are `young ≤2`, `adult 3-7`, `senior 8+`; unparseable ages are excluded only when an age chip is active.
- Full sort set: current/recommended order, longest waiting, newest capture date, and recently added.
- Dog of the day: daily deterministic random pick from available dogs whose official `captureDate` is more than 7 days old; dogs without `captureDate` are not eligible. If none qualify, hide the spotlight.
- Detail page: mobile-first full page with large image, name, registry/details, chips, profile bio, save/share actions, named adoption CTA, official listing link, and unavailable state if needed.

## Implementation Notes
- Split `PetDeck` into smaller view-level pieces: shared shell/header controls, deck view, gallery view, dog-of-day spotlight, gallery card/list card, and pet detail client component.
- Add small pure helpers for age bucket parsing, gallery sorting, deterministic dog-of-day selection, CTA label generation, and share/copy behavior.
- Preserve the existing dirty local changes in `ShortlistDrawer.tsx` and `tests/pet-deck.test.tsx`; build on top of them rather than reverting.
- Keep Romanian copy centralized in `src/content/ro.ts`.

## Test Plan
- Unit tests for age bucket parsing, gallery sort modes, dog-of-day eligibility/selection, and named adoption CTA labels.
- Component tests for deck default view, gallery toggle URL behavior, quick filter pills, silent gallery save, mobile progressive reveal, and dog-of-day actions.
- Route/detail tests or component coverage for `/pets/[id]`, not-found behavior, unavailable badge, share button fallback, and official listing link.
- Update repository tests for the new `PetCard` date fields.
- Verify with `npm test` and `npm run build`.

## Assumptions
- No schema migration is needed; existing `captureDate`, `firstSeenAt`, and availability fields are enough.
- The cleaner UI pass is targeted, not a full sidebar/landing-page redesign.
- Gallery infinite scroll is progressive client-side reveal, not API pagination.
- Shared pet URLs use internal pet IDs, not registry numbers, to avoid uniqueness assumptions.
