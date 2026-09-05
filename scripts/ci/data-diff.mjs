/**
 * Computes the set of catalog facts a pull request adds or changes.
 *
 * Every downstream CI check works from this diff rather than from the raw text
 * patch, so a reformat of models.ts reports zero changed facts while a single
 * edited digit reports exactly one.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { load } from "../update-benchmarks/load.mjs";

/** Fields whose values AGENTS.md forbids guessing, inferring, or rounding into existence. */
export const SOURCED_MODEL_FIELDS = [
  "name",
  "organization",
  "releaseDate",
  "knowledgeCutoff",
  "openSource",
  "license",
  "parameters.total",
  "parameters.active",
  "contextWindow",
  "maxOutput",
  "modalities.input",
  "modalities.output",
  "pricing.provider",
  "pricing.inputPer1M",
  "pricing.outputPer1M",
  "pricing.offPeak.inputPer1M",
  "pricing.offPeak.outputPer1M",
  "pricing.peakHours",
  "speed.tokensPerSec",
  "speed.ttftSeconds",
  "fast.pricing.inputPer1M",
  "fast.pricing.outputPer1M",
  "fast.speed.tokensPerSec",
  "ultrafast.pricing.inputPer1M",
  "ultrafast.pricing.outputPer1M",
  "benchmarkAliasOf",
];

const SOURCED_MEDIA_FIELDS = [
  "name",
  "organization",
  "releaseDate",
  "openSource",
  "license",
  "specs.maxResolution.width",
  "specs.maxResolution.height",
  "specs.maxDurationSeconds",
  "specs.secondsPerImage",
  "specs.secondsPerVideoSecond",
  "pricing.provider",
  "pricing.perImage",
  "pricing.perSecond",
];

const DATA_PATHS = [
  "src/data/models.ts",
  "src/data/image-models.ts",
  "src/data/video-models.ts",
  "src/data/benchmarks.ts",
  "src/data/types.ts",
  "scripts/benchmark-evidence.json",
  "scripts/benchmark-sources.json",
  "scripts/benchmark-retained-values.json",
  "scripts/benchmark-empty-models.json",
];

function at(object, dottedPath) {
  return dottedPath.split(".").reduce((current, key) => current?.[key], object);
}

function same(a, b) {
  if (Array.isArray(a) || Array.isArray(b)) {
    return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
  }
  return a === b;
}

function show(ref, filePath) {
  try {
    return execFileSync("git", ["show", `${ref}:${filePath}`], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch {
    return null;
  }
}

/** Materializes the base revision of the data files so `load` can evaluate them. */
function checkoutBase(ref) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "llmcompare-base-"));
  const written = {};
  for (const filePath of DATA_PATHS) {
    const contents = show(ref, filePath);
    if (contents === null) continue;
    const target = path.join(dir, filePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, contents);
    written[filePath] = target;
  }
  return { dir, written };
}

function loadCatalog(rootedAt, filePath, exportName) {
  const resolved = rootedAt ? rootedAt[filePath] : filePath;
  if (!resolved || !fs.existsSync(resolved)) return null;
  try {
    return load(resolved, exportName) ?? null;
  } catch {
    return null;
  }
}

function readJson(rootedAt, filePath) {
  const resolved = rootedAt ? rootedAt[filePath] : filePath;
  if (!resolved || !fs.existsSync(resolved)) return null;
  try {
    return JSON.parse(fs.readFileSync(resolved, "utf8"));
  } catch {
    return null;
  }
}

function indexBySlug(catalog) {
  return Object.fromEntries((catalog ?? []).map((entry) => [entry.slug, entry]));
}

function evidenceFor(ledger, slug, benchmarkId) {
  return ledger?.cells?.[slug]?.[benchmarkId] ?? null;
}

function diffModelFields(fields, before, after, kind, out) {
  for (const field of fields) {
    const previous = at(before, field);
    const next = at(after, field);
    if (same(previous, next)) continue;
    out.push({
      kind,
      slug: after.slug,
      name: after.name,
      field,
      before: previous ?? null,
      after: next ?? null,
    });
  }
}

