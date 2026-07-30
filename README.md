# LLMcompare

Catalog and compare frontier and open-weight LLMs on benchmarks, list prices, context windows, and speed.

## Features

- Sortable model catalog with org filters and open-weight badges
- Side-by-side comparisons with shareable URLs
- Price vs performance scatter chart
- Per-model pages with specs, pricing, and benchmark scores
- Benchmark reference pages with sources
- Latest releases timeline

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

## License

Private for now.
