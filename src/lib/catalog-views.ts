import { BENCHMARK_CATEGORIES, BENCHMARKS } from "@/data/benchmarks";
import type { BenchmarkId } from "@/data/types";
import { LLMCOMPARE_INDEX } from "@/lib/benchmark-composite";

export const CATALOG_VIEWS = [
  { id: "overview", label: "Overview" },
  { id: "reasoning", label: "Reasoning" },
  { id: "coding", label: "Coding" },
  { id: "agents", label: "Agents" },
  { id: "value", label: "Value" },
  { id: "all", label: "All" },
] as const;

export type CatalogViewId = (typeof CATALOG_VIEWS)[number]["id"];

export const OVERVIEW_BENCHMARKS: BenchmarkId[] = [
  "lmarena-elo",
  "gpqa-diamond",
  "swe-bench-pro",
  "terminal-bench-4",
];

/** Headline benches for model-page snapshots; skip any the model has not published. */
export const HEADLINE_BENCHMARKS: BenchmarkId[] = [
  "lmarena-elo",
  "gpqa-diamond",
  "hle",
  "swe-bench-pro",
  "swe-bench-verified",
  "terminal-bench-4",
  "terminal-bench-2-1",
  "cursorbench",
  "aider-polyglot",
];

export type CatalogGroup = {
  id: string;
  label: string;
  ids: BenchmarkId[];
};

export function isCatalogViewId(value: string | null): value is CatalogViewId {
  return CATALOG_VIEWS.some((view) => view.id === value);
}

export function catalogGroups(view: CatalogViewId): CatalogGroup[] {
  if (view === "overview") {
    return [
      { id: "overview", label: "Overview", ids: OVERVIEW_BENCHMARKS },
    ];
  }
  if (view === "value") return [];
  if (view === "reasoning") {
    return BENCHMARK_CATEGORIES.filter(
      (cat) => cat.id === "reasoning" || cat.id === "math"
    );
  }
  if (view === "coding") {
    return BENCHMARK_CATEGORIES.filter((cat) => cat.id === "coding");
  }
  if (view === "agents") {
    return BENCHMARK_CATEGORIES.filter(
      (cat) => cat.id === "tool" || cat.id === "agent"
    );
  }
  return BENCHMARK_CATEGORIES.map((cat) => ({
    id: cat.id,
    label: cat.label,
    ids: cat.ids,
  }));
}

export function catalogBenchmarkIds(view: CatalogViewId): BenchmarkId[] {
  return catalogGroups(view).flatMap((group) => group.ids);
}

export function catalogShowsIndex(view: CatalogViewId): boolean {
  return view === "overview" || view === "value" || view === "all";
}

export function catalogShowsSpecs(view: CatalogViewId): boolean {
  return view === "overview" || view === "value" || view === "all";
}

export function catalogShowGroupHeaders(view: CatalogViewId): boolean {
  return catalogGroups(view).length > 1;
}

export function catalogDefaultSort(view: CatalogViewId): string {
  switch (view) {
    case "reasoning":
      return "gpqa-diamond";
    case "coding":
      return "swe-bench-pro";
    case "agents":
      return "tau-bench";
    case "value":
      return LLMCOMPARE_INDEX.id;
    default:
      return "lmarena-elo";
  }
}

export function catalogViewHint(view: CatalogViewId): string {
  switch (view) {
    case "overview":
      return "Short set: price, LC Index, Arena, GPQA, SWE-Pro, Terminal-Bench 4.";
    case "reasoning":
      return "Knowledge, contest math, and GPQA-style reasoning benches.";
    case "coding":
      return "Software engineering, terminal, and code-generation benches.";
    case "agents":
      return "Tool use, computer use, and agent-system evaluations.";
    case "value":
      return "Context, list price, LC Index, and speed — no individual benches.";
    default:
      return "Every benchmark column, grouped by category.";
  }
}

/** Subtle fill for better scores; missing values stay unshaded. */
export function heatStyle(
  value: number | undefined,
  values: number[],
  higherIsBetter: boolean
): { backgroundColor: string } | undefined {
  if (value === undefined || values.length < 2) return undefined;
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (!(max > min)) return undefined;
  const t = (value - min) / (max - min);
  const intensity = higherIsBetter ? t : 1 - t;
  const pct = Math.round(intensity * 18);
  if (pct < 3) return undefined;
  return {
    backgroundColor: `color-mix(in srgb, var(--open) ${pct}%, transparent)`,
  };
}

export function isKnownBenchmarkId(id: string): id is BenchmarkId {
  return id in BENCHMARKS;
}
