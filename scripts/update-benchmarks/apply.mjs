import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { load, formatNumber, needsQuotedKey } from "./load.mjs";

const MODELS_PATH = "src/data/models.ts";
const RETAINED_PATH = "scripts/benchmark-retained-values.json";
const SOURCES_PATH = "scripts/benchmark-sources.json";
const EMPTY_PATH = "scripts/benchmark-empty-models.json";
const VERIFY_PATH = "scripts/verify-data.mjs";
const GENERATOR_PATH = "scripts/generate-benchmark-evidence.mjs";
const MODELS_LIB_PATH = "src/lib/models.ts";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatBenchKey(id) {
  return needsQuotedKey(id) ? JSON.stringify(id) : id;
}

function cellValue(cell) {
  return cell.newValue ?? cell.value;
}

function benchKeyPattern(id) {
  return needsQuotedKey(id) ? JSON.stringify(id) : id;
}

export function findModelRegion(source, slug) {
  const needle = `slug: "${slug}"`;
  const slugAt = source.indexOf(needle);
  if (slugAt < 0) throw new Error(`Could not find slug ${slug} in models.ts`);
  if (source.indexOf(needle, slugAt + needle.length) >= 0) {
    throw new Error(`Duplicate slug ${slug} in models.ts`);
  }
  const afterSlug = slugAt + needle.length;
  const nextSlug = source.indexOf("\n    slug: ", afterSlug);
  const end = nextSlug >= 0 ? nextSlug : source.length;
  return { start: slugAt, end, text: source.slice(slugAt, end) };
}

