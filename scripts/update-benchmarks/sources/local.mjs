import fs from "node:fs";

const ROOT = "benchmarks";

function readScores(folder) {
  const file = `${ROOT}/${folder}/scores.json`;
  if (!fs.existsSync(file)) {
    throw new Error(
      `missing ${file} — run "npm run download:benchmarks" then "node scripts/update-benchmarks/sources/write-scores.mjs"`
    );
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

/**
 * Adapters over the local leaderboard snapshots written by write-scores.mjs.
 * They are tagged `catalog: "local"` so the default `npm run update:benchmarks`
 * run (which only selects `llm` adapters) still works without a snapshot
 * directory; select them explicitly with `--source <name>`.
 */
function adapter(name, benchmarkIds, folder, sourceUrl, evaluationDate) {
  const ids = Array.isArray(benchmarkIds) ? benchmarkIds : [benchmarkIds];
  return {
    name,
    catalog: "local",
    benchmarkIds: ids,
    async fetchScores() {
      const scores = [];
      for (const row of readScores(folder)) {
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

export const adapters = [
  adapter("aa-gpqa-diamond", "gpqa-diamond", "gpqa-diamond", "https://artificialanalysis.ai/evaluations/gpqa-diamond"),
  adapter("aa-hle", "hle", "humanitys-last-exam", "https://artificialanalysis.ai/evaluations/humanitys-last-exam"),
  adapter("aa-scicode", "scicode", "scicode", "https://artificialanalysis.ai/evaluations/scicode"),
  adapter("aa-terminal-bench-2-1", "terminal-bench-2-1", "terminal-bench-2-1", "https://artificialanalysis.ai/evaluations/terminalbench-v2-1"),
  adapter("tbench", "terminal-bench-4", "terminal-bench-4", "https://www.tbench.ai/leaderboard/terminal-bench/4.0"),
  adapter("bigcodebench", "bigcodebench", "bigcodebench", "https://bigcode-bench.github.io/", "2024-12-04"),
  adapter("livecodebench", "livecodebench", "livecodebench", "https://livecodebench.github.io/"),
  adapter("lmarena-elo", "lmarena-elo", "lmarena-elo", "https://arena.ai/leaderboard"),
  adapter("webdev-arena", "webdev-arena", "webdev-arena", "https://arena.ai/leaderboard/code/webdev"),
];
