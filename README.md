# LLMcompare
https://llmcompare-drab.vercel.app/

Catalog and compare frontier and open-weight LLMs on benchmarks, list prices, context windows, and speed.

## Features

- Sortable model catalog with org filters and open-weight badges
- Side-by-side comparisons with shareable URLs
- Price vs performance scatter chart
- Per-model pages with specs, pricing, and benchmark scores
- Benchmark reference pages with sources
- Latest releases timeline
- Read-only REST API with OpenAPI documentation

Model data lives in `src/data/` and is updated manually.

## Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

## Project layout

```
src/
  app/           # Pages (home, compare, models, benchmarks, releases)
  components/    # UI and feature components
  data/          # Model and benchmark datasets
  lib/           # Helpers for models, orgs, and formatting
```

## API

The catalog is available as a read-only JSON API. Start at [`/api`](http://localhost:3000/api) for the current API index or [`/api/openapi.json`](http://localhost:3000/api/openapi.json) for the OpenAPI 3.1 document.

All versioned endpoints live under `/api/v1` and return an envelope with `data` and `meta` fields. The API is public, cacheable, and CORS-enabled.

```text
GET /api/v1/models
GET /api/v1/models/{slug}
GET /api/v1/models/{slug}/related
GET /api/v1/benchmarks
GET /api/v1/benchmarks/{id}
GET /api/v1/organizations
GET /api/v1/releases
GET /api/v1/compare?a={slug}&b={slug}
GET /api/v1/compare/{a}-vs-{b}
```

`/models` and `/releases` accept `q`, `organization` (or `org`), `family`, `openSource`, `license`, `modality`, `benchmark`, `minScore`, `sort`, `order`, `page`, and `limit`. `limit` is capped at 250. For example:

```text
/api/v1/models?q=claude&openSource=false&sort=lmarena-elo&order=desc&limit=20
/api/v1/models?benchmark=swe-bench-pro&minScore=70
```

## License

[MIT](LICENSE)
