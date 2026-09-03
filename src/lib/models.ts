import { models } from "@/data/models";
import { BENCHMARKS, BENCHMARK_IDS } from "@/data/benchmarks";
import type { BenchmarkId, Model } from "@/data/types";
import {
  decideOverallLead,
  QUALITY_COMPARABLE_ELO_BAND,
  type OverallBasis,
} from "@/lib/compare-scoring";
import { modelFamilyId, modelFamilyLabel } from "@/lib/model-family";

export { QUALITY_COMPARABLE_ELO_BAND, type OverallBasis };

export const DATA_FRESHNESS = "2026-09-03";

/** Illustrative chat workload used for cost estimates. */
export const WORKLOAD_TOKENS_IN = 1_000_000;
export const WORKLOAD_TOKENS_OUT = 250_000;

export function getAllModels(): Model[] {
  return models;
}

export function getModel(slug: string): Model | undefined {
  return models.find((m) => m.slug === slug);
}

export function getOrganizations(): string[] {
  return [...new Set(models.map((m) => m.organization))].sort();
}

export function getRelatedModels(model: Model, limit = 6): Model[] {
  const family = modelFamilyId(model);
  return models
    .filter((m) => m.slug !== model.slug && modelFamilyId(m) === family)
    .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))
    .slice(0, limit);
}

export function formatModalities(m: Model): string {
  const inn = m.modalities.input.join(", ");
  const out = m.modalities.output.join(", ");
  return `${inn} → ${out}`;
}

export function formatSpeed(m: Model): string {
  const parts: string[] = [];
  if (m.speed?.tokensPerSec !== undefined) {
    parts.push(`${m.speed.tokensPerSec} tok/s`);
  }
  if (m.speed?.ttftSeconds !== undefined) {
    parts.push(`${m.speed.ttftSeconds}s TTFT`);
  }
  return parts.length > 0 ? parts.join(" · ") : "-";
}

export function formatLicense(m: Model): string {
  return m.license ?? (m.openSource ? "Open" : "Proprietary");
}

export function formatApiAccess(m: Model): string {
  if (!m.pricing) return "No primary API price listed";
  return m.pricing.provider;
}

export function workloadCost(m: Model): number | undefined {
  if (!m.pricing) return undefined;
  return (
    (WORKLOAD_TOKENS_IN / 1e6) * m.pricing.inputPer1M +
    (WORKLOAD_TOKENS_OUT / 1e6) * m.pricing.outputPer1M
  );
}

/** Off-peak workload cost for models with time-of-day pricing. */
export function offPeakWorkloadCost(m: Model): number | undefined {
  if (!m.pricing?.offPeak) return undefined;
  return (
    (WORKLOAD_TOKENS_IN / 1e6) * m.pricing.offPeak.inputPer1M +
    (WORKLOAD_TOKENS_OUT / 1e6) * m.pricing.offPeak.outputPer1M
  );
}

/** 1-based rank among models with a defined numeric value (higher/lower as specified). */
export function getSpecRank(
  value: number | undefined,
  values: (number | undefined)[],
  higherIsBetter = true
): number | undefined {
  if (value === undefined) return undefined;
  const scored = values
    .filter((v): v is number => v !== undefined)
    .sort((a, b) => (higherIsBetter ? b - a : a - b));
  const idx = scored.indexOf(value);
  return idx === -1 ? undefined : idx + 1;
}

export { modelFamilyLabel };

/** Canonical compare slug: alphabetical by model slug to avoid duplicates. */
export function compareSlug(a: string, b: string): string {
  const [first, second] = [a, b].sort((x, y) => x.localeCompare(y));
  return `${first}-vs-${second}`;
}

export function parseCompareSlug(
  slug: string
): { a: string; b: string } | null {
  const idx = slug.indexOf("-vs-");
  if (idx <= 0) return null;
  const a = slug.slice(0, idx);
  const b = slug.slice(idx + 4);
  if (!a || !b || a === b) return null;
  return { a, b };
}

export function formatPrice(n: number | undefined): string {
  if (n === undefined) return "-";
  if (n === 0) return "$0";
  if (n < 0.01) return `$${n.toFixed(3)}`;
  if (n < 1) return `$${n.toFixed(2)}`;
  if (Number.isInteger(n)) return `$${n}`;
  return `$${n.toFixed(2)}`;
}

