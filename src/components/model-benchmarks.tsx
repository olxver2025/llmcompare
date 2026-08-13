"use client";

import { useState } from "react";
import { BENCHMARK_CATEGORIES, BENCHMARKS } from "@/data/benchmarks";
import type { BenchmarkId, Model, ResolvedThinking } from "@/data/types";
import { ThinkingLevelControl } from "@/components/thinking-level-control";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  availableThinkingLevels,
  getRecordedThinkingLevel,
  getScoreAtThinkingLevel,
  thinkingLevelLabel,
} from "@/lib/thinking";
import { formatScore } from "@/lib/models";
import { cn } from "@/lib/utils";

export function ModelBenchmarks({
  model,
  thinking,
  ranks,
  scoredCounts,
}: {
  model: Model;
  thinking?: ResolvedThinking;
  ranks: Partial<Record<BenchmarkId, number>>;
  scoredCounts: Partial<Record<BenchmarkId, number>>;
}) {
  const [level, setLevel] = useState(thinking?.highestLevel ?? "");
  const enabledIds = thinking
    ? availableThinkingLevels(model, thinking)
    : undefined;
  const selectedId = thinking
    ? enabledIds?.has(level)
      ? level
      : thinking.highestLevel
    : "";

  return (
    <section className="section-rule">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">Benchmarks</h2>
        {thinking ? (
          <div className="space-y-2">
            <ThinkingLevelControl
              levels={thinking.levels}
              value={selectedId}
              enabledIds={enabledIds}
              onChange={setLevel}
            />
            <p className="font-mono text-[11px] text-muted-foreground">
              {thinking.param} · highest{" "}
              {thinkingLevelLabel(thinking, thinking.highestLevel)}
              {" · "}
              <a
                href={thinking.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="underline-offset-2 hover:underline"
              >
                source
              </a>
            </p>
          </div>
        ) : null}
      </div>

      {thinking ? (
        <p className="mt-2 text-xs text-muted-foreground text-pretty">
          List price does not change by thinking level. Thinking tokens bill as
          output. Levels without a recorded score stay on the measured level.
        </p>
      ) : null}

      <div className="mt-3 space-y-6">
        {BENCHMARK_CATEGORIES.map((cat) => (
          <div key={cat.id}>
            <h3 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {cat.label}
            </h3>
            <ul className="mt-1">
              {cat.ids.map((id) => {
                const meta = BENCHMARKS[id];
                const resolved = thinking
                  ? getScoreAtThinkingLevel(model, id, selectedId)
                  : {
                      score: model.benchmarks[id],
                      recordedLevel: undefined,
                      matched: true,
                    };
                const recorded =
                  resolved.recordedLevel ??
                  getRecordedThinkingLevel(model, id);
                const fallback = Boolean(
                  thinking && resolved.score !== undefined && !resolved.matched
                );
                const rank = resolved.matched ? ranks[id] : undefined;

                return (
                  <li
                    key={id}
                    className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border py-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{meta.name}</p>
                      <p className="max-w-md text-xs text-muted-foreground text-pretty">
                        {meta.description}{" "}
                        <a
                          href={meta.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline-offset-2 hover:underline"
                        >
                          (source)
                        </a>
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "font-mono text-base font-medium tabular-nums",
                          fallback && "text-muted-foreground"
                        )}
                      >
                        {formatScore(id, resolved.score)}
                        {meta.unit === "percent" && resolved.score !== undefined
                          ? "%"
                          : ""}
                      </p>
                      {thinking && resolved.score !== undefined && recorded ? (
                        <Tooltip>
                          <TooltipTrigger className="font-mono text-[11px] text-muted-foreground">
                            {thinkingLevelLabel(thinking, recorded)}
                            {fallback ? " · recorded" : ""}
                          </TooltipTrigger>
                          <TooltipContent>
                            {fallback
                              ? `No ${thinkingLevelLabel(thinking, selectedId)} score. Showing the recorded ${thinkingLevelLabel(thinking, recorded)} result.`
                              : `Measured at ${thinkingLevelLabel(thinking, recorded)}.`}
                          </TooltipContent>
                        </Tooltip>
                      ) : null}
                      {rank !== undefined ? (
                        <p className="font-mono text-xs tabular-nums text-muted-foreground">
                          #{rank} of {scoredCounts[id]}
                        </p>
                      ) : resolved.score === undefined ? (
                        <p className="font-mono text-xs text-muted-foreground">
                          unreported
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
