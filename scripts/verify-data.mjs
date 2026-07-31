import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const asOf = "2026-07-31";

const source = fs.readFileSync("src/data/models.ts", "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const compiledModule = { exports: {} };
vm.runInNewContext(compiled, {
  exports: compiledModule.exports,
  module: compiledModule,
  require,
});

const models = compiledModule.exports.models;
const benchmarkIds = new Set([
  "mmlu-pro",
  "gpqa-diamond",
  "hle",
  "aime-2025",
  "math-500",
  "simpleqa",
  "swe-bench-verified",
  "swe-bench-pro",
  "swe-bench-multilingual",
  "livecodebench",
  "terminal-bench-2-1",
  "aider-polyglot",
  "bfcl-v3",
  "scicode",
  "cursorbench",
  "swe-rebench",
  "nl2repo",
  "vibe-code-bench",
  "webdev-arena",
  "lmarena-elo",
  "arena-hard",
]);

const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};
const bySlug = Object.fromEntries(models.map((model) => [model.slug, model]));

check(models.length === 255, `expected 255 models, found ${models.length}`);
check(new Set(models.map((model) => model.slug)).size === models.length, "duplicate model slug");
check(!bySlug["gpt-5-6-sol-fast"], "Fast mode must not be a duplicate model record");

for (const model of models) {
  check(model.releaseDate <= asOf, `${model.slug} has a future release date`);
  check(model.contextWindow > 0, `${model.slug} has no positive context window`);
  check(model.modalities?.input?.length > 0, `${model.slug} has no input modality`);
  check(model.modalities?.output?.length > 0, `${model.slug} has no output modality`);
  for (const id of Object.keys(model.benchmarks)) {
    check(benchmarkIds.has(id), `${model.slug} has unknown benchmark ${id}`);
    check(Number.isFinite(model.benchmarks[id]), `${model.slug}/${id} is not numeric`);
  }
}

const exact = (slug, path, expected) => {
  const value = path.split(".").reduce((current, key) => current?.[key], bySlug[slug]);
  check(value === expected, `${slug}.${path} expected ${expected}, found ${value}`);
};

exact("gpt-5-6-sol", "pricing.inputPer1M", 5);
exact("gpt-5-6-sol", "pricing.outputPer1M", 30);
exact("gpt-5-6-terra", "pricing.inputPer1M", 2);
exact("gpt-5-6-terra", "pricing.outputPer1M", 12);
exact("gpt-5-6-luna", "pricing.inputPer1M", 0.2);
exact("gpt-5-6-luna", "pricing.outputPer1M", 1.2);
exact("gpt-5-6-sol", "benchmarks.gpqa-diamond", 94.6);
exact("gpt-5-6-terra", "benchmarks.terminal-bench-2-1", 87.4);
exact("gpt-5-6-luna", "benchmarks.swe-bench-pro", 62.7);
exact("deepseek-v4-flash", "benchmarks.terminal-bench-2-1", 82.7);
exact("deepseek-v4-flash", "benchmarks.nl2repo", 54.2);
exact("gemma-4-31b", "contextWindow", 256000);
exact("gemma-4-26b", "parameters.active", 3.8);
exact("grok-4-20", "releaseDate", "2026-03-10");
exact("grok-4-20", "contextWindow", 1000000);
exact("mistral-small-4", "releaseDate", "2026-03-16");
exact("devstral-2", "releaseDate", "2025-12-09");

check(Object.keys(bySlug["gemini-2-0-flash"].benchmarks).length === 0, "retired Gemini 2.0 score leaked");
check(Object.keys(bySlug["claude-opus-5"].benchmarks).length === 0, "Claude Opus 5 has no primary benchmark scorecard yet");

const scoreCount = models.reduce(
  (total, model) => total + Object.keys(model.benchmarks).length,
  0
);
check(scoreCount === 74, `expected 74 audited benchmark cells, found ${scoreCount}`);

if (failures.length > 0) {
  console.error(failures.map((failure) => `FAIL ${failure}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`OK ${models.length} models; ${scoreCount} audited benchmark cells; snapshot ${asOf}`);
}
