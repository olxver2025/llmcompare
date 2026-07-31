import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");

function load(path, exportName) {
  const source = fs.readFileSync(path, "utf8");
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
  return compiledModule.exports[exportName];
}

const decideOverallLead = load(
  "src/lib/compare-scoring.ts",
  "decideOverallLead"
);

const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

// Fable-vs-Flash shape: no shared quality, specs favor A, value swamps for B.
{
  const result = decideOverallLead({
    quality: { a: 0, b: 0, ties: 0 },
    specs: { a: 1, b: 0, ties: 1 },
    value: { a: 0, b: 5, ties: 0 },
    sharedBenchmarkCount: 0,
    coverageA: 18,
    coverageB: 0,
  });
  check(result.lead === "a", `Fable/Flash-like: expected lead a, got ${result.lead}`);
  check(result.basis === "specs", `Fable/Flash-like: expected specs, got ${result.basis}`);
  check(result.includeValue === false, "Fable/Flash-like: value must not count");
}

// Quality majority beats value pile-up.
{
  const result = decideOverallLead({
    quality: { a: 4, b: 1, ties: 0 },
    specs: { a: 0, b: 1, ties: 0 },
    value: { a: 0, b: 5, ties: 0 },
    sharedBenchmarkCount: 5,
    coverageA: 5,
    coverageB: 5,
  });
  check(result.lead === "a", `quality majority: expected a, got ${result.lead}`);
  check(result.basis === "quality", `quality majority: expected quality, got ${result.basis}`);
}

// Comparable quality + tied specs → value may decide.
{
  const result = decideOverallLead({
    quality: { a: 2, b: 2, ties: 1 },
    specs: { a: 1, b: 1, ties: 1 },
    value: { a: 0, b: 3, ties: 0 },
    sharedBenchmarkCount: 5,
    coverageA: 5,
    coverageB: 5,
    eloA: 1400,
    eloB: 1410,
  });
  check(result.lead === "b", `value tie-break: expected b, got ${result.lead}`);
  check(result.basis === "value", `value tie-break: expected value, got ${result.basis}`);
  check(result.includeValue === true, "value tie-break: includeValue");
}

// Price alone cannot win when there is no comparable quality.
{
  const result = decideOverallLead({
    quality: { a: 0, b: 0, ties: 0 },
    specs: { a: 0, b: 0, ties: 2 },
    value: { a: 0, b: 5, ties: 0 },
    sharedBenchmarkCount: 0,
    coverageA: 0,
    coverageB: 0,
  });
  check(result.lead === null, `price-only: expected tie, got ${result.lead}`);
  check(result.basis === "tie", `price-only: expected tie basis, got ${result.basis}`);
}

// One-sided coverage when specs also tied.
{
  const result = decideOverallLead({
    quality: { a: 0, b: 0, ties: 0 },
    specs: { a: 0, b: 0, ties: 2 },
    value: { a: 0, b: 5, ties: 0 },
    sharedBenchmarkCount: 0,
    coverageA: 10,
    coverageB: 0,
  });
  check(result.lead === "a", `coverage: expected a, got ${result.lead}`);
  check(result.basis === "quality", `coverage: expected quality, got ${result.basis}`);
}

if (failures.length) {
  console.error("compare-scoring tests failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`compare-scoring: ${5} cases passed`);
