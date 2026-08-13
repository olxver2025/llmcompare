import fs from "node:fs";

const AA_PAGES = {
  "mmlu-pro": {
    file: "benchmarks/mmlu-pro/artificialanalysis.ai-evaluations-mmlu-pro.html",
    field: "mmlu_pro",
    benchmarkId: "mmlu-pro",
    sourceUrl: "https://artificialanalysis.ai/evaluations/mmlu-pro",
  },
  "gpqa-diamond": {
    file: "benchmarks/gpqa-diamond/artificialanalysis.ai-evaluations-gpqa-diamond.html",
    field: "gpqa",
    benchmarkId: "gpqa-diamond",
    sourceUrl: "https://artificialanalysis.ai/evaluations/gpqa-diamond",
  },
  "humanitys-last-exam": {
    file: "benchmarks/humanitys-last-exam/artificialanalysis.ai-evaluations-humanitys-last-exam.html",
    field: "hle",
    benchmarkId: "hle",
    sourceUrl: "https://artificialanalysis.ai/evaluations/humanitys-last-exam",
  },
  "aime-2025": {
    file: "benchmarks/aime-2025/artificialanalysis.ai-evaluations-aime-2025.html",
    field: "aime25",
    benchmarkId: "aime-2025",
    sourceUrl: "https://artificialanalysis.ai/evaluations/aime-2025",
  },
  "math-500": {
    file: "benchmarks/math-500/artificialanalysis.ai-evaluations-math-500.html",
    field: "math_500",
    benchmarkId: "math-500",
    sourceUrl: "https://artificialanalysis.ai/evaluations/math-500",
  },
  scicode: {
    file: "benchmarks/scicode/artificialanalysis.ai-evaluations-scicode.html",
    field: "scicode",
    benchmarkId: "scicode",
    sourceUrl: "https://artificialanalysis.ai/evaluations/scicode",
  },
  livecodebench: {
    file: "benchmarks/livecodebench/artificialanalysis.ai-evaluations-livecodebench.html",
    field: "livecodebench",
    benchmarkId: "livecodebench",
    sourceUrl: "https://artificialanalysis.ai/evaluations/livecodebench",
  },
  "terminal-bench-2-1": {
    file: "benchmarks/terminal-bench-2-1/artificialanalysis.ai-evaluations-terminalbench-v2-1.html",
    field: "terminalbench_v2_1",
    benchmarkId: "terminal-bench-2-1",
    sourceUrl: "https://artificialanalysis.ai/evaluations/terminalbench-v2-1",
  },
};

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

export function extractJsonArrayNear(file, key) {
  const segs = flightSegments(file);
  const long = segs.slice().sort((a, b) => b.length - a.length)[0] ?? "";
  const i = long.indexOf(`"${key}"`);
  if (i < 0) return null;
  let depth = 0, inStr = false, esc = false, arrStart = -1, arrEnd = -1;
  for (let k = i + key.length + 2; k < long.length; k++) {
    const ch = long[k];
    if (inStr) { if (esc) esc = false; else if (ch === "\\") esc = true; else if (ch === '"') inStr = false; continue; }
    if (ch === '"') { inStr = true; continue; }
    if (ch === "[") { depth++; if (arrStart < 0) arrStart = k; }
    else if (ch === "]") { depth--; if (depth === 0) { arrEnd = k; break; } }
  }
  if (arrStart < 0 || arrEnd < 0) return null;
  try {
    return JSON.parse(long.slice(arrStart, arrEnd + 1));
  } catch {
    return null;
  }
}

export function extractAA(pageKey) {
  const cfg = AA_PAGES[pageKey];
  const data = extractJsonArrayNear(cfg.file, "defaultData");
  if (!data) throw new Error(`AA page ${pageKey}: defaultData not found`);
  const scores = [];
  for (const row of data) {
    if (typeof row.name !== "string" || !row.name.trim()) continue;
    const raw = row[cfg.field];
    if (typeof raw !== "number" || !Number.isFinite(raw)) continue;
    scores.push({
      benchmarkId: cfg.benchmarkId,
      sourceModelName: row.name,
      value: Math.round(raw * 1000) / 10,
      sourceUrl: cfg.sourceUrl,
      evaluationDate: "2026-08-12",
      protocol: `Artificial Analysis ${cfg.benchmarkId} evaluation snapshot, ${row.name}, ${cfg.field} score.`,
    });
  }
  return scores;
}

export function extractAllAA() {
  const out = {};
  for (const key of Object.keys(AA_PAGES)) out[key] = extractAA(key);
  return out;
}
