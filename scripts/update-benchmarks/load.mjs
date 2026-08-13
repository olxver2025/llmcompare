import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");

export function load(path, exportName) {
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

export async function fetchText(url) {
  let res;
  try {
    res = await fetch(url);
  } catch (error) {
    throw new Error(`Failed to fetch ${url}: ${error.message}`);
  }
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${url} returned ${res.status}: ${text.slice(0, 400)}`);
  }
  return text;
}

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function formatNumber(value) {
  if (Number.isInteger(value)) return String(value);
  return String(value);
}

export function needsQuotedKey(id) {
  return !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(id);
}
