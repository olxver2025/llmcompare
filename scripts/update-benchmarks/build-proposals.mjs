import fs from "node:fs";
import { load } from "./load.mjs";
import { normalizeName } from "./match.mjs";
import { adapters } from "./sources/local.mjs";

const models = load("src/data/models.ts", "models");
const bySlug = Object.fromEntries(models.map((m) => [m.slug, m]));

const nameMap = JSON.parse(fs.readFileSync("scripts/update-benchmarks/name-map.json", "utf8"));
const mapped = nameMap.sources ?? {};

function catalogLookup() {
  const map = new Map();
  for (const m of models) {
    for (const norm of [normalizeName(m.slug), normalizeName(m.name)]) {
      if (!norm) continue;
      if (!map.has(norm)) map.set(norm, new Set());
      map.get(norm).add(m.slug);
    }
  }
  const out = new Map();
  for (const [norm, set] of map) out.set(norm, [...set]);
  return out;
}
const LOOKUP = catalogLookup();

function resolveExact(name) {
  const norm = normalizeName(name);
  if (!norm) return null;
  const hits = LOOKUP.get(norm);
  return hits?.length === 1 ? hits[0] : null;
}

function resolveFromMap(adapterName, sourceName) {
  const entries = mapped[adapterName] ?? {};
  const hits = Object.entries(entries).filter(([, value]) => value === sourceName).map(([slug]) => slug);
  return hits.length === 1 ? hits[0] : null;
}

const PRIORITY = ["tbench", "frontierbench", "bigcodebench", "swebench-verified", "swebench-multilingual"];

async function main() {
  const cells = new Map(); // slug/bid -> proposal
  const unmatched = [];
  const seen = new Set();

  for (const adapter of adapters) {
    const scores = await adapter.fetchScores();
    for (const score of scores) {
      const slug = resolveExact(score.sourceModelName) ?? resolveFromMap(adapter.name, score.sourceModelName);
      if (!slug) {
        const key = `${adapter.name}\0${score.sourceModelName}`;
        if (!seen.has(key)) { seen.add(key); unmatched.push({ source: adapter.name, sourceModelName: score.sourceModelName }); }
        continue;
      }
      const model = bySlug[slug];
      const oldValue = model?.benchmarks?.[score.benchmarkId];
      // ADD-only: never overwrite audited cells
      if (oldValue !== undefined) continue;
      const key = `${slug}\0${score.benchmarkId}`;
      const existing = cells.get(key);
      const priority = PRIORITY.indexOf(adapter.name);
      if (existing) {
        const existingPriority = PRIORITY.indexOf(existing.source);
        if (priority < 0 && existingPriority >= 0) continue; // prefer official over AA
        if (priority >= 0 && existingPriority >= 0 && priority > existingPriority) continue;
        if (priority >= 0 && existingPriority >= 0 && priority < existingPriority) { cells.set(key, make(slug, score, adapter.name)); }
        continue;
      }
      cells.set(key, make(slug, score, adapter.name));
    }
  }

  function make(slug, score, source) {
    return {
      slug,
      benchmarkId: score.benchmarkId,
      oldValue: undefined,
      newValue: score.value,
      source,
      sourceUrl: score.sourceUrl,
      evaluationDate: score.evaluationDate,
      protocol: score.protocol,
      kind: "add",
    };
  }

  const proposals = [...cells.values()];
  const unmatchedList = [...new Map(unmatched.map((u) => [`${u.source}\0${u.sourceModelName}`, u])).values()];

  console.log(`proposals: ${proposals.length} (all adds)`);
  console.log(`unmatched: ${unmatchedList.length}`);

  const out = { generatedAt: "2026-08-13", proposals, unmatched: unmatchedList };
  fs.writeFileSync("C:/Users/olxvrr/AppData/Local/Temp/opencode/bench-extract/proposals-adds.json", JSON.stringify(out, null, 2));
  fs.writeFileSync("C:/Users/olxvrr/AppData/Local/Temp/opencode/bench-extract/unmatched-adds.txt", unmatchedList.map((u) => `${u.source}\t${u.sourceModelName}`).join("\n") + "\n", "utf8");

  const byBench = {};
  for (const p of proposals) byBench[p.benchmarkId] = (byBench[p.benchmarkId] ?? 0) + 1;
  console.log("by benchmark:", JSON.stringify(byBench, null, 1));
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
