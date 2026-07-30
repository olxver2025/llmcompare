import type { Metadata } from "next";
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
          verdict. Pair URLs use alphabetical slug order so each matchup has one
          canonical link.
        </p>
      </div>
      <div className="section-rule">
        <CompareForm models={models} />
      </div>
    </div>
  );
}
