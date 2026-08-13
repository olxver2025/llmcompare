import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load, todayIsoDate } from "./load.mjs";
import { getAdapters } from "./sources/index.mjs";
import {
  buildCatalogIndex,
  exactCatalogMatch,
  resolveSourceName,
  suggestSlugs,
} from "./match.mjs";
import { applyProposals, resolveFromPath } from "./apply.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const NAME_MAP_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "name-map.json"
);
const PROPOSALS_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "proposals.json"
);

function usage() {
  return `Usage:
  npm run update:benchmarks
  npm run update:benchmarks -- --model <slug>
  npm run update:benchmarks -- --source <adapter>
  npm run update:benchmarks -- --benchmark <id>
  npm run update:benchmarks -- --apply
  npm run update:benchmarks -- --apply --from proposals.json`;
}

function parseArgs(argv) {
  const flags = {
    models: [],
    sources: [],
    benchmarks: [],
    apply: false,
    from: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => {
      const value = argv[++i];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for ${arg}\n${usage()}`);
      }
      return value;
    };
    if (arg === "--apply") flags.apply = true;
    else if (arg === "--model") flags.models.push(next());
    else if (arg === "--source") flags.sources.push(next());
    else if (arg === "--benchmark") flags.benchmarks.push(next());
    else if (arg === "--from") flags.from = next();
    else throw new Error(`Unknown argument: ${arg}\n${usage()}`);
  }
  return flags;
}

function rangeOk(value, unit) {
  if (!Number.isFinite(value)) return false;
  if (unit === "elo") return value >= 0 && value <= 3000;
  return value >= 0 && value <= 100;
}

function sameValue(a, b) {
  return a === b;
}

function pad(value, width) {
  const text = String(value);
  return text.length >= width ? text : `${text}${" ".repeat(width - text.length)}`;
}

function printTable(proposals) {
  if (proposals.length === 0) {
    console.log("No score changes proposed.");
    return;
  }
  const rows = proposals.map((proposal) => [
    proposal.slug,
    proposal.benchmarkId,
    `${proposal.oldValue === undefined ? "—" : proposal.oldValue} → ${proposal.newValue}`,
    proposal.source,
    proposal.evaluationDate,
    proposal.kind + (proposal.conflict ? " CONFLICT" : ""),
  ]);
  const headers = ["model", "benchmark", "old → new", "source", "eval date", "kind"];
  const widths = headers.map((header, i) =>
    Math.max(header.length, ...rows.map((row) => String(row[i]).length))
  );
  console.log(headers.map((header, i) => pad(header, widths[i])).join("  "));
  console.log(widths.map((width) => "-".repeat(width)).join("  "));
  for (const row of rows) {
    console.log(row.map((cell, i) => pad(cell, widths[i])).join("  "));
  }
}

function printUnmatched(unmatched) {
  if (unmatched.length === 0) return;
  console.log(`\nUnmatched source names (${unmatched.length}):`);
  for (const row of unmatched) {
    const suggestions = row.suggestions.length
      ? ` suggestions: ${row.suggestions.join(", ")}`
      : "";
    console.log(`  [${row.source}] ${row.sourceModelName}${suggestions}`);
  }
}

function filterProposals(proposals, flags) {
  return proposals.filter((proposal) => {
    if (flags.models.length && !flags.models.includes(proposal.slug)) return false;
    if (flags.sources.length && !flags.sources.includes(proposal.source)) return false;
    if (flags.benchmarks.length && !flags.benchmarks.includes(proposal.benchmarkId)) {
      return false;
    }
    return true;
  });
}

function markConflicts(proposals) {
  const groups = new Map();
  for (const proposal of proposals) {
    const key = `${proposal.slug}\0${proposal.benchmarkId}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(proposal);
  }
  for (const group of groups.values()) {
    const values = [...new Set(group.map((proposal) => proposal.newValue))];
    if (values.length > 1) {
      for (const proposal of group) proposal.conflict = true;
    }
  }
  return proposals;
}

function buildProposals({ scoresByAdapter, models, nameMap, catalog, flags, generatedAt }) {
  const bySlug = Object.fromEntries(models.map((model) => [model.slug, model]));
  const aliasesByCanonical = new Map();
  for (const model of models) {
    if (!model.benchmarkAliasOf) continue;
    if (!aliasesByCanonical.has(model.benchmarkAliasOf)) {
      aliasesByCanonical.set(model.benchmarkAliasOf, []);
    }
    aliasesByCanonical.get(model.benchmarkAliasOf).push(model.slug);
  }

  const proposals = [];
  const unmatched = [];
  const unmatchedSeen = new Set();

  for (const [adapterName, scores] of scoresByAdapter) {
    for (const score of scores) {
      if (flags.benchmarks.length && !flags.benchmarks.includes(score.benchmarkId)) {
        continue;
      }
      const mappedSlug = resolveSourceName(score.sourceModelName, adapterName, nameMap);
      const claimedSlugs = new Set(Object.keys(nameMap.sources?.[adapterName] ?? {}));
      const exactSlug = exactCatalogMatch(score.sourceModelName, catalog);
      const slug =
        mappedSlug ?? (exactSlug && !claimedSlugs.has(exactSlug) ? exactSlug : null);
      if (!slug) {
        const key = `${adapterName}\0${score.sourceModelName}`;
        if (!unmatchedSeen.has(key)) {
          unmatchedSeen.add(key);
          unmatched.push({
            source: adapterName,
            sourceModelName: score.sourceModelName,
            suggestions: suggestSlugs(score.sourceModelName, catalog),
          });
        }
        continue;
      }
      if (flags.models.length && !flags.models.includes(slug)) continue;
      const model = bySlug[slug];
      if (!model) continue;
      const oldValue = model.benchmarks?.[score.benchmarkId];
      if (oldValue !== undefined && sameValue(oldValue, score.value)) continue;
      if (proposals.some((proposal) =>
        proposal.slug === slug &&
        proposal.benchmarkId === score.benchmarkId &&
        proposal.source === adapterName &&
        proposal.newValue === score.value
      )) {
        continue;
      }
      proposals.push({
        slug,
        benchmarkId: score.benchmarkId,
        oldValue,
        newValue: score.value,
        source: adapterName,
        sourceUrl: score.sourceUrl,
        evaluationDate: score.evaluationDate,
        protocol: score.protocol,
        kind: oldValue === undefined ? "add" : "update",
        aliasPropagation: aliasesByCanonical.get(slug) ?? [],
      });
    }
  }

  markConflicts(proposals);
  return {
    generatedAt,
    proposals,
    unmatched,
  };
}

async function main() {
  process.chdir(ROOT);
  const flags = parseArgs(process.argv.slice(2));
  const models = load("src/data/models.ts", "models");
  const benchmarkCatalog = load("src/data/benchmarks.ts", "BENCHMARKS");
  const bySlug = Object.fromEntries(models.map((model) => [model.slug, model]));

  for (const slug of flags.models) {
    if (!bySlug[slug]) {
      throw new Error(`Unknown model slug: ${slug}`);
    }
  }
  for (const id of flags.benchmarks) {
    if (!benchmarkCatalog[id]) {
      throw new Error(`Unknown benchmark: ${id}`);
    }
  }

  const nameMap = JSON.parse(fs.readFileSync(NAME_MAP_PATH, "utf8"));
  const catalog = buildCatalogIndex(models);
  const generatedAt = todayIsoDate();

  let output;
  if (flags.from) {
    const fromPath = resolveFromPath(flags.from);
    output = JSON.parse(fs.readFileSync(fromPath, "utf8"));
    if (!Array.isArray(output.proposals)) {
      throw new Error(`${fromPath} is missing a proposals array`);
    }
    output.proposals = filterProposals(output.proposals, flags);
    markConflicts(output.proposals);
    output.unmatched ??= [];
  } else {
    const selected = getAdapters(flags.sources);
    const scoresByAdapter = [];
    for (const adapter of selected) {
      const scores = await adapter.fetchScores();
      if (!Array.isArray(scores) || scores.length === 0) {
        throw new Error(`${adapter.name} returned no scores`);
      }
      for (const score of scores) {
        if (!score.benchmarkId || !score.sourceModelName || !score.sourceUrl) {
          throw new Error(
            `${adapter.name} returned an incomplete score: ${JSON.stringify(score).slice(0, 300)}`
          );
        }
        if (!score.evaluationDate || !score.protocol) {
          throw new Error(
            `${adapter.name} returned a score without provenance: ${JSON.stringify(score).slice(0, 300)}`
          );
        }
        const unit = benchmarkCatalog[score.benchmarkId]?.unit;
        if (!unit) {
          throw new Error(
            `${adapter.name} returned unknown benchmark ${score.benchmarkId}`
          );
        }
        if (!rangeOk(score.value, unit)) {
          throw new Error(
            `${adapter.name} returned out-of-range ${score.benchmarkId} value ${score.value} for ${score.sourceModelName}`
          );
        }
      }
      scoresByAdapter.push([adapter.name, scores]);
    }
    output = buildProposals({
      scoresByAdapter,
      models,
      nameMap,
      catalog,
      flags,
      generatedAt,
    });
  }

  fs.writeFileSync(PROPOSALS_PATH, `${JSON.stringify(output, null, 2)}\n`);
  printTable(output.proposals);
  printUnmatched(output.unmatched);
  console.log(`\nWrote ${PROPOSALS_PATH}`);

  if (!flags.apply) return;

  const conflicts = output.proposals.filter((proposal) => proposal.conflict);
  if (conflicts.length > 0) {
    console.error(
      `\n--apply blocked: ${conflicts.length} conflicting cell(s). Narrow with --source/--benchmark.`
    );
    process.exitCode = 2;
    return;
  }
  if (output.proposals.length === 0) {
    console.log("Nothing to apply.");
    return;
  }

  const result = await applyProposals(output.proposals, {
    today: generatedAt,
    models,
  });
  console.log(
    `\nApplied ${result.applied.length} cell(s) (including aliases). scoreCount=${result.scoreCount}`
  );
  if (result.exactUpdated.length > 0) {
    console.log("RE-REVIEW exact() spot-checks:");
    for (const line of result.exactUpdated) console.log(`  ${line}`);
  }
  if (result.verifyStatus !== 0) {
    console.error(`verify-data failed:\n${result.verifyOutput}`);
    process.exitCode = 2;
    return;
  }
  console.log(result.verifyOutput);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
