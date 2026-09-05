import type { BenchmarkId, BenchmarkMeta, Model } from "@/data/types";
import {
  BENCHMARK_CATEGORIES,
  BENCHMARK_IDS,
  BENCHMARKS,
} from "@/data/benchmarks";
import { DATA_FRESHNESS, getAllModels } from "@/lib/models";
import {
  COMPOSITE_PSEUDOCOUNT_RATE,
  compositePseudocount,
  shrinkCompositeZ,
} from "@/lib/composite-shrink";

export {
  COMPOSITE_PSEUDOCOUNT_RATE,
  compositePseudocount,
  shrinkCompositeZ,
};

export type CategoryId = BenchmarkMeta["category"];

/** Minimum published scores a model needs in a battery to receive a composite. */
export const MIN_COMPOSITE_BENCHMARKS = 3;

/**
 * Benchmarks with fewer scored *peer* models than this are left out of every
 * composite. Thin samples make z-scores explode and are not comparable.
 */
export const MIN_BENCHMARK_MODELS = 10;

/** Z-scores are taken against models released in this many months. */
export const COMPOSITE_PEER_MONTHS = 12;

/** Percent-scale benches with less spread than this among peers are treated as saturated. */
export const MIN_PERCENT_IQR = 8;

/** Elo benches with less spread than this among peers are treated as saturated. */
export const MIN_ELO_IQR = 40;

export function compositePeerCutoff(
  freshness = DATA_FRESHNESS,
  months = COMPOSITE_PEER_MONTHS
): string {
  const [year, month, day] = freshness.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCMonth(date.getUTCMonth() - months);
  return date.toISOString().slice(0, 10);
}

export function getCompositePeerModels(): Model[] {
  const cutoff = compositePeerCutoff();
  return getAllModels().filter(
    (model) => !model.benchmarkAliasOf && model.releaseDate >= cutoff
  );
}

function scoredValues(models: Model[], id: BenchmarkId): number[] {
  return models
    .map((model) => model.benchmarks[id])
    .filter((score): score is number => score !== undefined);
}

function interquartileRange(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const at = (p: number) => {
    const i = (sorted.length - 1) * p;
    const lo = Math.floor(i);
    const hi = Math.ceil(i);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
  };
  return at(0.75) - at(0.25);
}

function isDiscriminating(id: BenchmarkId, scores: number[]): boolean {
  if (scores.length < MIN_BENCHMARK_MODELS) return false;
  const unit = BENCHMARKS[id].unit;
  const spread = interquartileRange(scores);
  if (unit === "percent") return spread >= MIN_PERCENT_IQR;
  if (unit === "elo") return spread >= MIN_ELO_IQR;
  return true;
}

/**
 * Published composite indices (the Artificial Analysis Intelligence Index) are
 * themselves weighted averages of benchmarks that sit in the same battery, so
 * feeding one into a composite would count its components twice. They are
 * ranked on their own benchmark page instead.
 */
function isCompositeInput(id: BenchmarkId): boolean {
  return BENCHMARKS[id].unit !== "index";
}

export function getCompositeBatteryIds(ids: BenchmarkId[]): BenchmarkId[] {
  const peers = getCompositePeerModels();
  return ids.filter(
    (id) => isCompositeInput(id) && isDiscriminating(id, scoredValues(peers, id))
  );
}

/** Categories with enough well-covered benchmarks to form a composite. */
export function compositeEligibleCategories() {
  return BENCHMARK_CATEGORIES.filter(
    (cat) =>
      getCompositeBatteryIds(cat.ids).length >= MIN_COMPOSITE_BENCHMARKS
  );
}

export function getCategoryBenchmarkIds(categoryId: CategoryId): BenchmarkId[] {
  return BENCHMARK_CATEGORIES.find((cat) => cat.id === categoryId)?.ids ?? [];
}

export function getCategoryBatteryIds(categoryId: CategoryId): BenchmarkId[] {
  return getCompositeBatteryIds(getCategoryBenchmarkIds(categoryId));
}

export type CompositeContribution = {
  id: BenchmarkId;
  score: number;
  z: number;
};

export type CategoryCompositeRow = {
  model: Model;
  zScore: number;
  benchmarkCount: number;
  contributions: CompositeContribution[];
};

/**
 * Composite ranking within one benchmark category. Each eligible benchmark's
 * scores are z-score normalized against models released in the last
 * {@link COMPOSITE_PEER_MONTHS} months. The composite is a shrunken mean:
 * sum of published z-scores over (n + k), with k dummy average observations
 * so thin coverage still cannot dominate. Saturated and thinly scored
 * benches are excluded.
 *
 * This is a derived statistic, not a sourced benchmark score.
 */
