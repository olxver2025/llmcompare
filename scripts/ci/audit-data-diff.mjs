/**
 * Offline provenance gate for changed catalog data.
 *
 * Enforces the parts of AGENTS.md that can be decided without a network call:
 * every new or moved benchmark cell must arrive with its own evidence, and that
 * evidence must cite a canonical URL rather than a search result or a redirect.
 */
import fs from "node:fs";
import { computeDataDiff, isEmptyDiff, resolveBaseRef } from "./data-diff.mjs";
import { appendSummary, formatValue, renderTable } from "./report.mjs";

const BANNED_HOSTS = [
  "google.com/search",
  "bing.com/search",
  "duckduckgo.com/?q",
  "webcache.googleusercontent.com",
  "bit.ly",
  "tinyurl.com",
  "t.co/",
  "lnkd.in",
  "goo.gl",
  "ow.ly",
  "buff.ly",
  "rb.gy",
  "shorturl.at",
];

const TRACKING_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "mc_cid"];

const failures = [];
const warnings = [];

const fail = (message) => failures.push(message);
const warn = (message) => warnings.push(message);

function auditUrl(label, rawUrl) {
  if (typeof rawUrl !== "string" || rawUrl.trim() === "") {
    fail(`${label}: no source URL`);
    return;
  }
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    fail(`${label}: source URL is not a valid URL (${rawUrl})`);
    return;
  }
  if (url.protocol !== "https:") {
    fail(`${label}: source URL must use https (${rawUrl})`);
  }
  const lowered = rawUrl.toLowerCase();
  for (const banned of BANNED_HOSTS) {
    if (lowered.includes(banned)) {
      fail(`${label}: ${banned} is a search result or URL shortener, not a canonical source (${rawUrl})`);
      return;
    }
  }
  for (const param of TRACKING_PARAMS) {
    if (url.searchParams.has(param)) {
      fail(`${label}: source URL carries the tracking parameter ${param}; cite the clean canonical URL (${rawUrl})`);
      return;
    }
  }
}

const diff = computeDataDiff(resolveBaseRef());
fs.writeFileSync("data-diff.json", `${JSON.stringify(diff, null, 2)}\n`);

const today = new Date().toISOString().slice(0, 10);

