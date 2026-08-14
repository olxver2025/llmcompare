import type { Model } from "@/data/types";
import { BENCHMARK_CATEGORIES, BENCHMARK_IDS, BENCHMARKS } from "@/data/benchmarks";
import {
  blendedPrice,
  formatContext,
  formatDate,
  formatLicense,
  formatModalities,
  formatParams,
  formatPrice,
  formatScore,
} from "@/lib/models";

/** Compare pages beyond this many models get hard to read side by side. */
export const MAX_MULTI_COMPARE = 6;

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  BENCHMARK_CATEGORIES.map((cat) => [cat.id, cat.label])
);

export type MultiCompareRow = {
  id: string;
  label: string;
  category: string;
  categoryLabel: string;
  values: string[];
  raw: (number | undefined)[];
  higherIsBetter: boolean;
  /** Indices of the leading model(s) for this row; empty when every scored value ties or fewer than 2 are scored. */
  bestIndices: number[];
};

function buildRow(
  id: string,
  label: string,
  category: string,
  categoryLabel: string,
  raw: (number | undefined)[],
  values: string[],
  higherIsBetter = true
): MultiCompareRow {
  const defined = raw.filter((v): v is number => v !== undefined);
  let bestIndices: number[] = [];
  if (defined.length > 1) {
    const best = higherIsBetter ? Math.max(...defined) : Math.min(...defined);
    bestIndices = raw
      .map((v, i) => (v === best ? i : -1))
      .filter((i) => i !== -1);
    if (bestIndices.length === defined.length) bestIndices = []; // full tie
  }
  return { id, label, category, categoryLabel, values, raw, higherIsBetter, bestIndices };
}

/** Spec/pricing/benchmark rows for an N-way (3+) comparison table. */
export function multiCompareRows(models: Model[]): MultiCompareRow[] {
  const rows: MultiCompareRow[] = [];

  rows.push(
    buildRow(
      "release",
      "Release",
      "identity",
      "Identity",
      models.map((m) => Date.parse(m.releaseDate)),
      models.map((m) => formatDate(m.releaseDate))
    )
  );
  rows.push(
    buildRow(
      "license",
      "License",
      "identity",
      "Identity",
      models.map(() => undefined),
      models.map((m) => formatLicense(m))
    )
  );
  rows.push(
    buildRow(
      "modalities",
      "Modalities",
      "identity",
      "Identity",
      models.map(() => undefined),
      models.map((m) => formatModalities(m))
    )
  );
  rows.push(
    buildRow(
      "parameters",
      "Parameters",
      "identity",
      "Identity",
      models.map(() => undefined),
      models.map((m) => formatParams(m.parameters))
    )
  );
  rows.push(
    buildRow(
      "context",
      "Context window",
      "spec",
      "Specs",
      models.map((m) => m.contextWindow),
      models.map((m) => formatContext(m.contextWindow))
    )
  );
  rows.push(
    buildRow(
      "maxOutput",
      "Max output",
      "spec",
      "Specs",
      models.map((m) => m.maxOutput),
      models.map((m) => (m.maxOutput ? formatContext(m.maxOutput) : "-"))
    )
  );
  rows.push(
    buildRow(
      "inputPrice",
      "Input $/1M",
      "pricing",
      "Pricing",
      models.map((m) => m.pricing?.inputPer1M),
      models.map((m) => formatPrice(m.pricing?.inputPer1M)),
      false
    )
  );
  rows.push(
    buildRow(
      "outputPrice",
      "Output $/1M",
      "pricing",
      "Pricing",
      models.map((m) => m.pricing?.outputPer1M),
      models.map((m) => formatPrice(m.pricing?.outputPer1M)),
      false
    )
  );
  rows.push(
    buildRow(
      "blendedPrice",
      "Blended $/1M",
      "pricing",
      "Pricing",
      models.map((m) => blendedPrice(m)),
      models.map((m) => formatPrice(blendedPrice(m))),
      false
    )
  );
  rows.push(
    buildRow(
      "tokensPerSec",
      "Speed (tok/s)",
      "speed",
      "Speed",
      models.map((m) => m.speed?.tokensPerSec),
      models.map((m) =>
        m.speed?.tokensPerSec !== undefined ? `${m.speed.tokensPerSec}` : "-"
      )
    )
  );

  for (const id of BENCHMARK_IDS) {
    const meta = BENCHMARKS[id];
    if (!models.some((m) => m.benchmarks[id] !== undefined)) continue;
    rows.push(
      buildRow(
        id,
        meta.shortName,
        meta.category,
        CATEGORY_LABELS[meta.category] ?? meta.category,
        models.map((m) => m.benchmarks[id]),
        models.map((m) => formatScore(id, m.benchmarks[id])),
        meta.higherIsBetter
      )
    );
  }

  return rows;
}

/** Stable render order for the grouped table. */
export const MULTI_COMPARE_GROUP_ORDER = [
  "identity",
  "spec",
  "pricing",
  "speed",
  ...BENCHMARK_CATEGORIES.map((c) => c.id),
];
