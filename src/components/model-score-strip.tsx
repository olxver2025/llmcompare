import Link from "next/link";
import { BENCHMARKS } from "@/data/benchmarks";
import type { BenchmarkId, Model } from "@/data/types";
import {
  formatZScore,
  LLMCOMPARE_INDEX,
  type IndexScore,
} from "@/lib/benchmark-composite";
import { HEADLINE_BENCHMARKS } from "@/lib/catalog-views";
import { formatScore } from "@/lib/models";

const MAX_ITEMS = 7;

export function ModelScoreStrip({
  model,
  indexScore,
  ranks,
  scoredCounts,
}: {
  model: Model;
  indexScore?: IndexScore;
  ranks: Partial<Record<BenchmarkId, number>>;
  scoredCounts: Partial<Record<BenchmarkId, number>>;
}) {
  const items: {
    key: string;
    label: string;
    value: string;
    href: string;
    hint?: string;
  }[] = [];

  if (indexScore) {
    items.push({
      key: LLMCOMPARE_INDEX.id,
      label: LLMCOMPARE_INDEX.shortName,
      value: formatZScore(indexScore.zScore),
      href: LLMCOMPARE_INDEX.href,
      hint: `${indexScore.benchmarkCount} benches`,
    });
  }

  for (const id of HEADLINE_BENCHMARKS) {
    if (items.length >= MAX_ITEMS) break;
    const score = model.benchmarks[id];
    if (score === undefined) continue;
    const meta = BENCHMARKS[id];
    const rank = ranks[id];
    const of = scoredCounts[id];
    items.push({
      key: id,
      label: meta.shortName,
      value: `${formatScore(id, score)}${meta.unit === "percent" ? "%" : ""}`,
      href: `/benchmarks/${id}`,
      hint:
        rank !== undefined && of !== undefined ? `#${rank} of ${of}` : undefined,
    });
  }

  if (items.length === 0) return null;

  return (
    <section className="section-rule mb-10">
      <h2 className="sr-only">Headline scores</h2>
      <ul className="flex gap-px overflow-x-auto scroll-rail">
        {items.map((item) => (
          <li key={item.key} className="min-w-[7.5rem] flex-1">
            <Link
              href={item.href}
              className="block py-1 pr-4 hover:bg-muted/50"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-0.5 font-mono text-xl tabular-nums tracking-tight">
                {item.value}
              </p>
              {item.hint ? (
                <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {item.hint}
                </p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
