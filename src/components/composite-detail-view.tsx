"use client";

import { useState } from "react";
import Link from "next/link";
import type { CategoryCompositeRow } from "@/lib/benchmark-composite";
import { formatZScore } from "@/lib/benchmark-composite";
import { BENCHMARKS } from "@/data/benchmarks";
import { formatScore } from "@/lib/models";
import { CompositeScatter } from "@/components/composite-scatter-chart";
import { OpenBadge } from "@/components/open-badge";
import { OrgIcon } from "@/components/org-icon";
import { Button } from "@/components/ui/button";

export function CompositeDetailView({
  rows,
  benchmarkTotal,
  title = "Composite ranking",
}: {
  rows: CategoryCompositeRow[];
  benchmarkTotal: number;
  title?: string;
}) {
  const [view, setView] = useState<"scoreboard" | "chart">("scoreboard");

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant={view === "scoreboard" ? "secondary" : "ghost"}
            aria-pressed={view === "scoreboard"}
            onClick={() => setView("scoreboard")}
          >
            Scoreboard
          </Button>
          <Button
            type="button"
            size="sm"
            variant={view === "chart" ? "secondary" : "ghost"}
            aria-pressed={view === "chart"}
            onClick={() => setView("chart")}
          >
            Chart
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No model has enough published scores in this category yet.
        </p>
      ) : view === "scoreboard" ? (
        <ol className="border-t border-border">
          {rows.map((row, i) => (
            <li key={row.model.slug} className="border-b border-border py-3">
              <div className="flex items-center gap-3">
                <span className="w-7 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
                <OrgIcon organization={row.model.organization} size="sm" />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/models/${row.model.slug}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {row.model.name}
                  </Link>
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    <span>{row.model.organization}</span>
                    <OpenBadge openSource={row.model.openSource} />
                    <span>
                      {row.benchmarkCount}/{benchmarkTotal} benchmarks
                    </span>
                  </p>
                </div>
                <span className="shrink-0 font-mono text-sm font-medium tabular-nums">
                  {formatZScore(row.zScore)}
                </span>
              </div>
              <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 pl-10 font-mono text-[11px] text-muted-foreground">
                {row.contributions.map((c) => (
                  <li key={c.id}>
                    {BENCHMARKS[c.id].shortName}:{" "}
                    <span className="text-foreground">
                      {formatScore(c.id, c.score)}
                      {BENCHMARKS[c.id].unit === "percent" ? "%" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      ) : (
        <CompositeScatter rows={rows} benchmarkTotal={benchmarkTotal} />
      )}
    </section>
  );
}
