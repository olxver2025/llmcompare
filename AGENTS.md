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


## README
- ALWAYS double-check prices, scores, model names, speed etc. DO NOT fabricate information.

<!-- headroom:rtk-instructions -->
# RTK (Rust Token Killer) - Token-Optimized Commands

When running shell commands, **always prefix with `rtk`**. This reduces context
usage by 60-90% with zero behavior change. If rtk has no filter for a command,
it passes through unchanged — so it is always safe to use.

## Key Commands
```bash
# Git (59-80% savings)
rtk git status          rtk git diff            rtk git log

# Files & Search (60-75% savings)
rtk ls <path>           rtk read <file>         rtk grep <pattern>
rtk find <pattern>      rtk diff <file>

# Test (90-99% savings) — shows failures only
rtk pytest tests/       rtk cargo test          rtk test <cmd>

# Build & Lint (80-90% savings) — shows errors only
rtk tsc                 rtk lint                rtk cargo build
rtk prettier --check    rtk mypy                rtk ruff check

# Analysis (70-90% savings)
rtk err <cmd>           rtk log <file>          rtk json <file>
rtk summary <cmd>       rtk deps                rtk env

# GitHub (26-87% savings)
rtk gh pr view <n>      rtk gh run list         rtk gh issue list

# Infrastructure (85% savings)
rtk docker ps           rtk kubectl get         rtk docker logs <c>

# Package managers (70-90% savings)
rtk pip list            rtk pnpm install        rtk npm run <script>
```

## Rules
- In command chains, prefix each segment: `rtk git add . && rtk git commit -m "msg"`
- For debugging, use raw command without rtk prefix
- `rtk proxy <cmd>` runs command without filtering but tracks usage
<!-- /headroom:rtk-instructions -->
