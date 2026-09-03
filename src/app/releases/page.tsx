import type { Metadata } from "next";
import Link from "next/link";
import { ReleasesTable } from "@/components/releases-table";
import {
  DATA_FRESHNESS,
  getAllModels,
  getOrganizations,
} from "@/lib/models";

export const metadata: Metadata = {
  title: "Latest model releases",
  description:
    "Browse recent LLM launches by release date, company, and benchmark scores.",
};

export default function ReleasesPage() {
  const models = getAllModels();
  const organizations = getOrganizations();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
      <section className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Latest releases
        </h1>
        <p className="mt-3 text-base text-muted-foreground text-pretty">
          Recent model launches across the catalog, sorted by release date by
          default. Filter by company or open/closed weights, and sort by
          benchmarks. Data as of{" "}
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

      <section className="section-rule">
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight">Timeline</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Grouped by month, newest first. Arena Elo sits on the right when
            published. Click a row for model details.
          </p>
        </div>
        <ReleasesTable models={models} organizations={organizations} />
      </section>
    </div>
  );
}
