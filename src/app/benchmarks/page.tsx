import type { Metadata } from "next";
import Link from "next/link";
import { BENCHMARK_CATEGORIES, BENCHMARKS } from "@/data/benchmarks";
import type { BenchmarkId } from "@/data/types";
import { BenchmarkDisclosure } from "@/components/benchmark-disclosure";
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

      <div className="space-y-16">
        {BENCHMARK_CATEGORIES.map((cat) => (
          <section
            key={cat.id}
            id={cat.id}
            className="scroll-mt-16 space-y-10"
          >
            <div className="section-rule">
              <h2 className="text-xl font-semibold tracking-tight">
                {cat.label}
              </h2>
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
