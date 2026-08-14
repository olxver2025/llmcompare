import type { Metadata } from "next";
import Link from "next/link";
import { BENCHMARK_CATEGORIES, BENCHMARKS } from "@/data/benchmarks";
import type { BenchmarkId } from "@/data/types";
import { BenchmarkDisclosure } from "@/components/benchmark-disclosure";
import {
  compositeEligibleCategories,
  formatZScore,
  getLlmcompareIndex,
  LLMCOMPARE_INDEX,
  LLMCOMPARE_INDEX_BENCHMARK_TOTAL,
  MIN_COMPOSITE_BENCHMARKS,
} from "@/lib/benchmark-composite";
import {
  DATA_FRESHNESS,
  formatScore,
  getBenchmarkScoredCount,
  getTopModelsByBenchmark,
} from "@/lib/models";

export const metadata: Metadata = {
  title: "Benchmarks",
  description:
    "What each LLM benchmark measures, and the top 10 models on MMLU-Pro, GPQA, SWE-bench, LiveCodeBench, LMArena Elo, and more.",
};

function scoreLabel(id: BenchmarkId, score: number): string {
  const meta = BENCHMARKS[id];
  const formatted = formatScore(id, score);
  return meta.unit === "percent" ? `${formatted}%` : formatted;
}

export default function BenchmarksPage() {
  const compositeCategoryIds = new Set(
    compositeEligibleCategories().map((cat) => cat.id)
  );
  const indexRows = getLlmcompareIndex();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
      <section className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Benchmarks
        </h1>
        <p className="mt-3 text-base text-muted-foreground text-pretty">
          What each evaluation measures, and the top models in this catalog by
          that score. Rankings use reported numbers only — models without a
          score for a benchmark are omitted. Data as of{" "}
          <time dateTime={DATA_FRESHNESS} className="font-mono tabular-nums">
            {DATA_FRESHNESS}
          </time>
          .
        </p>
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link
            href="/"
            className="font-medium text-open underline-offset-4 hover:underline"
          >
            Full catalog
          </Link>
          <Link
            href="/compare"
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Compare two models
          </Link>
        </p>
      </section>

      <nav
        aria-label="Benchmark categories"
        className="mb-10 flex flex-wrap gap-x-4 gap-y-2 border-t border-foreground/20 pt-4 text-sm"
      >
        <a
          href={`#${LLMCOMPARE_INDEX.id}`}
          className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {LLMCOMPARE_INDEX.name}
        </a>
        {BENCHMARK_CATEGORIES.map((cat) => (
          <a
            key={cat.id}
            href={`#${cat.id}`}
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {cat.label}
          </a>
        ))}
      </nav>

      <section className="mb-16 space-y-10">
        <div className="section-rule flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="text-xl font-semibold tracking-tight">
            LLMcompare only
          </h2>
          <Link
            href={LLMCOMPARE_INDEX.href}
            className="text-sm text-open underline-offset-4 hover:underline"
          >
            Full ranking →
          </Link>
        </div>

        <BenchmarkDisclosure
          id={LLMCOMPARE_INDEX.id}
          name={LLMCOMPARE_INDEX.name}
          description={LLMCOMPARE_INDEX.description}
          detailHref={LLMCOMPARE_INDEX.href}
          scored={indexRows.length}
          defaultOpen
          rows={indexRows.slice(0, 10).map((row, i) => ({
            slug: row.model.slug,
            name: row.model.name,
            organization: row.model.organization,
            openSource: row.model.openSource,
            rank: i + 1,
            scoreLabel: `${formatZScore(row.zScore)} · ${row.benchmarkCount}/${LLMCOMPARE_INDEX_BENCHMARK_TOTAL}`,
          }))}
        />
        <p className="max-w-3xl pl-6 text-sm text-muted-foreground text-pretty">
          Coverage differs between models: a model needs{" "}
          {MIN_COMPOSITE_BENCHMARKS} published eligible scores to appear at
          all. The index z-scores against models from the past year, then
          averages over all {LLMCOMPARE_INDEX_BENCHMARK_TOTAL} well-covered
          benches — missing scores contribute 0. The count next to each score
          shows how many of those benches the model actually has. The
          published benchmarks below are the source of truth.
        </p>
      </section>

      <div className="space-y-16">
        {BENCHMARK_CATEGORIES.map((cat) => (
          <section
            key={cat.id}
            id={cat.id}
            className="scroll-mt-16 space-y-10"
          >
            <div className="section-rule flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 className="text-xl font-semibold tracking-tight">
                {cat.label}
              </h2>
              {compositeCategoryIds.has(cat.id) ? (
                <Link
                  href={`/benchmarks/category/${cat.id}`}
                  className="text-sm text-open underline-offset-4 hover:underline"
                >
                  Composite ranking →
                </Link>
              ) : null}
            </div>

            {cat.ids.map((id) => {
              const meta = BENCHMARKS[id];
              const top = getTopModelsByBenchmark(id, 10);
              const scored = getBenchmarkScoredCount(id);

              return (
                <BenchmarkDisclosure
                  key={id}
                  id={id}
                  name={meta.name}
                  description={meta.description}
                  sourceUrl={meta.sourceUrl}
                  scored={scored}
                  rows={top.map(({ model, score, rank }) => ({
                    slug: model.slug,
                    name: model.name,
                    organization: model.organization,
                    openSource: model.openSource,
                    rank,
                    scoreLabel: scoreLabel(id, score),
                  }))}
                />
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}