export function computeDataDiff(baseRef) {
  const base = checkoutBase(baseRef);

  const headModels = loadCatalog(null, "src/data/models.ts", "models") ?? [];
  const baseModels = loadCatalog(base.written, "src/data/models.ts", "models") ?? [];
  const headImages = loadCatalog(null, "src/data/image-models.ts", "imageModels") ?? [];
  const baseImages = loadCatalog(base.written, "src/data/image-models.ts", "imageModels") ?? [];
  const headVideos = loadCatalog(null, "src/data/video-models.ts", "videoModels") ?? [];
  const baseVideos = loadCatalog(base.written, "src/data/video-models.ts", "videoModels") ?? [];
  const headBenchmarks = loadCatalog(null, "src/data/benchmarks.ts", "BENCHMARKS") ?? {};
  const baseBenchmarks = loadCatalog(base.written, "src/data/benchmarks.ts", "BENCHMARKS") ?? {};

  const headLedger = readJson(null, "scripts/benchmark-evidence.json");
  const baseLedger = readJson(base.written, "scripts/benchmark-evidence.json");

  const headBySlug = indexBySlug(headModels);
  const baseBySlug = indexBySlug(baseModels);

  const addedModels = [];
  const removedModels = [];
  const changedFields = [];
  const benchmarkCells = [];

  for (const model of headModels) {
    const previous = baseBySlug[model.slug];
    if (!previous) {
      addedModels.push({
        kind: "llm",
        slug: model.slug,
        name: model.name,
        organization: model.organization,
        releaseDate: model.releaseDate,
        contextWindow: model.contextWindow,
        maxOutput: model.maxOutput ?? null,
        pricing: model.pricing ?? null,
        links: model.links ?? {},
        benchmarkCount: Object.keys(model.benchmarks ?? {}).length,
      });
    } else {
      diffModelFields(SOURCED_MODEL_FIELDS, previous, model, "llm", changedFields);
    }

    for (const [benchmarkId, value] of Object.entries(model.benchmarks ?? {})) {
      const previousValue = previous?.benchmarks?.[benchmarkId];
      if (previousValue === value) continue;
      const evidence = evidenceFor(headLedger, model.slug, benchmarkId);
      const priorEvidence = evidenceFor(baseLedger, model.slug, benchmarkId);
      benchmarkCells.push({
        slug: model.slug,
        modelName: model.name,
        organization: model.organization,
        benchmarkId,
        benchmarkName: headBenchmarks?.[benchmarkId]?.name ?? benchmarkId,
        unit: headBenchmarks?.[benchmarkId]?.unit ?? null,
        change: previousValue === undefined ? "added" : "changed",
        before: previousValue ?? null,
        after: value,
        aliasOf: model.benchmarkAliasOf ?? null,
        evidence,
        priorEvidence,
      });
    }

    for (const benchmarkId of Object.keys(previous?.benchmarks ?? {})) {
      if (model.benchmarks?.[benchmarkId] === undefined) {
        benchmarkCells.push({
          slug: model.slug,
          modelName: model.name,
          organization: model.organization,
          benchmarkId,
          benchmarkName: headBenchmarks?.[benchmarkId]?.name ?? benchmarkId,
          unit: baseBenchmarks?.[benchmarkId]?.unit ?? null,
          change: "removed",
          before: previous.benchmarks[benchmarkId],
          after: null,
          aliasOf: model.benchmarkAliasOf ?? null,
          evidence: null,
          priorEvidence: evidenceFor(baseLedger, model.slug, benchmarkId),
        });
      }
    }
  }

  for (const model of baseModels) {
    if (!headBySlug[model.slug]) {
      removedModels.push({ kind: "llm", slug: model.slug, name: model.name });
    }
  }

  const mediaChanges = [];
  for (const [kind, headCatalog, baseCatalog] of [
    ["image", headImages, baseImages],
    ["video", headVideos, baseVideos],
  ]) {
    const previousBySlug = indexBySlug(baseCatalog);
    for (const model of headCatalog) {
      const previous = previousBySlug[model.slug];
      if (!previous) {
        addedModels.push({
          kind,
          slug: model.slug,
          name: model.name,
          organization: model.organization,
          releaseDate: model.releaseDate,
          pricing: model.pricing ?? null,
          links: model.links ?? {},
        });
        continue;
      }
      diffModelFields(SOURCED_MEDIA_FIELDS, previous, model, kind, mediaChanges);
      for (const [benchmarkId, value] of Object.entries(model.benchmarks ?? {})) {
        if (previous.benchmarks?.[benchmarkId] === value) continue;
        mediaChanges.push({
          kind,
          slug: model.slug,
          name: model.name,
          field: `benchmarks.${benchmarkId}`,
          before: previous.benchmarks?.[benchmarkId] ?? null,
          after: value,
        });
      }
    }
  }

  const benchmarkMetaChanges = [];
  for (const [id, meta] of Object.entries(headBenchmarks)) {
    const previous = baseBenchmarks?.[id];
    if (!previous) {
      benchmarkMetaChanges.push({ id, change: "added", after: meta });
      continue;
    }
    for (const field of ["name", "shortName", "unit", "higherIsBetter", "category", "sourceUrl", "description"]) {
      if (same(previous[field], meta[field])) continue;
      benchmarkMetaChanges.push({
        id,
        change: "changed",
        field,
        before: previous[field] ?? null,
        after: meta[field] ?? null,
      });
    }
  }
  for (const id of Object.keys(baseBenchmarks ?? {})) {
    if (!headBenchmarks?.[id]) benchmarkMetaChanges.push({ id, change: "removed" });
  }

  fs.rmSync(base.dir, { recursive: true, force: true });

  return {
    baseRef,
    generatedAt: new Date().toISOString(),
    addedModels,
    removedModels,
    changedFields: [...changedFields, ...mediaChanges],
    benchmarkCells,
    benchmarkMetaChanges,
    totals: {
      addedModels: addedModels.length,
      removedModels: removedModels.length,
      changedFields: changedFields.length + mediaChanges.length,
      benchmarkCells: benchmarkCells.length,
      benchmarkMetaChanges: benchmarkMetaChanges.length,
    },
  };
}

export function isEmptyDiff(diff) {
  return Object.values(diff.totals).every((count) => count === 0);
}

export function resolveBaseRef() {
  const explicit = process.argv.find((arg) => arg.startsWith("--base="));
  if (explicit) return explicit.slice("--base=".length);
  if (process.env.DATA_DIFF_BASE) return process.env.DATA_DIFF_BASE;
  if (process.env.GITHUB_BASE_REF) return `origin/${process.env.GITHUB_BASE_REF}`;
  return "HEAD^";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const diff = computeDataDiff(resolveBaseRef());
  const outArg = process.argv.find((arg) => arg.startsWith("--out="));
  const json = `${JSON.stringify(diff, null, 2)}\n`;
  if (outArg) fs.writeFileSync(outArg.slice("--out=".length), json);
  else process.stdout.write(json);
}