export function getCategoryComposite(
  categoryId: CategoryId,
  minBenchmarks = MIN_COMPOSITE_BENCHMARKS
): CategoryCompositeRow[] {
  return computeComposite(getCategoryBatteryIds(categoryId), minBenchmarks);
}

function computeComposite(
  ids: BenchmarkId[],
  minBenchmarks: number
): CategoryCompositeRow[] {
  if (ids.length < minBenchmarks) return [];

  const peers = getCompositePeerModels();
  const stats = new Map<BenchmarkId, { mean: number; std: number }>();
  for (const id of ids) {
    const scores = scoredValues(peers, id);
    if (!isDiscriminating(id, scores)) continue;
    const mean = scores.reduce((sum, v) => sum + v, 0) / scores.length;
    const variance =
      scores.reduce((sum, v) => sum + (v - mean) ** 2, 0) / scores.length;
    stats.set(id, { mean, std: Math.sqrt(variance) || 1 });
  }

  const batterySize = stats.size;
  if (batterySize < minBenchmarks) return [];

  const rows: CategoryCompositeRow[] = [];
  for (const model of getAllModels()) {
    if (model.benchmarkAliasOf) continue;

    const contributions: CompositeContribution[] = [];
    for (const id of ids) {
      const score = model.benchmarks[id];
      const stat = stats.get(id);
      if (score === undefined || !stat) continue;
      const higher = BENCHMARKS[id].higherIsBetter;
      const z = higher
        ? (score - stat.mean) / stat.std
        : (stat.mean - score) / stat.std;
      contributions.push({ id, score, z });
    }
    if (contributions.length < minBenchmarks) continue;

    const zScore = shrinkCompositeZ(
      contributions.reduce((sum, c) => sum + c.z, 0),
      contributions.length,
      batterySize
    );
    rows.push({
      model,
      zScore,
      benchmarkCount: contributions.length,
      contributions,
    });
  }

  return rows.sort((a, b) => b.zScore - a.zScore);
}

export function formatZScore(z: number): string {
  const sign = z > 0 ? "+" : "";
  return `${sign}${z.toFixed(2)}`;
}

/**
 * The catalog-wide composite. This is an LLMcompare-computed index, not a
 * published benchmark: it has no external leaderboard, no evaluation harness,
 * and no source URL, and it exists only on this site.
 */
export const LLMCOMPARE_INDEX = {
  id: "llmcompare-index",
  name: "LLMcompare Index",
  shortName: "LC Index",
  href: "/benchmarks/llmcompare-index",
  description:
    "An LLMcompare-computed index, not a published benchmark. Eligible benches are z-scored against models released in the past year. The index is a shrunken mean of those z-scores — sum(z) / (published count + k), with k dummy average results — so a new model that is far above peers on every measured bench is not treated as average on the rest, while a short brochure set still cannot dominate. Beating a long tail of older models does not inflate the index. Saturated and thinly scored benches are left out. Models with fewer than three published eligible scores are unranked, and every contributing score stays visible with its own provenance.",
} as const;

export type LlmcompareIndexId = typeof LLMCOMPARE_INDEX.id;

export function getIndexBatteryIds(): BenchmarkId[] {
  return getCompositeBatteryIds(BENCHMARK_IDS);
}

/** Number of benchmarks the index draws on. */
export const LLMCOMPARE_INDEX_BENCHMARK_TOTAL = getIndexBatteryIds().length;

/**
 * Composite ranking across every eligible benchmark in the catalog. Same
 * battery-mean as {@link getCategoryComposite}. Coverage still varies —
 * `benchmarkCount` should stay visible wherever the index is shown.
 */
export function getLlmcompareIndex(
  minBenchmarks = MIN_COMPOSITE_BENCHMARKS
): CategoryCompositeRow[] {
  return computeComposite(getIndexBatteryIds(), minBenchmarks);
}

export type IndexScore = { zScore: number; benchmarkCount: number };

/**
 * Index lookup keyed by model slug, for charts and tables. Alias models resolve
 * to the canonical record's index so they can be plotted at their own price
 * without taking a second slot in the ranking.
 */
export function getLlmcompareIndexBySlug(
  minBenchmarks = MIN_COMPOSITE_BENCHMARKS
): Record<string, IndexScore> {
  const byCanonical = new Map<string, IndexScore>();
  for (const row of getLlmcompareIndex(minBenchmarks)) {
    byCanonical.set(row.model.slug, {
      zScore: row.zScore,
      benchmarkCount: row.benchmarkCount,
    });
  }

  const scores: Record<string, IndexScore> = {};
  for (const model of getAllModels()) {
    const source = byCanonical.get(model.benchmarkAliasOf ?? model.slug);
    if (source) scores[model.slug] = source;
  }
  return scores;
}
