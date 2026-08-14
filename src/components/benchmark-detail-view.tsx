"use client";

import { useState } from "react";
import Link from "next/link";
import type { BenchmarkId, Model } from "@/data/types";
import { OpenBadge } from "@/components/open-badge";
import { OrgIcon } from "@/components/org-icon";
import { PricePerformanceScatter } from "@/components/scatter-chart";
import { Button } from "@/components/ui/button";

export type BenchmarkScoreRow = {
  slug: string;
  name: string;
  organization: string;
  openSource: boolean;
  rank: number;
  scoreLabel: string;
};

export function BenchmarkDetailView({
  id,
  rows,
  models,
}: {
  id: BenchmarkId;
  rows: BenchmarkScoreRow[];
  models: Model[];
}) {
  const [view, setView] = useState<"scoreboard" | "chart">("scoreboard");

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Scores</h2>
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
          No audited score is published for this benchmark in the current
          snapshot.
        </p>
      ) : view === "scoreboard" ? (
        <ol className="border-t border-border">
          {rows.map((row) => (
            <li
              key={row.slug}
              className="flex items-center gap-3 border-b border-border py-2.5"
            >
              <span className="w-7 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                {row.rank}
              </span>
              <OrgIcon organization={row.organization} size="sm" />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/models/${row.slug}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {row.name}
                </Link>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                  <span>{row.organization}</span>
                  <OpenBadge openSource={row.openSource} />
                </p>
              </div>
              <span className="shrink-0 font-mono text-sm font-medium tabular-nums">
                {row.scoreLabel}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <PricePerformanceScatter models={models} fixedY={id} compact />
      )}
    </section>
  );
}
