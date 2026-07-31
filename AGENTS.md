<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

This is a single-service, self-contained Next.js 16 (App Router, Turbopack) + React 19 frontend. There is no database, no API routes, and no environment variables — model/benchmark data is static in `src/data/`. The startup update script already runs `npm install`.

Standard commands live in `package.json` (`dev`, `build`, `start`, `lint`) and are documented in `README.md`. Run the dev server with `npm run dev` (serves on `http://localhost:3000`).

Non-obvious notes:
- `npm run lint` currently reports pre-existing lint errors (e.g. in `src/components/theme-toggle.tsx` and `src/components/scatter-chart.tsx`). These are not environment problems; treat them as the existing baseline unless a task is specifically about fixing lint.
- There is no `/models` index route — model pages are only `/models/[slug]`, so hitting `/models` directly returns 404 (expected). The comparison feature lives at `/compare` (picker) and `/compare/[slug]` (shareable `slugA-vs-slugB` pages).
