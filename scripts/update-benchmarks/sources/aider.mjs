import { fetchText } from "../load.mjs";

export const AIDER_YAML_URL =
  "https://raw.githubusercontent.com/Aider-AI/aider/main/aider/website/_data/polyglot_leaderboard.yml";
export const AIDER_SOURCE_URL = "https://aider.chat/docs/leaderboards/";

function unquotedHashIndex(value) {
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '"' && !inSingle) inDouble = !inDouble;
    else if (ch === "#" && !inSingle && !inDouble) return i;
  }
  return -1;
}

function parseYamlScalar(raw) {
  let value = raw.trim();
  const hash = unquotedHashIndex(value);
  if (hash >= 0) value = value.slice(0, hash).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null" || value === "") return null;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
}

export function parseAiderYaml(text) {
  const records = [];
  let current = null;
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || /^\s*#/.test(line)) continue;
    const item = line.match(/^- (\w+):\s*(.*)$/);
    if (item) {
      if (current) records.push(current);
      current = { [item[1]]: parseYamlScalar(item[2]) };
      continue;
    }
    const field = line.match(/^  (\w+):\s*(.*)$/);
    if (field && current) {
      current[field[1]] = parseYamlScalar(field[2]);
      continue;
    }
    throw new Error(
      `Aider YAML format changed at line ${i + 1}: ${line.slice(0, 200)}`
    );
  }
  if (current) records.push(current);
  if (records.length === 0) {
    throw new Error(`Aider YAML parsed zero records. Excerpt: ${text.slice(0, 400)}`);
  }
  return records;
}

export default {
  name: "aider",
  catalog: "llm",
  benchmarkIds: ["aider-polyglot"],
  async fetchScores() {
    const text = await fetchText(process.env.AIDER_YAML_URL || AIDER_YAML_URL);
    const records = parseAiderYaml(text);
    const scores = [];
    for (const record of records) {
      if (typeof record.model !== "string" || !record.model.trim()) {
        throw new Error(
          `Aider YAML row missing model name: ${JSON.stringify(record).slice(0, 300)}`
        );
      }
      if (!Number.isFinite(record.pass_rate_2)) {
        throw new Error(
          `Aider YAML row missing pass_rate_2 for ${record.model}: ${JSON.stringify(record).slice(0, 300)}`
        );
      }
      if (typeof record.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
        throw new Error(
          `Aider YAML row missing ISO date for ${record.model}: ${JSON.stringify(record).slice(0, 300)}`
        );
      }
      const editFormat = record.edit_format ?? "unknown";
      scores.push({
        benchmarkId: "aider-polyglot",
        sourceModelName: record.model,
        value: record.pass_rate_2,
        sourceUrl: AIDER_SOURCE_URL,
        evaluationDate: record.date,
        protocol: `Aider polyglot official leaderboard, ${record.model}, ${editFormat} edit format, pass rate 2.`,
      });
    }
    return scores;
  },
};
