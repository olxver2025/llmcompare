import fs from "node:fs";
import { load } from "../load.mjs";
import { buildCatalogIndex, normalizeName } from "../match.mjs";
import { extractAA, extractJsonArrayNear } from "./artificial-analysis.mjs";
import { extractLMArenaElo, extractWebDevArena } from "./arena-ai.mjs";
import { extractAll as extractStructured } from "./extract-scores.mjs";

const OUT = "benchmarks";

function writeScores(folder, scores) {
  const dir = `${OUT}/${folder}`;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(`${dir}/scores.json`, `${JSON.stringify(scores, null, 2)}\n`);
}

// Write scores.json for all extractable sources
const structured = extractStructured();
writeScores("mmlu-pro", structured["mmlu-pro"]);
writeScores("gpqa-diamond", structured["gpqa-diamond"]);
writeScores("humanitys-last-exam", structured["humanitys-last-exam"]);
writeScores("aime-2025", structured["aime-2025"]);
writeScores("math-500", structured["math-500"]);
writeScores("scicode", structured["scicode"]);
writeScores("livecodebench", structured["livecodebench"]);
writeScores("terminal-bench-2-1", structured["terminal-bench-2-1"]);
writeScores("terminal-bench-2-1", [
  ...structured["terminal-bench-2-1"],
  ...structured["tbench-terminal-bench-2-1"],
]);
writeScores("terminal-bench-3-frontier-bench", structured["terminal-bench-3-frontier-bench"]);
writeScores("swe-bench-verified", structured["swebench"]);
writeScores("bigcodebench", structured["bigcodebench"]);
writeScores("evalplus", structured["evalplus"]);
writeScores("lmarena-elo", extractLMArenaElo());
writeScores("webdev-arena", extractWebDevArena());

// Log counts
for (const [folder, scores] of [
  ["mmlu-pro", structured["mmlu-pro"]],
  ["gpqa-diamond", structured["gpqa-diamond"]],
  ["humanitys-last-exam", structured["humanitys-last-exam"]],
  ["aime-2025", structured["aime-2025"]],
  ["math-500", structured["math-500"]],
  ["scicode", structured["scicode"]],
  ["livecodebench", structured["livecodebench"]],
  ["terminal-bench-2-1", structured["terminal-bench-2-1"].concat(structured["tbench-terminal-bench-2-1"])],
  ["terminal-bench-3-frontier-bench", structured["terminal-bench-3-frontier-bench"]],
  ["swe-bench-verified", structured["swebench"]],
  ["bigcodebench", structured["bigcodebench"]],
  ["evalplus", structured["evalplus"]],
  ["lmarena-elo", extractLMArenaElo()],
  ["webdev-arena", extractWebDevArena()],
]) {
  console.log(`${folder}: ${scores.length} scores -> scores.json`);
}
