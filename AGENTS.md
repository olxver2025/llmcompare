# LLMcompare Agent Instructions

## Project purpose

LLMcompare is a curated comparison site for frontier and open-weight LLMs.

It presents:

* Model specifications
* API pricing
* Context windows
* Modalities
* Speed
* Benchmark scores
* Benchmark methodology and sources
* Model comparisons
* Release timelines
* A read-only REST API

The project is intentionally **data-first and provenance-first**. Accuracy of model metadata and benchmark results is more important than filling every field.

## Stack

* Next.js 16
* App Router
* React 19
* TypeScript
* Tailwind CSS 4
* shadcn/ui
* Recharts
* ESLint 9
* Node.js tooling

Do not introduce a new framework, state-management library, database, ORM, or data-fetching layer without a strong reason.

## Repository structure

```text
src/
  app/             Next.js routes and pages
  components/      Shared UI and feature components
  data/            Curated model and benchmark datasets
  lib/             Formatting, lookup, comparison, and domain helpers

scripts/
  generate-benchmark-evidence.mjs
  verify-data.mjs
  update-benchmarks/

public/
  Static assets
```

The primary source of truth for catalog data is `src/data/`.

## Core rule: never fabricate data

This is the most important rule in the repository.

Never guess, infer, round into existence, or fabricate:

* Benchmark scores
* Prices
* Context windows
* Output limits
* Release dates
* Model names
* Model availability
* Speed
* Parameter counts
* Licensing
* Modalities
* Benchmark versions
* Leaderboard positions

If a value cannot be verified from a trustworthy source, leave it absent.

An empty field is better than an invented value.

Do not fill missing benchmark scores with:

* Estimates
* "Probably"
* Results from a different benchmark
* Results from a different benchmark version
* Results from a different model variant
* Results from an unrelated agent configuration

## Source hierarchy

Prefer sources in this order:

1. Official benchmark leaderboard
2. Benchmark creator's repository or official benchmark page
3. Official model/provider technical report, system card, or model card
4. Independent reputable evaluator with documented methodology
5. Reputable secondary source that clearly cites a primary source

Use search engines, papers, GitHub, Hugging Face, Artificial Analysis, provider documentation, and official leaderboards to verify information.

Do not use:

* Random SEO articles
* Unsourced benchmark tables
* Social-media screenshots
* Reddit comments as sole evidence
* Search snippets as final evidence
* Another comparison website as the only source

## Benchmark provenance

Every benchmark result must be treated as a versioned measurement.

When adding or updating a score, determine:

* Exact benchmark name
* Exact benchmark version
* Evaluation date
* Metric
* Score scale
* Whether higher is better
* Prompt/shot configuration when relevant
* Reasoning mode or effort when relevant
* Tool access when relevant
* Modality when relevant
* Agent scaffold/harness when relevant
* Sampling/pass@k when relevant
* Source URL

Do not assume two scores are comparable simply because the benchmark has the same name.

Examples:

* GPQA is not automatically GPQA Diamond.
* MATH is not automatically MATH-500.
* SWE-bench is not automatically SWE-bench Verified.
* SWE-bench Verified is not SWE-bench Pro.
* Terminal-Bench 2.0 is not Terminal-Bench 2.1.
* BFCL v3 is not current BFCL.
* SciCode and SciCode-Verified must remain distinct.
* SimpleQA and SimpleQA Verified must remain distinct.
* HLE text-only and multimodal results must not be silently merged.
* AIME 2025 results must not be mixed with older AIME evaluations.

## Model identity

Keep model variants separate when their evaluation conditions or capabilities differ.

Examples:

* A model's standard and fast API modes may be separate catalog entries when they represent distinct products.
* Thinking/reasoning and non-thinking variants should remain distinct.
* Preview and production releases should remain distinct when relevant.
* Chat and API variants should not be merged without evidence that they are equivalent.

Do not copy one model's benchmark scores onto another simply because the names are similar.

## Benchmark score policy

Use the benchmark's native metric.

Examples:

* Percent accuracy should remain percent.
* Elo should remain Elo.
* Win rate should remain win rate.
* pass@k should remain pass@k.
* Success rate should not be renamed to accuracy.

Do not convert or normalize benchmark results unless the application explicitly requires it.

Do not create a fake universal "intelligence score" by averaging unrelated benchmarks.

## Agent benchmark policy

Some coding benchmarks evaluate an entire agent system rather than a raw model.

For benchmarks such as:

* SWE-bench
* SWE-bench Pro
* SWE-bench Multilingual
* Terminal-Bench
* CursorBench
* Vibe Code Bench
* WebDev Arena
* SWE-Rebench

do not describe a score as pure model capability when the benchmark actually evaluates an agent, harness, scaffold, IDE, tool configuration, or orchestration system.

Preserve the benchmark's actual evaluation context.

## Data files

Before changing data, inspect:

* `src/data/types.ts`
* `src/data/models.ts`
* `src/data/benchmarks.ts`
* Related organization/release data
* Existing validation scripts

Follow the existing types instead of weakening them.

Do not use `any` to bypass data-model problems.

Do not disable TypeScript or ESLint checks to make bad data compile.

## Model additions

When adding a model:

