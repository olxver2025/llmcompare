import fs from "node:fs";
import { extractAA, extractJsonArrayNear } from "./artificial-analysis.mjs";

function extractGenericRowsNear(file, key) {
  return extractJsonArrayNear(file, key);
}

// Terminal-Bench, tbench.ai. Every /leaderboard/terminal-bench/<version> URL now
// serves the current board (4.0); older versions are no longer published there, so
// this extractor reports Terminal-Bench 4.0 only. frontierbench.ai likewise
// redirects to tbench.ai and no longer serves Terminal-Bench 3 results.
function extractTBench() {
  const rows = extractGenericRowsNear(
    "benchmarks/terminal-bench-2-1/www.tbench.ai-leaderboard-terminal-bench-2.1.html",
    "rows"
  );
  const scores = [];
  for (const row of rows ?? []) {
    const label = row.metadata?.model_display?.label;
    const accuracy = row.metrics?.accuracy;
    const date = row.metadata?.date;
    const agent = row.metadata?.agent_display?.label ?? "unknown agent";
    const effort = row.metadata?.reasoning_effort;
    const trials = row.metrics?.n_trials;
    if (typeof label !== "string" || !label.trim()) continue;
    if (!Number.isFinite(accuracy)) continue;
    scores.push({
      benchmarkId: "terminal-bench-4",
      sourceModelName: label,
      value: Math.round(accuracy * 10) / 10,
      sourceUrl: "https://www.tbench.ai/leaderboard/terminal-bench/4.0",
      evaluationDate: date ?? "2026-09-02",
      protocol: `Terminal-Bench 4.0 official leaderboard, ${label} with the ${agent} agent${
        effort ? ` at ${effort} reasoning effort` : ""
      }${Number.isFinite(trials) ? `, ${trials} trials` : ""}, accuracy%.`,
    });
  }
  return scores;
}

// swebench.com main page: boards
function extractSweBench() {
  const c = fs.readFileSync("benchmarks/swe-bench-verified/www.swebench.com.html", "utf8");
  const m = c.match(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/i);
  if (!m) throw new Error("swebench.com missing JSON payload");
  const boards = JSON.parse(m[1]);
  const boardToId = { Verified: "swe-bench-verified", Multilingual: "swe-bench-multilingual" };
  const scores = [];
  for (const board of boards) {
    const bid = boardToId[board.name];
    if (!bid) continue;
    for (const row of board.results ?? []) {
      if (typeof row.name !== "string" || !row.name.trim()) continue;
      if (!Number.isFinite(row.resolved)) continue;
      scores.push({
        benchmarkId: bid,
        sourceModelName: row.name,
        value: Math.round(row.resolved * 10) / 10,
        sourceUrl: `https://www.swebench.com/${bid === "swe-bench-verified" ? "verified.html" : "multilingual.html"}`,
        evaluationDate: row.date ?? "2026-08-12",
        protocol: `SWE-bench ${board.name} official leaderboard, ${row.name}, agent ${row.agent ?? "unknown"}, resolved %.`,
      });
    }
  }
  return scores;
}

// bigcodebench results.json
function extractBigCodeBench() {
  const data = JSON.parse(fs.readFileSync("benchmarks/bigcodebench/bigcode-bench.github.io-results.json", "utf8"));
  const scores = [];
  for (const [model, rec] of Object.entries(data)) {
    const pass1 = rec.passAt1 ?? rec["pass@1"] ?? rec.pass1;
    if (typeof pass1?.instruct !== "number" && typeof pass1 !== "number") continue;
    const value = typeof pass1 === "number" ? pass1 : pass1.instruct;
    if (!Number.isFinite(value)) continue;
    scores.push({
      benchmarkId: "bigcodebench",
      sourceModelName: model,
      value: Math.round(value * 10) / 10,
      sourceUrl: "https://bigcode-bench.github.io/",
      evaluationDate: rec.date ?? "2024-12-04",
      protocol: `BigCodeBench official results, ${model}, pass@1 instruct.`,
    });
  }
  return scores;
}

// evalplus results.json -> humaneval, mbpp
function extractEvalPlus() {
  const data = JSON.parse(fs.readFileSync("benchmarks/evalplus/evalplus.github.io-results.json", "utf8"));
  const scores = [];
  for (const [model, rec] of Object.entries(data)) {
    const pass1 = rec["pass@1"];
    if (!pass1) continue;
    if (typeof pass1.humaneval === "number") {
      scores.push({
        benchmarkId: "humaneval",
        sourceModelName: model,
        value: Math.round(pass1.humaneval * 10) / 10,
        sourceUrl: "https://evalplus.github.io/",
        evaluationDate: "2024-12-04",
        protocol: `EvalPlus official results, ${model}, HumanEval pass@1.`,
      });
    }
    if (typeof pass1.mbpp === "number") {
      scores.push({
        benchmarkId: "mbpp",
        sourceModelName: model,
        value: Math.round(pass1.mbpp * 10) / 10,
        sourceUrl: "https://evalplus.github.io/",
        evaluationDate: "2024-12-04",
        protocol: `EvalPlus official results, ${model}, MBPP pass@1.`,
      });
    }
  }
  return scores;
}

// livecodebench json: aggregate pass@1 per model
function extractLiveCodeBenchJson() {
  const data = JSON.parse(fs.readFileSync("benchmarks/livecodebench/livecodebench.github.io-performances_generation.json", "utf8"));
  const perf = data.performances ?? data;
  if (!Array.isArray(perf)) return [];
  const byModel = new Map();
  for (const row of perf) {
    if (!row.model) continue;
    if (!byModel.has(row.model)) byModel.set(row.model, []);
    byModel.get(row.model).push(row["pass@1"]);
  }
  const scores = [];
  for (const [model, vals] of byModel) {
    const valid = vals.filter((v) => Number.isFinite(v));
    if (valid.length === 0) continue;
    const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
    scores.push({
      benchmarkId: "livecodebench",
      sourceModelName: model,
      value: Math.round(avg * 10) / 10,
      sourceUrl: "https://livecodebench.github.io/",
      evaluationDate: "2026-08-12",
      protocol: `LiveCodeBench official performances (pass@1 across questions), ${model}.`,
    });
  }
  return scores;
}

export function extractAll({ evaluationDate = "2026-09-02" } = {}) {
  const out = {};
  for (const id of [
    "gpqa-diamond",
    "hle",
    "scicode",
    "terminal-bench-2-1",
    "aa-intelligence-index",
    "aa-omniscience-accuracy",
    "aa-lcr",
    "critpt",
    "tau3-banking",
    "mmmu-pro",
    "ifbench",
  ]) {
    out[id] = extractAA(id, { evaluationDate });
  }
  out["terminal-bench-4"] = extractTBench();
  out["swebench"] = extractSweBench();
  out["bigcodebench"] = extractBigCodeBench();
  out["evalplus"] = extractEvalPlus();
  out["livecodebench-json"] = extractLiveCodeBenchJson();
  return out;
}

if (process.argv[1]?.endsWith("extract-scores.mjs")) {
  const out = extractAll();
  for (const [name, scores] of Object.entries(out)) {
    console.log(`${name}: ${scores.length} scores`);
  }
}
