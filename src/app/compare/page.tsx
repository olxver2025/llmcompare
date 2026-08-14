import type { Metadata } from "next";
import Link from "next/link";
import { CompareForm } from "@/components/compare-form";
import { getAllModels } from "@/lib/models";

export const metadata: Metadata = {
  title: "Compare models",
  description:
    "Pick any two LLMs for a head-to-head on benchmarks, pricing, and specs.",
};

export default function ComparePickerPage() {
  const models = getAllModels();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Compare two models
        </h1>
        <p className="mt-3 text-muted-foreground text-pretty">
          Choose a pair for a shareable vs page with specs, charts, and a short
          verdict.
        </p>
        <p className="mt-3 text-sm">
          <Link
            href="/compare/multi"
            className="text-open underline-offset-4 hover:underline"
          >
            Comparing 3 or more models? Use the multi-model table →
          </Link>
        </p>
      </div>
      <div className="section-rule">
        <CompareForm models={models} />
      </div>
    </div>
  );
}
