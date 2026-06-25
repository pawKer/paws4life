# Paws for Life

Private MVP for browsing shelter dogs in a Tinder-style adoption deck.

## Local Development

```bash
npm install
npm run db:migrate
npm run sync
npm run dev
```

Open `http://localhost:3000`. User-facing Romanian copy lives in `src/content/ro.ts`.

Use `npm run db:ensure` only as an explicit local repair/bootstrap helper; production migrations should fail loudly.

## Shelters

Backend supports multiple shelters; the frontend shows only the default shelter.

Use `SHELTERS_JSON` for multiple shelters:

```json
[
  {
    "slug": "adapost-canin-craiova",
    "name": "Adapost Canin Craiova",
    "sitemapIndexUrl": "https://www.adapostcanincraiova.ro/sitemap_index.xml",
    "isActive": true,
    "isDefault": true
  }
]
```

If `SHELTERS_JSON` is empty, the app falls back to `SITEMAP_INDEX_URL`.

## AI Profiles

Set `OPENAI_API_KEY` to generate profile names and bios after sync. Tune with `OPENAI_MODEL`, `OPENAI_RESPONSES_URL`, `PROFILE_BATCH_SIZE`, and `PROFILE_LOG_IO`.

```bash
npm run profiles:regenerate
```

Set `SHELTER_SLUG` to regenerate one active shelter only. Set `PROFILE_REGENERATE_NAMES=keep` to refresh bios while preserving existing names; the default `replace` mode regenerates both names and bios.

## Share Images

Sync generates static pet profile and story PNGs for available pets by default. Files are written to `public/generated/pets` with deterministic pet-id based names, while downloaded/shared filenames use the registry number.

```bash
npx playwright install chromium
npm run share-images:generate
```

The Docker image installs Chromium during build, so this manual Playwright install is only needed for local generation.

Set `SHARE_IMAGES_ON_SYNC=false` to skip image generation during sync. Use `SHARE_IMAGE_FORCE=true` to regenerate available pets, `SHARE_IMAGE_LIMIT` for smoke runs, `SHARE_IMAGE_PET_ID` for one pet, and `SHARE_IMAGE_BASE_URL` to point the generator at an already-running app.

To refresh all local share images after design or copy changes:

```bash
SHARE_IMAGE_FORCE=true npm run share-images:generate
```

Regenerating AI profiles does not render PNGs directly. It updates profile copy and clears `shareImagesGeneratedAt`, so the next sync or `npm run share-images:generate` recreates the images. For a full local profile-and-image refresh:

```bash
npm run profiles:regenerate
SHARE_IMAGE_FORCE=true npm run share-images:generate
```

## Docker

```bash
PAWS_DATA_PATH=/absolute/path/to/paws-data
docker compose up --build
```

Set `PAWS_DATA_PATH` to a host directory before running Docker. SQLite data is stored at `PAWS_DATA_PATH/app.db`, and generated share PNGs are stored at `PAWS_DATA_PATH/pet-images`. The `sync` service runs on startup and then daily via `SYNC_CRON` and `SYNC_TIMEZONE`.

To refresh all Docker share images without regenerating profile copy:

```bash
docker compose run --rm -e SHARE_IMAGE_FORCE=true sync npm run share-images:generate
```

To regenerate profile copy first, then render all share images:

```bash
docker compose --profile regenerate run --rm regenerate-profiles
docker compose run --rm -e SHARE_IMAGE_FORCE=true sync npm run share-images:generate
```

The Docker `sync` and `web` services both mount `PAWS_DATA_PATH/pet-images`, so generated PNGs are immediately available to the app.
