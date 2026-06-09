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

Set `SHELTER_SLUG` to regenerate one active shelter only.

## Docker

```bash
docker compose up --build
```

SQLite data is stored in the `paws_data` Docker volume at `/data/app.db`. The `sync` service runs on startup and then daily via `SYNC_CRON` and `SYNC_TIMEZONE`.
