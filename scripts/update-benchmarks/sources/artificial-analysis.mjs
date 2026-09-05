import fs from "node:fs";

// Artificial Analysis no longer embeds a full leaderboard in each /evaluations/<slug>
// page (those pages ship only the handful of models pre-selected for the chart).
// The complete per-model evaluation table is embedded in the model leaderboard page,
// so every AA-backed benchmark is read from that single snapshot.
export const AA_LEADERBOARD_FILE =
  "benchmarks/artificial-analysis-model-leaderboard/artificialanalysis.ai-leaderboards-models.html";

const AA_FIELDS = {
  "gpqa-diamond": {
    field: "gpqa",
    label: "GPQA Diamond",
    sourceUrl: "https://artificialanalysis.ai/evaluations/gpqa-diamond",
  },
  hle: {
    field: "hle",
    label: "Humanity's Last Exam",
    sourceUrl: "https://artificialanalysis.ai/evaluations/humanitys-last-exam",
  },
  scicode: {
    field: "scicode",
    label: "SciCode",
    sourceUrl: "https://artificialanalysis.ai/evaluations/scicode",
  },
  "terminal-bench-2-1": {
    field: "terminalbenchV21",
    label: "Terminal-Bench 2.1",
    sourceUrl: "https://artificialanalysis.ai/evaluations/terminalbench-v2-1",
  },
  "aa-intelligence-index": {
    field: "intelligenceIndex",
    label: "Intelligence Index v4.2",
    sourceUrl:
      "https://artificialanalysis.ai/evaluations/artificial-analysis-intelligence-index",
    // Already published on the index's own 0-100 scale, unlike the per-eval fractions.
    scale: 1,
    // AA extrapolates an index for models it has not run every component on and
    // flags those rows; only fully measured rows are published here.
    requires: (row) => row.intelligenceIndexIsEstimated === false,
  },
  "aa-omniscience-accuracy": {
    field: "omniscienceAccuracy",
    label: "AA-Omniscience Accuracy",
    sourceUrl: "https://artificialanalysis.ai/evaluations/omniscience",
  },
  "aa-lcr": {
    field: "lcr",
    label: "AA-LCR v1.1",
    sourceUrl:
      "https://artificialanalysis.ai/evaluations/artificial-analysis-long-context-reasoning",
  },
  critpt: {
    field: "critpt",
    label: "CritPt",
    sourceUrl: "https://artificialanalysis.ai/evaluations/critpt",
  },
  "tau3-banking": {
    field: "tauBanking",
    label: "\u03c4\u00b3-Banking",
    sourceUrl: "https://artificialanalysis.ai/evaluations/tau3-banking",
  },
  "mmmu-pro": {
    field: "mmmuPro",
    label: "MMMU-Pro",
    sourceUrl: "https://artificialanalysis.ai/evaluations/mmmu-pro",
  },
  ifbench: {
    field: "ifbench",
    label: "IFBench",
    sourceUrl: "https://artificialanalysis.ai/evaluations/ifbench",
  },
};

// Release names whose normalised form collides with a *different* catalog model.
// `exactCatalogMatch` strips punctuation, so these would silently land on the wrong
// record; they are dropped instead of guessed at.
//   Command A+     - a distinct 2026 Cohere model the catalog does not list, normalises onto `command-a`.
//   Command-R+ / Command-R - Artificial Analysis lists the Apr '24 / Mar '24 releases,
//                            while the catalog holds the 08-2024 refreshes.
const AMBIGUOUS_RELEASE_NAMES = new Set(["Command A+", "Command-R+", "Command-R"]);

export function flightSegments(file) {
  const c = fs.readFileSync(file, "utf8");
  const pushes = [...c.matchAll(/self\.__next_f\.push\(([\s\S]*?)\)<\/script>/g)].map((m) => m[1]);
  const segments = [];
  for (const raw of pushes) {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "string") segments.push(parsed);
      else if (Array.isArray(parsed)) for (const item of parsed) if (typeof item === "string") segments.push(item);
    } catch {}
  }
  return segments.map((s) => {
    const mm = s.match(/^\d+:(.*)$/s);
    return mm ? mm[1] : s;
  });
}