/** Format a rate pair as "peak / off-peak" when time-of-day pricing is present. */
export function formatRateWithOffPeak(
  peak: number | undefined,
  offPeak: number | undefined
): string {
  if (peak === undefined) return "-";
  if (offPeak === undefined) return formatPrice(peak);
  return `${formatPrice(peak)} / ${formatPrice(offPeak)}`;
}

export function formatPricePair(
  pricing: Model["pricing"] | undefined
): string {
  if (!pricing) return "-";
  const base = `${formatPrice(pricing.inputPer1M)} / ${formatPrice(pricing.outputPer1M)}`;
  if (!pricing.offPeak) return base;
  return `${base} peak · ${formatPrice(pricing.offPeak.inputPer1M)} / ${formatPrice(pricing.offPeak.outputPer1M)} off-peak`;
}

export function formatContext(tokens: number): string {
  if (tokens >= 1_000_000) {
    const m = tokens / 1_000_000;
    return Number.isInteger(m) ? `${m}M` : `${m.toFixed(1)}M`;
  }
  if (tokens >= 1_000) {
    const k = tokens / 1_000;
    return Number.isInteger(k) ? `${k}K` : `${k.toFixed(0)}K`;
  }
  return String(tokens);
}

export function formatParams(
  parameters: Model["parameters"] | undefined
): string {
  if (!parameters?.total) return "-";
  const total = parameters.total;
  const totalStr =
    total >= 1000 ? `${(total / 1000).toFixed(1)}T` : `${total}B`;
  if (parameters.active) {
    return `${totalStr} (${parameters.active}B act.)`;
  }
  return totalStr;
}

