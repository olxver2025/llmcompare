import type { Metadata } from "next";
import Link from "next/link";
import { CompareForm } from "@/components/compare-form";
import { OrgIcon } from "@/components/org-icon";
import type { Model } from "@/data/types";
import {
  compareSlug,
  getAllModels,
  getModel,
  popularComparePairs,
} from "@/lib/models";

export const metadata: Metadata = {
  title: "Compare models",
  description:
    "Pick two or more LLMs for a head-to-head on benchmarks, pricing, and specs.",
};

export default function ComparePickerPage() {
  const models = getAllModels();
  const pairs = popularComparePairs()
    .map(([a, b]) => {
      const left = getModel(a);
      const right = getModel(b);
      return left && right ? { left, right } : null;
    })
    .filter((row): row is { left: Model; right: Model } => row !== null)
    .slice(0, 12);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Compare models
        </h1>
        <p className="mt-3 text-muted-foreground text-pretty">
          Two models open a shareable vs page with a verdict and charts. Add a
          third for a side-by-side table.
        </p>
      </div>
      <div className="section-rule">
        <CompareForm models={models} />
      </div>

      {pairs.length > 0 ? (
        <section className="section-rule mt-10">
          <h2 className="text-lg font-semibold">Popular pairs</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {pairs.map(({ left, right }) => (
              <li key={`${left.slug}-${right.slug}`}>
                <Link
                  href={`/compare/${compareSlug(left.slug, right.slug)}`}
                  className="inline-flex items-center gap-2 border border-border px-2 py-1.5 text-sm hover:border-foreground/40"
                >
                  <OrgIcon organization={left.organization} size="sm" />
                  <span className="font-medium">{left.name}</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    vs
                  </span>
                  <OrgIcon organization={right.organization} size="sm" />
                  <span className="font-medium">{right.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