function arrayAfterKey(text, key, from = 0) {
  const i = text.indexOf(`"${key}"`, from);
  if (i < 0) return null;
  let depth = 0, inStr = false, esc = false, arrStart = -1, arrEnd = -1;
  for (let k = i + key.length + 2; k < text.length; k++) {
    const ch = text[k];
    if (inStr) { if (esc) esc = false; else if (ch === "\\") esc = true; else if (ch === '"') inStr = false; continue; }
    if (ch === '"') { inStr = true; continue; }
    if (ch === "[") { depth++; if (arrStart < 0) arrStart = k; }
    else if (ch === "]") { depth--; if (depth === 0) { arrEnd = k; break; } }
  }
  if (arrStart < 0 || arrEnd < 0) return { parsed: null, next: i + key.length };
  try {
    return { parsed: JSON.parse(text.slice(arrStart, arrEnd + 1)), next: arrEnd + 1 };
  } catch {
    return { parsed: null, next: arrEnd + 1 };
  }
}

/**
 * Find the first JSON array stored under `key` in any flight segment.
 * Segments are searched longest-first; `predicate` (when given) rejects arrays
 * that parse but are not the table we are after.
 */
export function extractJsonArrayNear(file, key, predicate) {
  const segments = flightSegments(file).slice().sort((a, b) => b.length - a.length);
  for (const segment of segments) {
    let from = 0;
    while (from < segment.length) {
      const hit = arrayAfterKey(segment, key, from);
      if (!hit) break;
      from = hit.next;
      if (!Array.isArray(hit.parsed)) continue;
      if (predicate && !predicate(hit.parsed)) continue;
      return hit.parsed;
    }
  }
  return null;
}

function baseName(name) {
  return name.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

export function parseAALeaderboard(file = AA_LEADERBOARD_FILE) {
  const rows = extractJsonArrayNear(
    file,
    "models",
    (parsed) => parsed.length > 0 && parsed.every((row) => row && typeof row.slug === "string") &&
      parsed.some((row) => "intelligenceIndex" in row)
  );
  if (!rows) {
    throw new Error(`Artificial Analysis leaderboard payload not found in ${file}`);
  }
  return rows;
}

/**
 * Artificial Analysis lists one row per reasoning/effort variant. Rows are grouped
 * by the release name (the row name without its trailing qualifier) and one row is
 * chosen to represent the release:
 *
 *  - reasoning rows win over non-reasoning ones, so a reasoning model is never
 *    represented by its non-thinking listing (AA sometimes gives the non-reasoning
 *    variant the unsuffixed slug). A release with only non-reasoning rows keeps them.
 *  - among the remaining rows the shortest slug wins, i.e. the release's own slug
 *    without an effort suffix, which is AA's default listing for that release.
 *  - groups without a single shortest slug are skipped rather than guessed at.
 */
export function canonicalAARows(rows) {
  const groups = new Map();
  for (const row of rows) {
    if (typeof row.name !== "string" || !row.name.trim()) continue;
    const key = baseName(row.name);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  const canonical = [];
  for (const [key, group] of groups) {
    const reasoning = group.filter((row) => row.isReasoning);
    const candidates = reasoning.length > 0 ? reasoning : group;
    const sorted = candidates.slice().sort((a, b) => a.slug.length - b.slug.length);
    if (sorted.length > 1 && sorted[0].slug.length === sorted[1].slug.length) continue;
    canonical.push({ baseName: key, row: sorted[0] });
  }
  return canonical;
}

export function extractAA(benchmarkId, { file = AA_LEADERBOARD_FILE, evaluationDate } = {}) {
  const cfg = AA_FIELDS[benchmarkId];
  if (!cfg) throw new Error(`No Artificial Analysis field mapped for ${benchmarkId}`);
  const scale = cfg.scale ?? 100;
  const scores = [];
  for (const { baseName: name, row } of canonicalAARows(parseAALeaderboard(file))) {
    if (AMBIGUOUS_RELEASE_NAMES.has(name)) continue;
    const raw = row[cfg.field];
    // AA stores "not evaluated" as null and, for some rows, as an exact 0; a
    // frontier model scoring exactly 0 is not a value worth publishing either way.
    if (typeof raw !== "number" || !Number.isFinite(raw) || raw <= 0) continue;
    if (cfg.requires && !cfg.requires(row)) continue;
    scores.push({
      benchmarkId,
      sourceModelName: name,
      value: Math.round(raw * scale * 10) / 10,
      sourceUrl: cfg.sourceUrl,
      evaluationDate,
      protocol: `Artificial Analysis ${cfg.label} leaderboard snapshot, listing '${row.name}', ${cfg.field} score.`,
    });
  }
  return scores;
}

export function extractAllAA(options) {
  const out = {};
  for (const id of Object.keys(AA_FIELDS)) out[id] = extractAA(id, options);
  return out;
}
