/** Shared helpers for writing CI job summaries and pull request comments. */
import fs from "node:fs";

export function formatValue(value) {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return `\`${JSON.stringify(value)}\``;
  return String(value);
}

export function renderTable(headers, rows) {
  if (rows.length === 0) return "_none_";
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

export function appendSummary(markdown) {
  const target = process.env.GITHUB_STEP_SUMMARY;
  if (!target) {
    console.log(markdown);
    return;
  }
  fs.appendFileSync(target, `${markdown}\n\n`);
}
