import fs from "node:fs";
import { extractLMArenaElo, extractWebDevArena } from "./arena-ai.mjs";
import { extractAll as extractStructured } from "./extract-scores.mjs";

const OUT = "benchmarks";
const SNAPSHOT_DATE = process.argv[2] ?? new Date().toISOString().slice(0, 10);

function writeScores(folder, scores) {
  const dir = `${OUT}/${folder}`;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(`${dir}/scores.json`, `${JSON.stringify(scores, null, 2)}\n`);
  console.log(`${folder}: ${scores.length} scores -> scores.json`);
}

const structured = extractStructured({ evaluationDate: SNAPSHOT_DATE });

writeScores("gpqa-diamond", structured["gpqa-diamond"]);
writeScores("humanitys-last-exam", structured["hle"]);
writeScores("scicode", structured["scicode"]);
writeScores("terminal-bench-2-1", structured["terminal-bench-2-1"]);
writeScores("aa-intelligence-index", structured["aa-intelligence-index"]);
writeScores("aa-omniscience-accuracy", structured["aa-omniscience-accuracy"]);
writeScores("aa-lcr", structured["aa-lcr"]);
writeScores("critpt", structured["critpt"]);
writeScores("tau3-banking", structured["tau3-banking"]);
writeScores("mmmu-pro", structured["mmmu-pro"]);
writeScores("ifbench", structured["ifbench"]);
writeScores("terminal-bench-4", structured["terminal-bench-4"]);
writeScores("swe-bench-verified", structured["swebench"]);
writeScores("bigcodebench", structured["bigcodebench"]);
writeScores("evalplus", structured["evalplus"]);
writeScores("livecodebench", structured["livecodebench-json"]);
writeScores("lmarena-elo", extractLMArenaElo(SNAPSHOT_DATE));
writeScores("webdev-arena", extractWebDevArena(SNAPSHOT_DATE));
