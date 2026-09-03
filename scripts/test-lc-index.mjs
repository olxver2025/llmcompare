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

const compositePseudocount = load(
  "src/lib/composite-shrink.ts",
  "compositePseudocount"
);
const shrinkCompositeZ = load("src/lib/composite-shrink.ts", "shrinkCompositeZ");

const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

check(compositePseudocount(18) === 5, "18-bench battery should use k=5");
check(compositePseudocount(4) === 1, "4-bench category should use k=1");
check(compositePseudocount(10) === 3, "10-bench category should use k=3");

// Astra-like: 4 benches, mean z 1.329, battery 18 → 5.316 / 9 = 0.591
const astra = shrinkCompositeZ(1.329 * 4, 4, 18);
check(
  Math.abs(astra - 0.591) < 0.002,
  `Astra-like shrink should be ~0.591, got ${astra}`
);

// Sol-like: 14 benches, mean z 0.795 → 11.13 / 19 = 0.586
const sol = shrinkCompositeZ(0.795 * 14, 14, 18);
check(
  Math.abs(sol - 0.586) < 0.002,
  `Sol-like shrink should be ~0.586, got ${sol}`
);

// Spark-like: 8 benches, mean z 0.716 → 5.728 / 13 = 0.441
const spark = shrinkCompositeZ(0.716 * 8, 8, 18);
check(astra > spark, "strong-sparse should outrank milder-broader Spark-like");
check(
  Math.abs(astra - sol) < 0.02,
  "Astra-like and Sol-like should land close after shrinkage"
);

// Old missing-as-0 formula would rank Sol well above Astra (0.619 vs 0.295).
const oldAstra = (1.329 * 4) / 18;
const oldSol = (0.795 * 14) / 18;
check(oldAstra < oldSol, "sanity: old formula punished Astra");
check(astra >= sol - 0.01, "new formula should not punish Astra below Sol");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("lc-index shrink tests passed");