export function formatScore(
  id: BenchmarkId,
  value: number | undefined
): string {
  if (value === undefined) return "—";
  const meta = BENCHMARKS[id];
  if (meta.unit === "elo") return Math.round(value).toLocaleString();
  if (value >= 10) return value.toFixed(1);
  return value.toFixed(1);
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function blendedPrice(m: Model): number | undefined {
  if (!m.pricing) return undefined;
  // 3:1 input:output blend common for chat workloads
  return m.pricing.inputPer1M * 0.75 + m.pricing.outputPer1M * 0.25;
}

/** Off-peak blended price for models with time-of-day pricing. */
export function offPeakBlendedPrice(m: Model): number | undefined {
  if (!m.pricing?.offPeak) return undefined;
  return (
    m.pricing.offPeak.inputPer1M * 0.75 +
    m.pricing.offPeak.outputPer1M * 0.25
  );
}

function benchmarkOwners(id: BenchmarkId): Model[] {
  return models.filter(
    (model) =>
      !model.benchmarkAliasOf && model.benchmarks[id] !== undefined
  );
}

export function getBenchmarkRank(
  model: Model,
  id: BenchmarkId
): number | undefined {
  const score = model.benchmarks[id];
  if (score === undefined) return undefined;
  const higher = BENCHMARKS[id].higherIsBetter;
  const canonical = model.benchmarkAliasOf
    ? getModel(model.benchmarkAliasOf)
    : model;
  const scored = benchmarkOwners(id)
    .map((m) => m.benchmarks[id])
    .filter((v): v is number => v !== undefined)
    .sort((a, b) => (higher ? b - a : a - b));
  const canonicalScore = canonical?.benchmarks[id] ?? score;
  return scored.indexOf(canonicalScore) + 1;
}

export function getRankedModelsByBenchmark(
  id: BenchmarkId
): { model: Model; score: number; rank: number }[] {
  const higher = BENCHMARKS[id].higherIsBetter;
  return benchmarkOwners(id)
    .map((model) => {
      const score = model.benchmarks[id];
      return score === undefined ? null : { model, score };
    })
    .filter((row): row is { model: Model; score: number } => row !== null)
    .sort((a, b) => (higher ? b.score - a.score : a.score - b.score))
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

export function getTopModelsByBenchmark(
  id: BenchmarkId,
  limit = 10
): { model: Model; score: number; rank: number }[] {
  return getRankedModelsByBenchmark(id).slice(0, limit);
}

export function getBenchmarkScoredCount(id: BenchmarkId): number {
  return benchmarkOwners(id).length;
}

export function sharedBenchmarks(a: Model, b: Model): BenchmarkId[] {
  return BENCHMARK_IDS.filter(
    (id) => a.benchmarks[id] !== undefined && b.benchmarks[id] !== undefined
  );
}

export function generateVerdict(a: Model, b: Model): string {
  const breakdown = compareBreakdown(a, b);
  const parts = breakdown.highlights;
  if (parts.length === 0) {
    return `${a.name} and ${b.name} are closely matched on the overlapping metrics we have.`;
  }
  if (parts.length === 1) return parts[0] + ".";
  if (parts.length === 2) return `${parts[0]}; ${parts[1]}.`;
  return `${parts[0]}; ${parts[1]}; ${parts[2]}.`;
}

export type CompareRow = {
  id: string;
  label: string;
  category:
    | "spec"
    | "pricing"
    | "speed"
    | "reasoning"
    | "coding"
    | "arena"
    | "agent"
    | "tool"
    | "math";
  left: string;
  right: string;
  leftNum?: number;
  rightNum?: number;
  higherIsBetter?: boolean;
  deltaLabel?: string;
  winner?: "a" | "b" | "tie" | "na";
};

export type CompareBreakdown = {
  highlights: string[];
  /** Headline win tally used for overall lead (excludes price/speed unless quality is comparable). */
  wins: { a: number; b: number; ties: number };
  overallLead: "a" | "b" | null;
  overallBasis: OverallBasis;
  categoryWins: Record<
    string,
    { a: number; b: number; label: string }
  >;
  rows: CompareRow[];
  estimatedCost: {
    tokensIn: number;
    tokensOut: number;
    a?: number;
    b?: number;
    cheaper?: "a" | "b" | "tie";
    ratio?: number;
  };
};

const QUALITY_CATEGORIES = new Set<CompareRow["category"]>([
  "reasoning",
  "coding",
  "arena",
  "agent",
  "tool",
  "math",
]);
const SPEC_CATEGORIES = new Set<CompareRow["category"]>(["spec"]);
const VALUE_CATEGORIES = new Set<CompareRow["category"]>(["pricing", "speed"]);

function tallyRows(
  rows: CompareRow[],
  categories: Set<CompareRow["category"]>
): { a: number; b: number; ties: number } {
  const subset = rows.filter(
    (r) =>
      categories.has(r.category) &&
      (r.winner === "a" || r.winner === "b" || r.winner === "tie")
  );
  return {
    a: subset.filter((r) => r.winner === "a").length,
    b: subset.filter((r) => r.winner === "b").length,
    ties: subset.filter((r) => r.winner === "tie").length,
  };
}

/** Maps compare rows + models onto quality-first overall lead scoring. */
export function scoreOverallLead(
  rows: CompareRow[],
  a: Model,
  b: Model
): {
  lead: "a" | "b" | null;
  basis: OverallBasis;
  wins: { a: number; b: number; ties: number };
} {
  const quality = tallyRows(rows, QUALITY_CATEGORIES);
  const specs = tallyRows(rows, SPEC_CATEGORIES);
  const value = tallyRows(rows, VALUE_CATEGORIES);
  const shared = sharedBenchmarks(a, b);
  const coverageA = BENCHMARK_IDS.filter(
    (id) => a.benchmarks[id] !== undefined
  ).length;
  const coverageB = BENCHMARK_IDS.filter(
    (id) => b.benchmarks[id] !== undefined
  ).length;

  const { lead, basis, includeValue } = decideOverallLead({
    quality,
    specs,
    value,
    sharedBenchmarkCount: shared.length,
    coverageA,
    coverageB,
    eloA: a.benchmarks["lmarena-elo"],
    eloB: b.benchmarks["lmarena-elo"],
  });

  const overallRows = rows.filter((r) => {
    if (r.winner !== "a" && r.winner !== "b" && r.winner !== "tie") return false;
    if (QUALITY_CATEGORIES.has(r.category) || SPEC_CATEGORIES.has(r.category)) {
      return true;
    }
    return includeValue && VALUE_CATEGORIES.has(r.category);
  });

  return {
    lead,
    basis,
    wins: {
      a: overallRows.filter((r) => r.winner === "a").length,
      b: overallRows.filter((r) => r.winner === "b").length,
      ties: overallRows.filter((r) => r.winner === "tie").length,
    },
  };
}

function rowWinner(
  left?: number,
  right?: number,
  higherIsBetter = true
): "a" | "b" | "tie" | "na" {
  if (left === undefined || right === undefined) return "na";
  if (left === right) return "tie";
  const leftWins = higherIsBetter ? left > right : left < right;
  return leftWins ? "a" : "b";
}

function formatDelta(
  left?: number,
  right?: number,
  opts?: { unit?: "percent" | "elo" | "price" | "raw"; higherIsBetter?: boolean }
): string | undefined {
  if (left === undefined || right === undefined) return undefined;
  if (left === right) return "tie";
  const diff = left - right;
  const abs = Math.abs(diff);
  const unit = opts?.unit ?? "raw";
  let mag: string;
  if (unit === "elo") mag = `${abs.toFixed(0)} Elo`;
  else if (unit === "price") mag = formatPrice(abs);
  else if (unit === "percent") mag = `${abs.toFixed(1)} pts`;
  else if (abs >= 1000) mag = formatContext(Math.round(abs));
  else mag = abs >= 10 ? abs.toFixed(0) : abs.toFixed(2);

  const aLeads =
    (opts?.higherIsBetter ?? true) ? left > right : left < right;
  return `${aLeads ? "A" : "B"} +${mag}`;
}

export function compareBreakdown(a: Model, b: Model): CompareBreakdown {
  const rows: CompareRow[] = [];

  const push = (row: Omit<CompareRow, "winner" | "deltaLabel"> & { deltaLabel?: string; unit?: "percent" | "elo" | "price" | "raw" }) => {
    const winner = rowWinner(row.leftNum, row.rightNum, row.higherIsBetter ?? true);
    const deltaLabel =
      row.deltaLabel ??
      formatDelta(row.leftNum, row.rightNum, {
        unit: row.unit,
        higherIsBetter: row.higherIsBetter,
      });
    rows.push({ ...row, winner, deltaLabel });
  };

  push({
    id: "context",
    label: "Context window",
    category: "spec",
    left: formatContext(a.contextWindow),
    right: formatContext(b.contextWindow),
    leftNum: a.contextWindow,
    rightNum: b.contextWindow,
    unit: "raw",
  });
  push({
    id: "max-output",
    label: "Max output",
    category: "spec",
    left: a.maxOutput ? formatContext(a.maxOutput) : "-",
    right: b.maxOutput ? formatContext(b.maxOutput) : "-",
    leftNum: a.maxOutput,
    rightNum: b.maxOutput,
  });
  push({
    id: "params",
    label: "Parameters",
    category: "spec",
    left: formatParams(a.parameters),
    right: formatParams(b.parameters),
    leftNum: a.parameters?.total,
    rightNum: b.parameters?.total,
  });
  push({
    id: "input-price",
    label: "Input $/1M",
    category: "pricing",
    left: formatPrice(a.pricing?.inputPer1M),
    right: formatPrice(b.pricing?.inputPer1M),
    leftNum: a.pricing?.inputPer1M,
    rightNum: b.pricing?.inputPer1M,
    higherIsBetter: false,
    unit: "price",
  });
  push({
    id: "output-price",
    label: "Output $/1M",
    category: "pricing",
    left: formatPrice(a.pricing?.outputPer1M),
    right: formatPrice(b.pricing?.outputPer1M),
    leftNum: a.pricing?.outputPer1M,
    rightNum: b.pricing?.outputPer1M,
    higherIsBetter: false,
    unit: "price",
  });
  const blendA = blendedPrice(a);
  const blendB = blendedPrice(b);
  push({
    id: "blended-price",
    label: "Blended $/1M (3∶1)",
    category: "pricing",
    left: blendA !== undefined ? formatPrice(blendA) : "-",
    right: blendB !== undefined ? formatPrice(blendB) : "-",
    leftNum: blendA,
    rightNum: blendB,
    higherIsBetter: false,
    unit: "price",
  });
  push({
    id: "toks",
    label: "tok/s",
    category: "speed",
    left: a.speed?.tokensPerSec?.toString() ?? "-",
    right: b.speed?.tokensPerSec?.toString() ?? "-",
    leftNum: a.speed?.tokensPerSec,
    rightNum: b.speed?.tokensPerSec,
  });
  push({
    id: "ttft",
    label: "TTFT (s)",
    category: "speed",
    left: a.speed?.ttftSeconds?.toString() ?? "-",
    right: b.speed?.ttftSeconds?.toString() ?? "-",
    leftNum: a.speed?.ttftSeconds,
    rightNum: b.speed?.ttftSeconds,
    higherIsBetter: false,
  });

  for (const id of BENCHMARK_IDS) {
    const meta = BENCHMARKS[id];
    push({
      id,
      label: meta.name,
      category: meta.category,
      left: formatScore(id, a.benchmarks[id]),
      right: formatScore(id, b.benchmarks[id]),
      leftNum: a.benchmarks[id],
      rightNum: b.benchmarks[id],
      unit: meta.unit === "elo" ? "elo" : "percent",
    });
  }

  const { lead: overallLead, basis: overallBasis, wins } = scoreOverallLead(
    rows,
    a,
    b
  );

  const categoryWins: CompareBreakdown["categoryWins"] = {};
  const categoryLabels: Record<CompareRow["category"], string> = {
    reasoning: "Reasoning",
    coding: "Coding",
    arena: "Arena",
    agent: "Agents",
    tool: "Tool use",
    math: "Math",
    pricing: "Pricing",
    speed: "Speed",
    spec: "Specs",
  };
  for (const cat of Object.keys(categoryLabels) as CompareRow["category"][]) {
    const subset = rows.filter((r) => r.category === cat && (r.winner === "a" || r.winner === "b"));
    if (subset.length === 0) continue;
    categoryWins[cat] = {
      a: subset.filter((r) => r.winner === "a").length,
      b: subset.filter((r) => r.winner === "b").length,
      label: categoryLabels[cat],
    };
  }

  const highlights: string[] = [];
  const coding = sharedBenchmarks(a, b).filter((id) => BENCHMARKS[id].category === "coding");
  const reasoning = sharedBenchmarks(a, b).filter((id) => BENCHMARKS[id].category === "reasoning");

  const tallyLead = (ids: BenchmarkId[]) => {
    let aw = 0;
    let bw = 0;
    for (const id of ids) {
      const av = a.benchmarks[id]!;
      const bv = b.benchmarks[id]!;
      if (av > bv) aw++;
      else if (bv > av) bw++;
    }
    if (aw === bw) return null;
    return aw > bw ? a : b;
  };

  const codingLead = tallyLead(coding);
  if (codingLead) {
    const margins = coding
      .map((id) => {
        const av = a.benchmarks[id]!;
        const bv = b.benchmarks[id]!;
        return { id, diff: Math.abs(av - bv), lead: av > bv ? a : b };
      })
      .filter((x) => x.lead === codingLead)
      .sort((x, y) => y.diff - x.diff);
    const top = margins[0];
    if (top) {
      highlights.push(
        `${codingLead.name} leads coding (widest gap: +${top.diff.toFixed(1)} on ${BENCHMARKS[top.id].shortName})`
      );
    } else {
      highlights.push(`${codingLead.name} leads on coding benchmarks`);
    }
  }

  const reasoningLead = tallyLead(reasoning);
  if (reasoningLead && reasoningLead !== codingLead) {
    highlights.push(`${reasoningLead.name} edges reasoning & knowledge`);
  } else if (reasoningLead && !codingLead) {
    highlights.push(`${reasoningLead.name} leads on reasoning benchmarks`);
  }

  if (a.benchmarks["lmarena-elo"] !== undefined && b.benchmarks["lmarena-elo"] !== undefined) {
    const av = a.benchmarks["lmarena-elo"]!;
    const bv = b.benchmarks["lmarena-elo"]!;
    if (Math.abs(av - bv) >= 3) {
      const lead = av > bv ? a : b;
      highlights.push(
        `${lead.name} ranks higher on LMArena (+${Math.abs(av - bv).toFixed(0)} Elo)`
      );
    }
  }

  // Capability / specs before price so verdict copy isn't dominated by cost alone.
  if (a.contextWindow !== b.contextWindow) {
    const longer = a.contextWindow > b.contextWindow ? a : b;
    const shorter = a.contextWindow > b.contextWindow ? b : a;
    const factor = longer.contextWindow / shorter.contextWindow;
    highlights.push(
      `${longer.name} offers ${factor >= 1.5 ? `~${factor.toFixed(1)}x ` : ""}larger context (${formatContext(longer.contextWindow)} vs ${formatContext(shorter.contextWindow)})`
    );
  }

  if (
    a.maxOutput !== undefined &&
    b.maxOutput !== undefined &&
    a.maxOutput !== b.maxOutput
  ) {
    const higher = a.maxOutput > b.maxOutput ? a : b;
    const lower = a.maxOutput > b.maxOutput ? b : a;
    const factor = higher.maxOutput! / lower.maxOutput!;
    if (factor >= 1.5) {
      highlights.push(
        `${higher.name} allows ~${factor.toFixed(1)}x more max output (${formatContext(higher.maxOutput!)} vs ${formatContext(lower.maxOutput!)})`
      );
    }
  }

  if (a.openSource !== b.openSource) {
    const open = a.openSource ? a : b;
    highlights.push(`${open.name} ships open weights (${open.license ?? "open"})`);
  }

  if (blendA !== undefined && blendB !== undefined && blendA > 0 && blendB > 0) {
    const cheaperModel = blendA < blendB ? a : b;
    const dearer = blendA < blendB ? b : a;
    const priceRatio = Math.max(blendA, blendB) / Math.min(blendA, blendB);
    if (priceRatio >= 1.15) {
      highlights.push(
        `${cheaperModel.name} is ~${priceRatio.toFixed(1)}x cheaper on a blended token basis than ${dearer.name}`
      );
    }
  }

  const tokensIn = WORKLOAD_TOKENS_IN;
  const tokensOut = WORKLOAD_TOKENS_OUT;
  const costA = workloadCost(a);
  const costB = workloadCost(b);
  let cheaper: "a" | "b" | "tie" | undefined;
  let ratio: number | undefined;
  if (costA !== undefined && costB !== undefined) {
    if (Math.abs(costA - costB) < 0.01) cheaper = "tie";
    else cheaper = costA < costB ? "a" : "b";
    ratio = Math.max(costA, costB) / Math.min(costA, costB);
  }

  return {
    highlights,
    wins,
    overallLead,
    overallBasis,
    categoryWins,
    rows,
    estimatedCost: { tokensIn, tokensOut, a: costA, b: costB, cheaper, ratio },
  };
}

/** Popular pairs to pre-generate at build time. */
export function popularComparePairs(): [string, string][] {
  const pairs: [string, string][] = [
    ["claude-opus-5", "gpt-5-6-sol"],
    ["claude-opus-5", "claude-fable-5"],
    ["claude-fable-5", "gpt-5-6-sol"],
    ["claude-opus-4-8", "gpt-5-5"],
    ["claude-opus-4-7", "gpt-5-4"],
    ["gemini-3-1-pro", "claude-opus-5"],
    ["gemini-3-1-pro", "gpt-5-6-sol"],
    ["grok-4-5", "claude-opus-5"],
    ["grok-4-5", "gpt-5-6-sol"],
    ["deepseek-v4-pro", "claude-sonnet-5"],
    ["deepseek-v4-pro", "gpt-5-6-terra"],
    ["kimi-k3", "claude-opus-5"],
    ["kimi-k3", "gpt-5-6-sol"],
    ["qwen3-8-max", "deepseek-v4-pro"],
    ["qwen3-8-max", "claude-opus-5"],
    ["qwen3-8-max", "kimi-k3"],
    ["llama-4-maverick", "deepseek-v4-pro"],
    ["gemini-3-6-flash", "gpt-5-6-luna"],
    ["claude-sonnet-5", "gpt-5-6-terra"],
    ["glm-5-2", "deepseek-v4-pro"],
    ["gpt-5", "claude-opus-4-5"],
    ["gemini-2-5-pro", "gpt-4-1"],
    ["mistral-large-3", "llama-4-maverick"],
    ["gpt-oss-120b", "llama-4-maverick"],
    ["claude-mythos-5", "claude-fable-5"],
    ["ernie-5-1", "qwen3-8-max"],
    ["composer-2-5", "claude-opus-5"],
    ["composer-2-5", "gpt-5-6-terra"],
    ["composer-2-5", "cursor-grok-4-5"],
    ["cursor-grok-4-5", "claude-opus-5"],
    ["cursor-grok-4-5", "grok-4-5"],
  ];
  return pairs.filter(([x, y]) => getModel(x) && getModel(y));
}
