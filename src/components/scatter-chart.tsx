"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import type { BenchmarkId, Model } from "@/data/types";
import { BENCHMARKS } from "@/data/benchmarks";
import {
  formatZScore,
  LLMCOMPARE_INDEX,
  type IndexScore,
  type LlmcompareIndexId,
} from "@/lib/benchmark-composite";
import { blendedPrice, formatPrice, formatScore } from "@/lib/models";
import { MODEL_FAMILIES, modelFamilyId } from "@/lib/model-family";
import { orgColor } from "@/lib/org-colors";
import { assignLabels, shortLabel } from "@/lib/scatter-utils";
import { OrgIcon } from "@/components/org-icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const Y_OPTIONS: BenchmarkId[] = [
  "lmarena-elo",
  "mmlu-pro",
  "gpqa-diamond",
  "aime-2025",
  "math-500",
  "swe-bench-verified",
  "swe-bench-pro",
  "swe-bench-multilingual",
  "livecodebench",
  "terminal-bench-2-1",
  "aider-polyglot",
  "scicode",
  "cursorbench",
  "swe-rebench",
  "nl2repo",
  "webdev-arena",
  "hle",
];

type YAxisId = BenchmarkId | LlmcompareIndexId;

type Point = {
  x: number;
  y: number;
  name: string;
  org: string;
  family: string;
  open: boolean;
  input: number;
  output: number;
  slug: string;
  color: string;
  /** Benchmarks behind the index score; only set on the index axis. */
  indexCount?: number;
  label: boolean;
  labelDx: number;
  labelDy: number;
};

