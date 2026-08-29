import fs from "node:fs";
import { load } from "./update-benchmarks/load.mjs";

const asOf = "2026-08-29";
const checkOnly = process.argv.includes("--check");

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value &&
    value <= asOf
  );
}

const models = load("src/data/models.ts", "models");
const auditedValues = JSON.parse(
  fs.readFileSync("scripts/benchmark-retained-values.json", "utf8")
);
if (auditedValues.asOf !== asOf) {
  throw new Error(
    `Retained-value manifest is dated ${auditedValues.asOf}; expected ${asOf}`
  );
}
const auditedCells = auditedValues.cells ?? {};

const sourceOverrides = JSON.parse(
  fs.readFileSync("scripts/benchmark-sources.json", "utf8")
);

const cells = {};
for (const model of models) {
  cells[model.slug] = {};
  for (const [id, value] of Object.entries(model.benchmarks ?? {})) {
    const auditedValue = auditedCells[model.slug]?.[id];
    if (!Number.isFinite(auditedValue)) {
      throw new Error(
        `Missing independently reviewed value for retained cell ${model.slug}/${id}`
      );
    }
    if (auditedValue !== value) {
      throw new Error(
        `Catalog value differs from independently reviewed value for ${model.slug}/${id}`
      );
    }
    const override = sourceOverrides[model.slug]?.[id];
    if (
      !override?.sourceUrl ||
      !override?.evaluationDate ||
      !override?.protocol
    ) {
      throw new Error(
        `Missing explicit evidence override for retained cell ${model.slug}/${id}`
      );
    }
    if (!isIsoDate(override.evaluationDate)) {
      throw new Error(
        `Invalid evaluation date for retained cell ${model.slug}/${id}`
      );
    }
    if (/\bsubtask\b|not the full benchmark/i.test(override.protocol)) {
      throw new Error(
        `Non-comparable protocol note for retained cell ${model.slug}/${id}`
      );
    }
    cells[model.slug][id] = {
      value: auditedValue,
      sourceUrl: override.sourceUrl,
      checkedOn: asOf,
      protocol: override.protocol,
      evaluationDate: override.evaluationDate,
    };
  }
}

for (const [slug, values] of Object.entries(auditedCells)) {
  if (!cells[slug]) {
    throw new Error(`Retained-value manifest references unknown model ${slug}`);
  }
  for (const [id, value] of Object.entries(values)) {
    if (cells[slug][id]?.value !== value) {
      throw new Error(
        `Retained-value manifest references unretained cell ${slug}/${id}`
      );
    }
  }
}

for (const [slug, overrides] of Object.entries(sourceOverrides)) {
  if (!cells[slug]) {
    throw new Error(`Evidence override references unknown model ${slug}`);
  }
  for (const id of Object.keys(overrides)) {
    if (!cells[slug][id]) {
      throw new Error(`Evidence override references unretained cell ${slug}/${id}`);
    }
  }
}

const output = `${JSON.stringify(
  {
    asOf,
    policy:
      "Every retained numeric cell requires an independently reviewed value plus an explicit source URL, evaluation date, and protocol note. The ledger does not make cross-harness results comparable.",
    cells,
  },
  null,
  2
)}\n`;
const ledgerPath = "scripts/benchmark-evidence.json";

if (checkOnly) {
  const existing = fs.readFileSync(ledgerPath, "utf8");
  if (existing !== output) {
    console.error(`${ledgerPath} is stale; run npm run generate:evidence`);
    process.exitCode = 1;
  }
} else {
  fs.writeFileSync(ledgerPath, output);
}
