import fs from "node:fs";

const ROOT = "benchmarks";

function readScores(folder) {
  const file = `${ROOT}/${folder}/scores.json`;
  if (!fs.existsSync(file)) throw new Error(`missing ${file}`);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function adapter(name, benchmarkIds, folder, sourceUrl, evaluationDate, filter) {
  const ids = Array.isArray(benchmarkIds) ? benchmarkIds : [benchmarkIds];
  return {
    name,
    catalog: "llm",
    benchmarkIds: ids,
    async fetchScores() {
      const rows = readScores(folder);
      const scores = [];
      for (const row of rows) {
        if (filter && !filter(row)) continue;
        if (!ids.includes(row.benchmarkId)) continue;
        scores.push({
          benchmarkId: row.benchmarkId,
          sourceModelName: row.sourceModelName,
          value: row.value,
          sourceUrl: row.sourceUrl || sourceUrl,
          evaluationDate: row.evaluationDate || evaluationDate,
          protocol: row.protocol,
        });
      }
      if (scores.length === 0) throw new Error(`${name} returned no scores`);
      return scores;
    },
  };
}

// tbench rows are written with protocol referencing the tbench leaderboard
const isTbench = (row) => String(row.sourceUrl || "").includes("tbench.ai");
const isAA = (row) => String(row.sourceUrl || "").includes("artificialanalysis.ai");
const isFrontierBench = (row) => String(row.sourceUrl || "").includes("frontierbench.ai");
const isSwebenchVerified = (row) => String(row.protocol || "").includes("SWE-bench Verified");
const isSwebenchMultilingual = (row) => String(row.protocol || "").includes("SWE-bench Multilingual");

export const adapters = [
  adapter("aa-mmlu-pro", "mmlu-pro", "mmlu-pro", "https://artificialanalysis.ai/evaluations/mmlu-pro", "2026-08-12", isAA),
  adapter("aa-gpqa-diamond", "gpqa-diamond", "gpqa-diamond", "https://artificialanalysis.ai/evaluations/gpqa-diamond", "2026-08-12", isAA),
  adapter("aa-hle", "hle", "humanitys-last-exam", "https://artificialanalysis.ai/evaluations/humanitys-last-exam", "2026-08-12", isAA),
  adapter("aa-aime-2025", "aime-2025", "aime-2025", "https://artificialanalysis.ai/evaluations/aime-2025", "2026-08-12", isAA),
  adapter("aa-math-500", "math-500", "math-500", "https://artificialanalysis.ai/evaluations/math-500", "2026-08-12", isAA),
  adapter("aa-scicode", "scicode", "scicode", "https://artificialanalysis.ai/evaluations/scicode", "2026-08-12", isAA),
  adapter("aa-livecodebench", "livecodebench", "livecodebench", "https://artificialanalysis.ai/evaluations/livecodebench", "2026-08-12", isAA),
  adapter("aa-terminal-bench-2-1", "terminal-bench-2-1", "terminal-bench-2-1", "https://artificialanalysis.ai/evaluations/terminalbench-v2-1", "2026-08-12", isAA),
  adapter("tbench", "terminal-bench-2-1", "terminal-bench-2-1", "https://www.tbench.ai/leaderboard/terminal-bench/2.1", "2026-08-12", isTbench),
  adapter("frontierbench", "terminal-bench-3", "terminal-bench-3-frontier-bench", "https://www.frontierbench.ai/", "2026-08-12", isFrontierBench),
  adapter("swebench-verified", "swe-bench-verified", "swe-bench-verified", "https://www.swebench.com/verified.html", "2026-08-12", isSwebenchVerified),
  adapter("swebench-multilingual", "swe-bench-multilingual", "swe-bench-verified", "https://www.swebench.com/multilingual.html", "2026-08-12", isSwebenchMultilingual),
  adapter("bigcodebench", "bigcodebench", "bigcodebench", "https://bigcode-bench.github.io/", "2024-12-04"),
  adapter("evalplus", ["humaneval", "mbpp", "evalplus"], "evalplus", "https://evalplus.github.io/", "2024-12-04"),
  adapter("aa-lmarena-elo", "lmarena-elo", "lmarena-elo", "https://arena.ai/leaderboard", "2026-08-12"),
  adapter("aa-webdev-arena", "webdev-arena", "webdev-arena", "https://arena.ai/leaderboard/code/webdev", "2026-08-12"),
];

export function getAdapters(names = []) {
  if (names.length === 0) return adapters.filter((adapter) => adapter.catalog === "llm");
  const unknown = names.filter((name) => !adapters.some((adapter) => adapter.name === name));
  if (unknown.length > 0) {
    throw new Error(
      `Unknown source(s): ${unknown.join(", ")}. Available: ${adapters.map((adapter) => adapter.name).join(", ")}`
    );
  }
  return adapters.filter((adapter) => names.includes(adapter.name));
}
