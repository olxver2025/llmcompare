import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BENCHMARK_CATEGORIES, BENCHMARK_IDS, BENCHMARKS } from "@/data/benchmarks";
import type { BenchmarkId } from "@/data/types";
import { BenchmarkDetailView } from "@/components/benchmark-detail-view";
import { Spec } from "@/components/spec-row";
import {
  DATA_FRESHNESS,
  formatScore,
  getAllModels,
  getRankedModelsByBenchmark,
} from "@/lib/models";

type Props = { params: Promise<{ id: string }> };

function isBenchmarkId(value: string): value is BenchmarkId {
  return BENCHMARK_IDS.includes(value as BenchmarkId);
}

function scoreLabel(id: BenchmarkId, score: number): string {
  const meta = BENCHMARKS[id];
  const formatted = formatScore(id, score);
  return meta.unit === "percent" ? `${formatted}%` : formatted;
}

export function generateStaticParams() {
  return BENCHMARK_IDS.map((id) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!isBenchmarkId(id)) return { title: "Benchmark not found" };
  const meta = BENCHMARKS[id];
  return {
    title: meta.name,
    description: meta.description,
  };
}

export default async function BenchmarkDetailPage({ params }: Props) {
  const { id } = await params;
  if (!isBenchmarkId(id)) notFound();

  const meta = BENCHMARKS[id];
  const category =
    BENCHMARK_CATEGORIES.find((cat) => cat.id === meta.category)?.label ??
    meta.category;
  const ranked = getRankedModelsByBenchmark(id);
  const catalogCount = getAllModels().length;
  const metric =
    meta.unit === "percent"
      ? "Percent"
      : meta.unit === "elo"
        ? "Elo"
        : meta.unit;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link
          href="/benchmarks"
          className="hover:text-foreground hover:underline"
        >
          Benchmarks
        </Link>
        <span className="mx-2 text-border">/</span>
        <span className="text-foreground">{meta.name}</span>
      </nav>

      <header className="mb-10 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {category}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {meta.name}
        </h1>
        <p className="mt-3 text-muted-foreground text-pretty">
          {meta.description}
        </p>
      </header>

      <section className="section-rule mb-12 max-w-2xl">
        <h2 className="text-lg font-semibold tracking-tight">
          How models are tested
        </h2>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">
          Scores are published numbers from the sources below. They are only
          comparable when the evaluation version, tools, agent harness, and
          sampling setup match. Missing scores are omitted rather than treated
          as zero.
        </p>
        <dl className="mt-4">
          <Spec label="Category" value={category} />
          <Spec label="Metric" value={metric} />
          <Spec
            label="Direction"
            value={meta.higherIsBetter ? "Higher is better" : "Lower is better"}
          />
          <Spec
            label="Coverage"
            value={`${ranked.length} / ${catalogCount}`}
            hint="Models in this catalog with a published score"
          />
          <Spec
            label="Updated"
            value={
              <time dateTime={DATA_FRESHNESS} className="tabular-nums">
                {DATA_FRESHNESS}
              </time>
            }
            hint="Catalog snapshot date"
          />
          <Spec
            label="Source"
            value={
              <a
                href={meta.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="break-all underline-offset-2 hover:underline"
              >
                {meta.sourceUrl.replace(/^https?:\/\//, "")}
              </a>
            }
          />
        </dl>
      </section>

      <BenchmarkDetailView
        id={id}
        models={getAllModels()}
        rows={ranked.map(({ model, score, rank }) => ({
          slug: model.slug,
          name: model.name,
          organization: model.organization,
          openSource: model.openSource,
          rank,
          scoreLabel: scoreLabel(id, score),
        }))}
      />

      <p className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
        <Link
          href={`/benchmarks#${id}`}
          className="text-open underline-offset-4 hover:underline"
        >
          Back to all benchmarks
        </Link>
      </p>
    </div>
  );
}
