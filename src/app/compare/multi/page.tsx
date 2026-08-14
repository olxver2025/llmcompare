import type { Metadata } from "next";
import Link from "next/link";
import { MultiCompareForm } from "@/components/multi-compare-form";
import { MultiCompareTable } from "@/components/multi-compare-table";
import { MAX_MULTI_COMPARE } from "@/lib/multi-compare";
import { getAllModels, getModel } from "@/lib/models";

export const metadata: Metadata = {
  title: "Compare multiple models",
  description:
    "Line up 3 or more LLMs side by side on specs, pricing, and benchmarks.",
};

type Props = { searchParams: Promise<{ m?: string }> };

export default async function MultiComparePage({ searchParams }: Props) {
  const { m } = await searchParams;
  const models = getAllModels();

  const requested = (m ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const uniqueSlugs = [...new Set(requested)].slice(0, MAX_MULTI_COMPARE);
  const selected = uniqueSlugs
    .map((slug) => getModel(slug))
    .filter((model): model is NonNullable<typeof model> => model !== undefined);

  const missing = uniqueSlugs.filter((slug) => !getModel(slug));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/compare" className="hover:text-foreground hover:underline">
          Compare
        </Link>
        <span className="mx-2 text-border">/</span>
        <span className="text-foreground">Multiple models</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Compare multiple models
        </h1>
        <p className="mt-3 text-muted-foreground text-pretty">
          Pick 2 to {MAX_MULTI_COMPARE} models for a shared spec, pricing, and
          benchmark table. The leading value in each row is bolded; ties and
          missing scores are left unmarked.
        </p>
      </div>

      <div className="section-rule mb-10">
        <MultiCompareForm models={models} initialSlugs={uniqueSlugs} />
        {missing.length > 0 ? (
          <p className="mt-3 text-sm text-destructive">
            Unknown model slug{missing.length > 1 ? "s" : ""}: {missing.join(", ")}
          </p>
        ) : null}
      </div>

      {selected.length >= 2 ? (
        <section className="section-rule">
          <h2 className="mb-3 text-lg font-semibold">Comparison</h2>
          <MultiCompareTable models={selected} />
        </section>
      ) : (
        <p className="text-sm text-muted-foreground">
          Choose at least two models above to see the comparison table.
        </p>
      )}
    </div>
  );
}