export function PricePerformanceScatter({
  models,
  fixedY,
  compact = false,
  indexScores,
}: {
  models: Model[];
  fixedY?: BenchmarkId;
  compact?: boolean;
  /** LLMcompare Index by slug; enables (and defaults to) the index Y axis. */
  indexScores?: Record<string, IndexScore>;
}) {
  const router = useRouter();
  const [yAxis, setYAxis] = useState<YAxisId>(
    fixedY ?? (indexScores ? LLMCOMPARE_INDEX.id : "lmarena-elo")
  );
  const [org, setOrg] = useState<string>("all");
  const [family, setFamily] = useState<string>("all");
  const [license, setLicense] = useState<"all" | "open" | "closed">("all");
  const [showLabels, setShowLabels] = useState(false);

  const orgs = useMemo(
    () =>
      [...new Set(models.map((m) => m.organization))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [models]
  );

  const familyOptions = useMemo(() => {
    const present = new Set(models.map(modelFamilyId));
    return MODEL_FAMILIES.filter((f) => present.has(f.id));
  }, [models]);

  const filteredModels = useMemo(() => {
    return models.filter((m) => {
      if (org !== "all" && m.organization !== org) return false;
      if (family !== "all" && modelFamilyId(m) !== family) return false;
      if (license === "open" && !m.openSource) return false;
      if (license === "closed" && m.openSource) return false;
      return true;
    });
  }, [models, org, family, license]);

  const isIndex = yAxis === LLMCOMPARE_INDEX.id;

  const points = useMemo(() => {
    const pts: Point[] = [];
    for (const m of filteredModels) {
      const price = blendedPrice(m);
      const index = isIndex ? indexScores?.[m.slug] : undefined;
      const score = isIndex ? index?.zScore : m.benchmarks[yAxis as BenchmarkId];
      if (price === undefined || price <= 0 || score === undefined) continue;
      pts.push({
        x: price,
        y: score,
        name: m.name,
        org: m.organization,
        family: modelFamilyId(m),
        open: m.openSource,
        input: m.pricing!.inputPer1M,
        output: m.pricing!.outputPer1M,
        slug: m.slug,
        color: orgColor(m.organization),
        indexCount: index?.benchmarkCount,
        label: false,
        labelDx: 8,
        labelDy: -2,
      });
    }
    // Auto-label when the filtered set is small; otherwise only if toggled
    const shouldLabel = showLabels || pts.length <= 12;
    if (!shouldLabel) return pts;
    return assignLabels(pts, 640, 340);
  }, [filteredModels, yAxis, isIndex, indexScores, showLabels]);

  const openPts = points.filter((p) => p.open);
  const closedPts = points.filter((p) => !p.open);
  const yLabel = isIndex
    ? LLMCOMPARE_INDEX.shortName
    : BENCHMARKS[yAxis as BenchmarkId].shortName;
  const isElo = !isIndex && BENCHMARKS[yAxis as BenchmarkId].unit === "elo";
  const labelsActive = showLabels || points.length <= 12;

  // Recharts derives ticks for a numeric/log XAxis from the raw data values;
  // when several models share the same blended price it emits duplicate tick
  // keys. Hand it a deduplicated set so positions stay identical but keys are unique.
  const xTicks = useMemo(
    () => [...new Set(points.map((p) => p.x))].sort((a, b) => a - b),
    [points]
  );

  const makeShape =
    (shape: "circle" | "diamond") =>
    (props: { cx?: number; cy?: number; payload?: Point }) => {
      const { cx, cy, payload: p } = props;
      if (cx == null || cy == null || !p) return null;
      const size = p.label && labelsActive ? 6 : 5;
      return (
        <g
          className="cursor-pointer"
          onClick={() => router.push(`/models/${p.slug}`)}
        >
          {shape === "circle" ? (
            <circle
              cx={cx}
              cy={cy}
              r={size}
              fill={p.color}
              stroke="var(--background)"
              strokeWidth={1.5}
            />
          ) : (
            <polygon
              points={`${cx},${cy - size - 1} ${cx + size + 1},${cy} ${cx},${cy + size + 1} ${cx - size - 1},${cy}`}
              fill={p.color}
              stroke="var(--background)"
              strokeWidth={1.5}
            />
          )}
          {labelsActive && p.label && (
            <text
              x={cx + p.labelDx}
              y={cy + p.labelDy}
              fontSize={10}
              className="fill-foreground"
              style={{
                fontFamily: "var(--font-ibm-mono), monospace",
                paintOrder: "stroke",
                stroke: "var(--background)",
                strokeWidth: 3,
                strokeLinejoin: "round",
              }}
            >
              {shortLabel(p.name)}
            </text>
          )}
        </g>
      );
    };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        {compact ? (
          <p className="text-sm text-muted-foreground">
            Blended price (3:1 in:out), log scale. Models without a listed
            price are omitted from the plot.
          </p>
        ) : (
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Price vs performance
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Blended price (3:1 in:out), log scale. Hover for names; labels
              stay sparse so the plot stays readable. Filter to zoom in on a
              line.
            </p>
            {isIndex ? (
              <p className="mt-1 text-sm text-muted-foreground">
                The Y axis is the{" "}
                <Link
                  href={LLMCOMPARE_INDEX.href}
                  className="text-open underline-offset-4 hover:underline"
                >
                  LLMcompare Index
                </Link>
                , a site-computed composite across every benchmark in the
                catalog — not a published benchmark score.
              </p>
            ) : null}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {fixedY ? null : (
            <Select
              value={yAxis}
              onValueChange={(v) => setYAxis(v as YAxisId)}
            >
              <SelectTrigger className="h-9 w-[9.5rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {indexScores ? (
                  <SelectItem value={LLMCOMPARE_INDEX.id}>
                    Y: {LLMCOMPARE_INDEX.shortName}
                  </SelectItem>
                ) : null}
                {Y_OPTIONS.map((id) => (
                  <SelectItem key={id} value={id}>
                    Y: {BENCHMARKS[id].shortName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={org} onValueChange={setOrg}>
            <SelectTrigger className="h-9 w-[9.5rem]">
              <SelectValue placeholder="Organization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All orgs</SelectItem>
              {orgs.map((o) => (
                <SelectItem key={o} value={o}>
                  <span className="inline-flex items-center gap-2">
                    <OrgIcon organization={o} size="sm" />
                    {o}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={family} onValueChange={setFamily}>
            <SelectTrigger className="h-9 w-[11rem]">
              <SelectValue placeholder="Model line" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All model lines</SelectItem>
              {familyOptions.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={license}
            onValueChange={(v) => setLicense(v as typeof license)}
          >
            <SelectTrigger className="h-9 w-[8rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Open + closed</SelectItem>
              <SelectItem value="open">Open only</SelectItem>
              <SelectItem value="closed">Closed only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="font-mono text-xs tabular-nums text-muted-foreground">
        Showing {points.length} models with price + {yLabel}
        {(org !== "all" || family !== "all" || license !== "all") && (
          <>
            {" · "}
            <button
              type="button"
              className="underline-offset-2 hover:underline"
              onClick={() => {
                setOrg("all");
                setFamily("all");
                setLicense("all");
              }}
            >
              Clear filters
            </button>
          </>
        )}
      </p>

      <div className={compact ? "h-[280px] w-full" : "h-[340px] w-full"}>
        {points.length === 0 ? (
          <div className="flex h-full items-center justify-center border border-dashed border-border text-sm text-muted-foreground">
            No models match these filters with both price and this benchmark.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 16, right: 24, bottom: 12, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                type="number"
                dataKey="x"
                name="price"
                scale="log"
                domain={["auto", "auto"]}
                ticks={xTicks}
                tickFormatter={(v) => `$${Number(v).toPrecision(2)}`}
                label={{
                  value: "Blended $/1M tokens (log)",
                  position: "insideBottom",
                  offset: -2,
                  className: "fill-muted-foreground text-xs",
                }}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="score"
                domain={["auto", "auto"]}
                tickFormatter={(v) =>
                  isIndex
                    ? formatZScore(Number(v))
                    : isElo
                      ? String(Math.round(v))
                      : `${v}`
                }
                label={{
                  value: isIndex ? "LLMcompare Index (z-score)" : yLabel,
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                  className: "fill-muted-foreground text-xs",
                }}
                tick={{ fontSize: 11 }}
                width={isIndex ? 52 : 48}
              />
              <ZAxis range={[60, 60]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload as Point;
                  return (
                    <div className="border border-border bg-popover px-3 py-2 text-sm shadow-md">
                      <div className="flex items-center gap-2">
                        <OrgIcon organization={p.org} size="sm" />
                        <p className="font-medium">{p.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {p.org} · {p.open ? "open" : "closed"}
                      </p>
                      <p className="mt-1 font-mono tabular-nums text-xs">
                        {yLabel}:{" "}
                        {isIndex
                          ? formatZScore(p.y)
                          : formatScore(yAxis as BenchmarkId, p.y)}
                        {isIndex && p.indexCount !== undefined
                          ? ` (${p.indexCount} benchmarks)`
                          : ""}
                      </p>
                      <p className="font-mono tabular-nums text-xs">
                        {formatPrice(p.input)} / {formatPrice(p.output)} per 1M
                      </p>
                    </div>
                  );
                }}
              />
              <Scatter
                name="Open"
                data={openPts}
                shape={makeShape("circle")}
                isAnimationActive={false}
              />
              <Scatter
                name="Closed"
                data={closedPts}
                shape={makeShape("diamond")}
                isAnimationActive={false}
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex flex-wrap gap-4 border-t border-border pt-3 font-mono text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full bg-foreground/70" />{" "}
          open (circle)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block size-2 rotate-45 bg-foreground/70" />{" "}
          closed (diamond)
        </span>
        <span>Color = organization</span>
      </div>
    </div>
  );
}
