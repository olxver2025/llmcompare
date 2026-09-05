---
name: verify-data-sources
description: Verify that every model fact a pull request adds or changes is actually stated by the source it cites. Reads data-diff.json, fetches each cited source, and writes source-verdict.json. Used by the data-integrity CI workflow.
allowed-tools: Read, Grep, Glob, Write, WebFetch, WebSearch, Bash(node scripts/ci/*), Bash(git diff:*), Bash(git log:*), Bash(cat:*)
---

# Verify changed catalog data against its sources

You are the last line of defence against fabricated data in LLMcompare. The
deterministic checks have already run: the ledger is reproducible, every changed
cell has an evidence entry, and every cited URL resolves. None of that proves the
cited page actually reports the number in the diff. That is your job.

## What to do

1. Read `data-diff.json` in the repository root. It lists every fact this pull
   request adds or changes, already resolved from the parsed catalog, so
   reformatting noise is not in it.
2. Read `AGENTS.md` for the project's provenance and comparability rules.
3. For each item in the diff, open the source it cites with `WebFetch` and decide
   whether the source states that value, for that model, on that benchmark
   version, under that protocol.
4. Write `source-verdict.json` (schema below). Write it even if you could read
   nothing; an unwritten file fails the build.

Work through the items in this order, since the first two carry the most risk:

- `benchmarkCells` — each has `slug`, `benchmarkId`, `after` (the value in this
  PR), and `evidence` with `sourceUrl`, `evaluationDate`, and `protocol`.
- `addedModels` — check the release date, context window, output limit, pricing,
  and modalities against the model's own `links`.
- `changedFields` — pricing, context windows, release dates, parameter counts and
  licences on models that already existed.
- `benchmarkMetaChanges` — benchmark definitions, units, and canonical URLs.

## What counts as confirmed

Mark an item `confirmed` only when the cited page states the value for **that
exact model variant** and **that exact benchmark version**. Be strict about the
distinctions `AGENTS.md` calls out:

- GPQA is not GPQA Diamond; MATH is not MATH-500; SWE-bench is not SWE-bench
  Verified; SWE-bench Verified is not SWE-bench Pro; Terminal-Bench 2.0 is not
  2.1; SimpleQA is not SimpleQA Verified; SciCode is not SciCode-Verified.
- HLE text-only and multimodal results are different measurements.
- A thinking or reasoning variant's score is not the non-thinking variant's
  score, and a preview release is not the production release.
- An agent benchmark score belongs to a model *plus* a harness, scaffold, and
  effort setting. If the protocol note claims a different harness or effort level
  than the source reports, that is a contradiction even when the number matches.
- Rounding is fine (`72.65` cited as `72.7`); a different number is not.

If the value is right but the protocol note misdescribes how it was measured,
mark the item `contradicted` and say so in the note. The note is part of the
claim.

## When you cannot read the source

Providers rate-limit and bot-wall aggressively. If a fetch fails, is truncated,
or returns a page that does not contain the leaderboard (client-rendered tables
are common), try once more, and consider `WebSearch` to find the same figure on
the same primary source. If you still cannot see the value, mark the item
`unverifiable` and say exactly what happened. Do **not** mark it `confirmed`
because the number looks plausible, and do **not** mark it `contradicted` because
you could not find it — absence of evidence on an unreadable page is not
contradiction. `unverifiable` does not fail the build; a wrong verdict in either
direction is worse than an honest one.

## Output

Write `source-verdict.json` in the repository root:

```json
{
  "checkedAt": "2026-09-05",
  "items": [
    {
      "id": "gpt-6-astra/gpqa-diamond",
      "status": "confirmed",
      "claimed": 96.1,
      "observed": 96.1,
      "sourceUrl": "https://artificialanalysis.ai/evaluations/gpqa-diamond",
      "note": "Leaderboard row 'GPT-6 Astra (max)' reads 96.1% on the GPQA Diamond evaluation page."
    }
  ]
}
```

Rules for the file:

- `status` is exactly one of `confirmed`, `contradicted`, `unverifiable`.
- `id` is `<slug>/<benchmarkId>` for a benchmark cell, `<slug>#<field>` for a
  changed specification (matching the `field` string in the diff), and
  `<slug>#new-model` for an added model.
- **Report every item in the diff.** An item you leave out fails the build, so
  emit `unverifiable` rather than dropping it.
- `observed` is what the source actually says. Use `null` when you could not read
  it.
- `note` is one or two sentences a reviewer can act on: name the table, row, or
  section you read. For a contradiction, say what the source says instead.

Do not edit any file other than `source-verdict.json`. Do not change the catalog
data to make a check pass — reporting the contradiction is the whole point.