function findMatchingBrace(text, openAt) {
  let depth = 0;
  for (let i = openAt; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  throw new Error("Unbalanced benchmarks object in models.ts");
}

export function replaceBenchmarksObject(region, benches) {
  const benchAt = region.search(/\n    benchmarks:\s*/);
  if (benchAt < 0) throw new Error("Could not find benchmarks property in model region");
  const openAt = region.indexOf("{", benchAt);
  if (openAt < 0) throw new Error("Could not find benchmarks object");
  const closeAt = findMatchingBrace(region, openAt);
  const entries = Object.entries(benches);
  const body =
    entries.length === 0
      ? "{}"
      : `{\n      ${entries
          .map(([id, value]) => `${formatBenchKey(id)}: ${formatNumber(value)},`)
          .join("\n      ")}\n    }`;
  return `${region.slice(0, openAt)}${body}${region.slice(closeAt + 1)}`;
}

function patchBenchmarks(region, cells) {
  const benchAt = region.search(/\n    benchmarks:\s*/);
  if (benchAt < 0) throw new Error("Could not find benchmarks property in model region");
  const openAt = region.indexOf("{", benchAt);
  if (openAt < 0) throw new Error("Could not find benchmarks object");
  const closeAt = findMatchingBrace(region, openAt);
  let body = region.slice(openAt, closeAt + 1);

  const inserts = [];
  for (const cell of cells) {
    const key = benchKeyPattern(cell.benchmarkId);
    const valueRe = new RegExp(`(${escapeRegExp(key)}\\s*:\\s*)(-?\\d+(?:\\.\\d+)?)`);
    if (valueRe.test(body)) {
      body = body.replace(valueRe, `$1${formatNumber(cellValue(cell))}`);
    } else {
      inserts.push(cell);
    }
  }

  if (inserts.length > 0) {
    const lines = inserts.map(
      (cell) =>
        `${formatBenchKey(cell.benchmarkId)}: ${formatNumber(cellValue(cell))},`
    );
    if (/^\{\s*\}$/.test(body)) {
      body = `{\n      ${lines.join("\n      ")}\n    }`;
    } else {
      const innerClose = body.lastIndexOf("}");
      const before = body.slice(0, innerClose).replace(/\s*$/, "");
      const needsComma = /,\s*$/.test(before) ? "" : ",";
      body = `${before}${needsComma}\n      ${lines.join("\n      ")}\n    }`;
    }
  }

  return `${region.slice(0, openAt)}${body}${region.slice(closeAt + 1)}`;
}

export function spliceModelsTs(source, cells) {
  const bySlug = new Map();
  for (const cell of cells) {
    if (!bySlug.has(cell.slug)) bySlug.set(cell.slug, []);
    bySlug.get(cell.slug).push(cell);
  }

  let next = source;
  for (const [slug, slugCells] of bySlug) {
    const region = findModelRegion(next, slug);
    const patched = patchBenchmarks(region.text, slugCells);
    if (patched === region.text) continue;
    next = `${next.slice(0, region.start)}${patched}${next.slice(region.end)}`;
  }
  return next;
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function bumpAsOf(filePath, today, pattern, replacement) {
  const source = fs.readFileSync(filePath, "utf8");
  const next = source.replace(pattern, replacement);
  if (next === source && !pattern.test(source)) {
    throw new Error(`Failed to bump asOf in ${filePath}`);
  }
  fs.writeFileSync(filePath, next);
}

function updateExactChecks(source, cells) {
  let next = source;
  const updated = [];
  for (const cell of cells) {
    if (cell.oldValue === undefined) continue;
    const escapedSlug = cell.slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escapedId = cell.benchmarkId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const oldForms = [
      formatNumber(cell.oldValue),
      String(cell.oldValue),
      cell.oldValue.toFixed(1),
    ];
    const uniqueOld = [...new Set(oldForms)];
    for (const oldText of uniqueOld) {
      const re = new RegExp(
        `(exact\\("${escapedSlug}", "benchmarks\\.${escapedId}", )${oldText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\))`
      );
      if (re.test(next)) {
        next = next.replace(re, `$1${formatNumber(cellValue(cell))}$2`);
        updated.push(
          `${cell.slug}/${cell.benchmarkId} ${oldText} -> ${formatNumber(cellValue(cell))}`
        );
        break;
      }
    }
  }
  return { source: next, updated };
}

export function expandWithAliases(proposals, models) {
  const bySlug = Object.fromEntries(models.map((model) => [model.slug, model]));
  const expanded = [];
  for (const proposal of proposals) {
    expanded.push(proposal);
    const aliases = models.filter((model) => model.benchmarkAliasOf === proposal.slug);
    for (const alias of aliases) {
      expanded.push({
        ...proposal,
        slug: alias.slug,
        oldValue: alias.benchmarks?.[proposal.benchmarkId],
        kind: alias.benchmarks?.[proposal.benchmarkId] === undefined ? "add" : "update",
        protocol: `Inherited from ${bySlug[proposal.slug]?.name ?? proposal.slug}.`,
        aliasOf: proposal.slug,
      });
    }
  }
  return expanded;
}

function assertOnlyIntendedChanges(before, after, cells) {
  const intended = new Map(
    cells.map((cell) => [`${cell.slug}/${cell.benchmarkId}`, cellValue(cell)])
  );
  const beforeBySlug = Object.fromEntries(before.map((model) => [model.slug, model]));
  if (after.length !== before.length) {
    throw new Error("apply refused: model count changed");
  }
  for (const model of after) {
    const prev = beforeBySlug[model.slug];
    if (!prev) throw new Error(`apply refused: unexpected model ${model.slug}`);
    const prevBenches = prev.benchmarks ?? {};
    const nextBenches = model.benchmarks ?? {};
    for (const id of new Set([...Object.keys(prevBenches), ...Object.keys(nextBenches)])) {
      const key = `${model.slug}/${id}`;
      if (prevBenches[id] === nextBenches[id]) continue;
      if (!intended.has(key)) {
        throw new Error(`apply refused: unintended change at ${key}`);
      }
      if (nextBenches[id] !== intended.get(key)) {
        throw new Error(
          `apply refused: ${key} became ${nextBenches[id]}, expected ${intended.get(key)}`
        );
      }
    }
  }
}

export async function applyProposals(proposals, { today, models }) {
  const cells = expandWithAliases(proposals, models);
  const modelsSource = fs.readFileSync(MODELS_PATH, "utf8");
  const spliced = spliceModelsTs(modelsSource, cells);
  const tempPath = `${MODELS_PATH}.apply-tmp.ts`;
  fs.writeFileSync(tempPath, spliced);
  try {
    const after = load(tempPath, "models");
    assertOnlyIntendedChanges(models, after, cells);
  } finally {
    fs.rmSync(tempPath, { force: true });
  }
  fs.writeFileSync(MODELS_PATH, spliced);

  const retained = JSON.parse(fs.readFileSync(RETAINED_PATH, "utf8"));
  retained.asOf = today;
  retained.cells ??= {};
  for (const cell of cells) {
    retained.cells[cell.slug] ??= {};
    retained.cells[cell.slug][cell.benchmarkId] = cellValue(cell);
  }
  writeJson(RETAINED_PATH, retained);

  const sources = JSON.parse(fs.readFileSync(SOURCES_PATH, "utf8"));
  for (const cell of cells) {
    sources[cell.slug] ??= {};
    sources[cell.slug][cell.benchmarkId] = {
      sourceUrl: cell.sourceUrl,
      evaluationDate: cell.evaluationDate,
      protocol: cell.protocol,
    };
  }
  writeJson(SOURCES_PATH, sources);

  const empty = JSON.parse(fs.readFileSync(EMPTY_PATH, "utf8"));
  empty.asOf = today;
  const gained = new Set(
    cells.filter((cell) => cell.kind === "add").map((cell) => cell.slug)
  );
  if (gained.size > 0) {
    empty.slugs = empty.slugs.filter((slug) => !gained.has(slug));
  }
  writeJson(EMPTY_PATH, empty);

  bumpAsOf(
    GENERATOR_PATH,
    today,
    /const asOf = "\d{4}-\d{2}-\d{2}"/,
    `const asOf = "${today}"`
  );
  bumpAsOf(
    MODELS_LIB_PATH,
    today,
    /DATA_FRESHNESS = "\d{4}-\d{2}-\d{2}"/,
    `DATA_FRESHNESS = "${today}"`
  );

  let verifySource = fs.readFileSync(VERIFY_PATH, "utf8");
  const asOfNext = verifySource.replace(
    /const asOf = "\d{4}-\d{2}-\d{2}"/,
    `const asOf = "${today}"`
  );
  verifySource = asOfNext;

  const reloaded = load(MODELS_PATH, "models");
  const scoreCount = reloaded.reduce(
    (total, model) => total + Object.keys(model.benchmarks ?? {}).length,
    0
  );
  const scoreNext = verifySource.replace(
    /scoreCount === \d+/,
    `scoreCount === ${scoreCount}`
  );
  if (
    scoreNext === verifySource &&
    !verifySource.includes(`scoreCount === ${scoreCount}`)
  ) {
    throw new Error("Failed to rewrite scoreCount in verify-data.mjs");
  }
  verifySource = scoreNext.replace(
    /expected \d+ audited benchmark cells/,
    `expected ${scoreCount} audited benchmark cells`
  );

  const exactResult = updateExactChecks(verifySource, cells);
  verifySource = exactResult.source;
  fs.writeFileSync(VERIFY_PATH, verifySource);

  const generated = spawnSync(process.execPath, [GENERATOR_PATH], {
    encoding: "utf8",
  });
  if (generated.status !== 0) {
    throw new Error(
      `generate-benchmark-evidence failed:\n${generated.stderr || generated.stdout || "unknown error"}`
    );
  }

  const verified = spawnSync(process.execPath, [VERIFY_PATH], { encoding: "utf8" });
  return {
    scoreCount,
    exactUpdated: exactResult.updated,
    verifyStatus: verified.status,
    verifyOutput: `${verified.stdout || ""}${verified.stderr || ""}`.trim(),
    applied: cells,
  };
}

export function resolveFromPath(fromPath) {
  const candidates = [
    fromPath,
    path.resolve(fromPath),
    path.resolve("scripts/update-benchmarks", fromPath),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(`Proposal file not found: ${fromPath}`);
}
