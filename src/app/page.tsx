import Link from "next/link";
import { ModelsTable } from "@/components/models-table";
import { PricePerformanceScatter } from "@/components/scatter-chart";
import { getLlmcompareIndexBySlug } from "@/lib/benchmark-composite";
import {
  DATA_FRESHNESS,
  getAllModels,
  getOrganizations,
} from "@/lib/models";

export default function HomePage() {
  const models = getAllModels();
  const organizations = getOrganizations();
  const indexScores = getLlmcompareIndexBySlug();
  const openCount = models.filter((m) => m.openSource).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
      <section className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          LLM<span className="text-open">compare</span>
        </h1>
        <p className="mt-3 text-base text-muted-foreground text-pretty">
          Benchmarks, list prices, and specs for{" "}
          <span className="font-mono tabular-nums text-foreground">
            {models.length}
          </span>{" "}
          models ({openCount} open-weight). Updated{" "}
          <time dateTime={DATA_FRESHNESS} className="font-mono tabular-nums">
            {DATA_FRESHNESS}
          </time>
          . Pick any two for a shareable comparison.
        </p>
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link href="/compare" className="font-medium text-open underline-offset-4 hover:underline">
            Compare two models
          </Link>
          <Link
            href="/benchmarks"
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Benchmarks
          </Link>
          <Link
            href="/releases"
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Latest releases
          </Link>
          <a href="#catalog" className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Jump to catalog
          </a>
        </p>
      </section>

      <section className="section-rule mb-12">
        <PricePerformanceScatter models={models} indexScores={indexScores} />
      </section>

      <section id="catalog" className="section-rule scroll-mt-16">
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight">Catalog</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Every benchmark in the catalog is a column — scroll sideways from
            the bar above the table. Sort any column. Missing scores show as -.
            Click a row for details. Models with documented thinking levels use
            the highest level.
          </p>
        </div>
        <ModelsTable
          models={models}
          organizations={organizations}
          indexScores={indexScores}
        />
      </section>
    </div>
  );
}
