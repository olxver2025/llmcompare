/**
 * Turns Claude's source review into a pass/fail check.
 *
 * The reviewing agent writes source-verdict.json; this script is the part that
 * decides the build result, so the outcome depends on a machine-readable file
 * rather than on prose in a log. A contradicted score blocks the pull request.
 * A source that could not be read does not, per the split policy: an
 * unreachable page is not evidence that the number is wrong.
 */
import fs from "node:fs";
import { appendSummary, formatValue, renderTable } from "./report.mjs";

const verdictPath = "source-verdict.json";
const diffPath = "data-diff.json";

const diff = fs.existsSync(diffPath) ? JSON.parse(fs.readFileSync(diffPath, "utf8")) : null;
const expected = new Set(
  (diff?.benchmarkCells ?? [])
    .filter((cell) => cell.change !== "removed")
    .map((cell) => `${cell.slug}/${cell.benchmarkId}`)
);
for (const change of diff?.changedFields ?? []) expected.add(`${change.slug}#${change.field}`);
for (const model of diff?.addedModels ?? []) expected.add(`${model.slug}#new-model`);

if (!fs.existsSync(verdictPath)) {
  const message = [
    "## Claude source review",
    "",
    `❌ The review finished without writing \`${verdictPath}\`, so no data was verified against its sources. Re-run the job; if it keeps happening the review prompt or its tool permissions need fixing.`,
  ].join("\n");
  appendSummary(message);
  fs.writeFileSync("source-verdict.md", message);
  console.error(`FAIL ${verdictPath} was not produced`);
  process.exit(1);
}

let verdict;
try {
  verdict = JSON.parse(fs.readFileSync(verdictPath, "utf8"));
} catch (error) {
  const message = `## Claude source review\n\n❌ \`${verdictPath}\` is not valid JSON: ${error.message}`;
  appendSummary(message);
  fs.writeFileSync("source-verdict.md", message);
  console.error(`FAIL ${error.message}`);
  process.exit(1);
}

const items = Array.isArray(verdict.items) ? verdict.items : [];
const byStatus = (status) => items.filter((item) => item.status === status);
const contradicted = byStatus("contradicted");
const unverifiable = byStatus("unverifiable");
const confirmed = byStatus("confirmed");
const unknownStatus = items.filter(
  (item) => !["confirmed", "contradicted", "unverifiable"].includes(item.status)
);

const reported = new Set(items.map((item) => item.id));
const missing = [...expected].filter((id) => !reported.has(id));

const lines = [
  "## Claude source review",
  "",
  `Checked ${items.length} changed facts against their cited sources: **${confirmed.length} confirmed**, **${contradicted.length} contradicted**, **${unverifiable.length} unverifiable**.`,
  "",
];

if (contradicted.length > 0) {
  lines.push(
    "### ❌ The source does not support this value (blocking)",
    "",
    renderTable(
      ["Fact", "In this PR", "What the source says", "Source"],
      contradicted.map((item) => [
        `\`${item.id}\``,
        formatValue(item.claimed),
        `${formatValue(item.observed)} — ${item.note ?? ""}`,
        item.sourceUrl ? `[link](${item.sourceUrl})` : "—",
      ])
    ),
    ""
  );
}

if (unknownStatus.length > 0) {
  lines.push(
    "### ❌ Malformed verdicts (blocking)",
    "",
    ...unknownStatus.map((item) => `- \`${item.id ?? "?"}\`: unrecognised status \`${item.status ?? ""}\``),
    ""
  );
}

if (missing.length > 0) {
  lines.push(
    "### ❌ Not reviewed (blocking)",
    "",
    "These facts changed in this pull request but the review did not report on them:",
    "",
    ...missing.map((id) => `- \`${id}\``),
    ""
  );
}

if (unverifiable.length > 0) {
  lines.push(
    "### ⚠️ Could not be verified (not blocking)",
    "",
    renderTable(
      ["Fact", "Value", "Why", "Source"],
      unverifiable.map((item) => [
        `\`${item.id}\``,
        formatValue(item.claimed),
        item.note ?? "",
        item.sourceUrl ? `[link](${item.sourceUrl})` : "—",
      ])
    ),
    ""
  );
}

if (confirmed.length > 0) {
  lines.push(
    "<details><summary>✅ Confirmed against the cited source</summary>",
    "",
    renderTable(
      ["Fact", "Value", "Source"],
      confirmed.map((item) => [
        `\`${item.id}\``,
        formatValue(item.claimed),
        item.sourceUrl ? `[link](${item.sourceUrl})` : "—",
      ])
    ),
    "",
    "</details>",
    ""
  );
}

const blocking = contradicted.length + unknownStatus.length + missing.length;
if (blocking === 0 && unverifiable.length === 0 && items.length > 0) {
  lines.push("✅ Every changed fact matches the source it cites.");
}

const report = lines.join("\n");
appendSummary(report);
fs.writeFileSync("source-verdict.md", report);

for (const item of contradicted) {
  console.error(`FAIL ${item.id}: PR says ${formatValue(item.claimed)}, ${item.sourceUrl} says ${formatValue(item.observed)} — ${item.note ?? ""}`);
}
for (const id of missing) console.error(`FAIL ${id}: changed but not reviewed`);
for (const item of unverifiable) console.warn(`WARN ${item.id}: ${item.note ?? "source unreadable"}`);

if (blocking > 0) process.exitCode = 1;
else console.log(`OK ${confirmed.length} facts confirmed, ${unverifiable.length} unverifiable`);
