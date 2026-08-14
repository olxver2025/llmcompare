import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BENCHMARK_CATEGORIES, BENCHMARKS } from "@/data/benchmarks";
import { CompositeDetailView } from "@/components/composite-detail-view";
import { Spec } from "@/components/spec-row";
import {
  COMPOSITE_PEER_MONTHS,
  compositeEligibleCategories,
  compositePeerCutoff,
  getCategoryBatteryIds,
  getCategoryComposite,
  MIN_COMPOSITE_BENCHMARKS,
  type CategoryId,
} from "@/lib/benchmark-composite";
import { DATA_FRESHNESS } from "@/lib/models";

type Props = { params: Promise<{ id: string }> };

function isCompositeCategory(value: string): value is CategoryId {
  return compositeEligibleCategories().some((cat) => cat.id === value);
}

export function generateStaticParams() {
  return compositeEligibleCategories().map((cat) => ({ id: cat.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!isCompositeCategory(id)) return { title: "Category not found" };
  const meta = BENCHMARK_CATEGORIES.find((cat) => cat.id === id);
  return {
    title: `${meta?.label} composite ranking`,
    description: `Composite z-score ranking across the ${meta?.label} benchmarks in the catalog.`,
  };
}

export default async function CategoryCompositePage({ params }: Props) {
  const { id } = await params;
  if (!isCompositeCategory(id)) notFound();

  const category = BENCHMARK_CATEGORIES.find((cat) => cat.id === id);
  if (!category) notFound();

  const benchmarkIds = getCategoryBatteryIds(id);
  const rows = getCategoryComposite(id);
  const MIN_BENCHMARKS = MIN_COMPOSITE_BENCHMARKS;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/benchmarks" className="hover:text-foreground hover:underline">
          Benchmarks
        </Link>
        <span className="mx-2 text-border">/</span>
        <span className="text-foreground">{category.label} composite</span>
      </nav>

      <header className="mb-10 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Composite ranking
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {category.label}
        </h1>
        <p className="mt-3 text-muted-foreground text-pretty">
          A single derived ranking across the {benchmarkIds.length}{" "}
          {category.label.toLowerCase()} benchmarks in this catalog. This is
          not a published benchmark score — it&apos;s computed here.
        </p>
      </header>

      <section className="section-rule mb-12 max-w-2xl">
        <h2 className="text-lg font-semibold tracking-tight">Methodology</h2>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">
          Each eligible benchmark&apos;s scores are z-score normalized against
          models released in the past {COMPOSITE_PEER_MONTHS} months (since{" "}
          {compositePeerCutoff()}), then averaged over the full category
          battery. A missing score contributes 0 rather than being dropped
          from the average. Saturated benches and benches scored on fewer
          than ten peer models are excluded. A model needs a published score
          on at least {MIN_BENCHMARKS} of the {benchmarkIds.length} benchmarks
          below to receive a composite; every contributing score is shown so
          nothing is hidden behind the composite number.
        </p>
        <dl className="mt-4">
          <Spec
            label="Benchmarks included"
            value={benchmarkIds.map((bid) => BENCHMARKS[bid].shortName).join(", ")}
          />
          <Spec
            label="Min. coverage"
            value={`${MIN_BENCHMARKS} of ${benchmarkIds.length} benchmarks`}
          />
          <Spec
            label="Coverage"
            value={`${rows.length} models`}
            hint="Models in this catalog with enough published scores for a composite"
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
        </dl>
      </section>

      <CompositeDetailView rows={rows} benchmarkTotal={benchmarkIds.length} />

      <p className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
        <Link
          href={`/benchmarks#${id}`}
          className="text-open underline-offset-4 hover:underline"
        >
          Back to {category.label} benchmarks
        </Link>
      </p>
    </div>
  );
}