1. Verify the official model name.
2. Verify the organization.
3. Verify the release date.
4. Verify pricing from the primary provider when available.
5. Verify context and output limits.
6. Verify modalities.
7. Add only benchmark scores that can be sourced.
8. Add useful official links.
9. Keep the slug stable and readable.
10. Run the data verification script.

Prefer official provider documentation for pricing and specifications.

Prices should be treated as time-sensitive data.

Never assume a provider's current price from an old article.

## Benchmark additions

When adding a benchmark:

1. Verify the benchmark exists and is active or intentionally historical.
2. Record its exact official name.
3. Give it a stable ID.
4. Write a concise methodology description.
5. Set the correct category.
6. Set the correct metric/unit.
7. Set `higherIsBetter` correctly.
8. Add the canonical source URL.
9. Add it to the appropriate benchmark category.
10. Verify affected model records.

The benchmark description should explain important comparability caveats.

## Source URLs

Use direct, canonical URLs.

Good:

```text
https://www.swebench.com/verified.html
https://artificialanalysis.ai/evaluations/gpqa-diamond
https://openai.com/index/introducing-simpleqa/
```

Avoid:

* Google search result URLs
* Tracking URLs
* URL shorteners
* Random article mirrors
* Unstable deep links when a stable canonical page exists

## Updating benchmark data

The repository has dedicated scripts:

```bash
npm run generate:evidence
npm run verify:data
npm run update:benchmarks
```

Use the update tooling where appropriate instead of manually duplicating generated data.

After changing benchmark data:

```bash
npm run verify:data
npm run lint
npm run build
```

If the project has known baseline lint failures, distinguish pre-existing failures from regressions caused by your changes.

## Verification before editing

Before modifying unfamiliar code:

1. Read the relevant file.
2. Read the relevant types.
3. Search for existing patterns.
4. Check whether the behavior is generated or manually maintained.
5. Inspect affected routes/components.
6. Make the smallest change that solves the task.

Do not rewrite large files unnecessarily.

## UI rules

Keep the UI consistent with the existing application.

Prefer:

* Existing shadcn/ui components
* Existing Tailwind conventions
* Existing typography
* Existing spacing
* Existing cards/tables/charts
* Existing responsive patterns

Do not introduce a second visual system.

Do not add unnecessary animations, gradients, effects, or dependencies.

Benchmark and model tables should prioritize:

* Readability
* Sorting
* Clear units
* Provenance
* Mobile usability
* Correct handling of missing data

## Charts

When changing benchmark charts:

* Preserve the benchmark's native metric.
* Label axes clearly.
* Do not imply comparability where the underlying evaluations are not comparable.
* Make missing values distinct from zero.
* Avoid misleading rankings based on incomplete data.
* Ensure tooltips identify the exact model and benchmark.

Do not treat missing data as zero.

## API

The API is read-only and versioned under:

```text
/api/v1
```

Existing endpoints include:

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

Do not break existing API response shapes without an explicit migration plan.

Preserve:

```text
data
meta
```

envelopes for versioned endpoints.

## Routing

The application uses the Next.js App Router.

Do not assume every obvious route exists.

For example, model pages use:

```text
/models/[slug]
```

and comparisons use:

```text
/compare
/compare/[slug]
```

Check the actual route tree before creating links or redirects.

## Accessibility

All UI changes should preserve:

* Keyboard navigation
* Semantic HTML
* Visible focus states
* Accessible labels
* Sufficient contrast
* Screen-reader-friendly controls

Do not remove an accessible label simply to make the UI visually cleaner.

## Dependencies

Do not add dependencies for functionality that can reasonably use:

* Existing utilities
* Browser APIs
* React
* Next.js
* Existing project packages

Before adding a package, check whether the project already has an equivalent.

Avoid dependency churn.

## Performance

Keep pages lightweight.

Avoid:

* Large client-side libraries
* Unnecessary client components
* Repeated expensive calculations
* Duplicate data fetching
* Shipping large datasets to the browser when server-side filtering is possible

Prefer server components unless client interactivity is actually needed.

## Generated artifacts

Do not manually edit generated files if a repository script owns them.

First determine:

* What generated the file?
* What is the source of truth?
* Which script regenerates it?

Update the source and regenerate when appropriate.

## Validation

Minimum validation for code changes:

```bash
npm run lint
npm run build
```

Minimum validation for data changes:

```bash
npm run verify:data
npm run lint
npm run build
```

For benchmark updates, also inspect the resulting rendered pages or API responses when practical.

## Git discipline

Keep changes focused.

Do not:

* Reformat unrelated files
* Rename unrelated variables
* Upgrade dependencies opportunistically
* Rewrite unrelated components
* Remove existing data without verification

A benchmark update should normally produce a small, reviewable diff.

## Commits

Use clear commit messages.

Examples:

```text
data: update benchmark scores
data: add GPT-5.6 model metadata
fix: correct SWE-bench Pro source
feat: add benchmark comparison filters
fix: preserve missing benchmark values
```

## Security

Never commit:

* API keys
* Access tokens
* Provider credentials
* Personal secrets
* `.env` contents
* Private URLs containing credentials

Use environment variables only when the architecture actually requires them.

## When uncertain

For factual questions about models or benchmarks:

**verify first, then edit.**

For code questions:

**inspect the existing implementation, then follow its established patterns.**

For missing data:

**leave it missing rather than guessing.**

The project's credibility depends more on trustworthy data than on completeness.
