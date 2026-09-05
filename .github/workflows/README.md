# Data integrity CI

`data-integrity.yml` checks the catalog on every pull request. It runs in three
layers, from cheapest to most thorough.

## 1. `verify` — deterministic, always runs, blocking

Runs on every pull request including forks. This is the check to require in
branch protection.

| Step | What it proves |
| --- | --- |
| `npm run verify:data` | The pinned counts, per-cell evidence rules, and range checks in `scripts/verify-data.mjs` still hold. |
| `npm run generate:evidence -- --check` | `scripts/benchmark-evidence.json` was regenerated from the retained-value and source manifests, not hand-edited. |
| `node scripts/ci/audit-data-diff.mjs` | Every fact *this pull request* changes arrived with its own canonical evidence. |
| Lint (changed files) + `npm run build` | The change compiles and the site still renders. |

`audit-data-diff.mjs` works from the parsed catalog rather than the text patch,
so reformatting `models.ts` reports zero changed facts while one edited digit
reports exactly one. It fails the build when:

- a new or moved benchmark cell has no entry in the evidence ledger;
- a cell's value moved but its source URL, evaluation date, and protocol note are
  byte-identical to before — the new number is then not backed by the cited
  measurement;
- the catalog and the ledger disagree about a value;
- a source URL is a search result, a URL shortener, a tracking link, or not
  https;
- a new model arrives with no official link, or a date lies in the future;
- a benchmark's `unit` or `higherIsBetter` changes, which silently rescales every
  model already scored on it.

The diff it computes is uploaded as the `data-diff` artifact and reused by the
later jobs.

## 2. `sources` — network, blocking only on broken citations

Fetches every URL the changed data cites. A citation that is definitively wrong
(404, 410, a host that does not resolve) fails the build. A bot wall, a rate
limit, or a timeout is reported in the job summary but does **not** fail it:
Artificial Analysis and provider blogs block CI runners routinely, and an
unreachable page says nothing about whether the number is right.

## 3. `claude-source-review` — reads the sources, blocking on contradictions

Runs `.claude/skills/verify-data-sources/SKILL.md`, which opens each cited page
and checks it actually reports that value, for that model variant, on that
benchmark version, under the protocol the note claims. It writes
`source-verdict.json`; `scripts/ci/verdict-gate.mjs` turns that into the build
result and posts a sticky pull request comment.

- `contradicted` → fails the build.
- `unverifiable` → reported, does not fail.
- A changed fact the review does not report on → fails, so an incomplete review
  cannot pass silently.

### Setup

This job needs a Claude credential. On a Pro, Max, Team, or Enterprise plan it
runs on your subscription rather than API billing:

```bash
claude setup-token
```

Add the result as the repository secret `CLAUDE_CODE_OAUTH_TOKEN` (Settings →
Secrets and variables → Actions). An `ANTHROPIC_API_KEY` secret works too and
takes the same code path. With neither set, the job reports that it was skipped
and passes — layers 1 and 2 still gate the merge.

Two limits worth knowing:

- The OAuth token belongs to whoever ran `claude setup-token`, and it expires
  eventually. Re-run the command and update the secret when the job starts
  failing to authenticate.
- `llmcompare` is public, and GitHub withholds secrets from fork pull requests,
  so this job cannot run on outside contributions. Review those by hand — the
  deterministic layers still run.

## Running it locally

```bash
npm run audit:diff -- --base=origin/master   # offline provenance audit
npm run audit:sources                        # reachability, reads data-diff.json
```