for (const cell of diff.benchmarkCells) {
  const label = `${cell.slug}/${cell.benchmarkId}`;

  if (cell.change === "removed") {
    warn(`${label}: score removed (was ${formatValue(cell.before)}). Removing data is allowed, but confirm it was withdrawn at the source rather than dropped by accident.`);
    continue;
  }

  const evidence = cell.evidence;
  if (!evidence) {
    fail(`${label}: ${cell.change} value ${formatValue(cell.after)} with no entry in scripts/benchmark-evidence.json. Every retained cell needs a source URL, an evaluation date, and a protocol note.`);
    continue;
  }
  if (evidence.value !== cell.after) {
    fail(`${label}: catalog says ${formatValue(cell.after)} but the evidence ledger says ${formatValue(evidence.value)}.`);
  }
  auditUrl(label, evidence.sourceUrl);

  if (typeof evidence.protocol !== "string" || evidence.protocol.trim().length < 20) {
    fail(`${label}: protocol note is missing or too short to identify the benchmark version, harness, and reasoning mode the score was measured under.`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(evidence.evaluationDate ?? "")) {
    fail(`${label}: evaluation date "${evidence.evaluationDate ?? ""}" is not an ISO date.`);
  } else if (evidence.evaluationDate > today) {
    fail(`${label}: evaluation date ${evidence.evaluationDate} is in the future.`);
  }

  // A value that moves while its evidence stays byte-identical means the new
  // number is not backed by the cited measurement.
  if (cell.change === "changed" && cell.priorEvidence) {
    const unchangedEvidence =
      cell.priorEvidence.sourceUrl === evidence.sourceUrl &&
      cell.priorEvidence.protocol === evidence.protocol &&
      cell.priorEvidence.evaluationDate === evidence.evaluationDate;
    if (unchangedEvidence) {
      fail(
        `${label}: value moved ${formatValue(cell.before)} -> ${formatValue(cell.after)} but the source URL, evaluation date, and protocol note are unchanged. Cite the measurement that reports the new number.`
      );
    }
  }
}

for (const model of diff.addedModels) {
  const label = `${model.kind}:${model.slug}`;
  const links = model.links ?? {};
  if (!links.docs && !links.modelCard && !links.announcement) {
    fail(`${label}: a new model needs at least one official link (docs, model card, or announcement) so its specifications can be traced.`);
  }
  for (const [name, value] of Object.entries(links)) {
    if (value) auditUrl(`${label} links.${name}`, value);
  }
  if (model.releaseDate && model.releaseDate > today) {
    fail(`${label}: release date ${model.releaseDate} is in the future.`);
  }
}

for (const change of diff.benchmarkMetaChanges) {
  if (change.field === "sourceUrl") auditUrl(`benchmark ${change.id} sourceUrl`, change.after);
  if (change.change === "added") auditUrl(`benchmark ${change.id} sourceUrl`, change.after?.sourceUrl);
  if (change.change === "removed") {
    warn(`benchmark ${change.id}: removed from the catalog. Confirm no model still cites it.`);
  }
  if (change.field === "unit" || change.field === "higherIsBetter") {
    fail(
      `benchmark ${change.id}: ${change.field} changed from ${formatValue(change.before)} to ${formatValue(change.after)}. Changing a benchmark's metric silently rescales every model already scored on it.`
    );
  }
}

for (const model of diff.removedModels) {
  warn(`${model.slug}: model removed from the catalog.`);
}

const lines = ["## Data provenance audit (offline)", "", `Base: \`${diff.baseRef}\``, ""];

if (isEmptyDiff(diff)) {
  lines.push("No catalog facts changed in this pull request.");
} else {
  lines.push(
    `**${diff.totals.benchmarkCells}** benchmark cells, **${diff.totals.changedFields}** sourced fields, **${diff.totals.addedModels}** added models, **${diff.totals.removedModels}** removed models, **${diff.totals.benchmarkMetaChanges}** benchmark definition changes.`,
    ""
  );

  if (diff.benchmarkCells.length > 0) {
    lines.push(
      "### Benchmark cells",
      "",
      renderTable(
        ["Model", "Benchmark", "Before", "After", "Source"],
        diff.benchmarkCells.map((cell) => [
          `\`${cell.slug}\``,
          cell.benchmarkName,
          formatValue(cell.before),
          formatValue(cell.after),
          cell.evidence?.sourceUrl ? `[link](${cell.evidence.sourceUrl})` : "—",
        ])
      ),
      ""
    );
  }

  if (diff.changedFields.length > 0) {
    lines.push(
      "### Changed specifications",
      "",
      renderTable(
        ["Model", "Field", "Before", "After"],
        diff.changedFields.map((change) => [
          `\`${change.slug}\``,
          change.field,
          formatValue(change.before),
          formatValue(change.after),
        ])
      ),
      ""
    );
  }

  if (diff.addedModels.length > 0) {
    lines.push(
      "### Added models",
      "",
      ...diff.addedModels.map((model) => `- \`${model.slug}\` — ${model.name} (${model.organization}), released ${model.releaseDate}`),
      ""
    );
  }
}

if (failures.length > 0) {
  lines.push("### ❌ Provenance failures", "", ...failures.map((failure) => `- ${failure}`), "");
}
if (warnings.length > 0) {
  lines.push("### ⚠️ Needs a human look", "", ...warnings.map((warning) => `- ${warning}`), "");
}
if (failures.length === 0 && warnings.length === 0) {
  lines.push("✅ Every changed cell arrived with its own canonical evidence.");
}

appendSummary(lines.join("\n"));

if (failures.length > 0) {
  console.error(failures.map((failure) => `FAIL ${failure}`).join("\n"));
}
for (const warning of warnings) console.warn(`WARN ${warning}`);
if (failures.length > 0) process.exitCode = 1;
else console.log(`OK offline provenance audit: ${diff.totals.benchmarkCells} benchmark cells, ${diff.totals.changedFields} sourced fields`);
