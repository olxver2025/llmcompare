import type { Metadata } from "next";
import Link from "next/link";
import { MediaModelsTable } from "@/components/media-models-table";
import {
  DATA_FRESHNESS,
  getAllVideoModels,
  getVideoOrganizations,
} from "@/lib/media-models";

export const metadata: Metadata = {
  title: "Video models",
  description:
    "Compare video generation models by Arena Elo, resolution, duration, price, and generation speed.",
};

export default function VideoCatalogPage() {
  const models = getAllVideoModels();
  const organizations = getVideoOrganizations();
  const openCount = models.filter((m) => m.openSource).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
      <section className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Video models
        </h1>
        <p className="mt-3 text-base text-muted-foreground text-pretty">
          Arena Elo, list prices, and specs for{" "}
          <span className="font-mono tabular-nums text-foreground">
            {models.length}
          </span>{" "}
          video models ({openCount} open-weight). Updated{" "}
          <time dateTime={DATA_FRESHNESS} className="font-mono tabular-nums">
            {DATA_FRESHNESS}
          </time>
          .
        </p>
        <p className="mt-3 text-sm text-muted-foreground text-pretty">
          Scores and list prices are compiled from public sources — re-check
          primary docs before you rely on them.
        </p>
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link
            href="/video/compare"
            className="font-medium text-open underline-offset-4 hover:underline"
          >
            Compare video models
          </Link>
          <Link
            href="/image"
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Image models
          </Link>
        </p>
      </section>

      <section className="section-rule">
        <MediaModelsTable
          kind="video"
          models={models}
          organizations={organizations}
        />
      </section>
    </div>
  );
}