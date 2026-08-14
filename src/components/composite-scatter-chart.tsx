"use client";

import { useMemo, useState } from "react";
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
import type { CategoryCompositeRow } from "@/lib/benchmark-composite";
import { formatZScore } from "@/lib/benchmark-composite";
import { blendedPrice, formatPrice } from "@/lib/models";
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

type Point = {
  x: number;
  y: number;
  name: string;
  org: string;
  family: string;
  open: boolean;
  benchmarkCount: number;
  slug: string;
  color: string;
  label: boolean;
  labelDx: number;
  labelDy: number;
};

export function CompositeScatter({
  rows,
  benchmarkTotal,
}: {
  rows: CategoryCompositeRow[];
  benchmarkTotal: number;
}) {
  const router = useRouter();
  const [org, setOrg] = useState<string>("all");
  const [family, setFamily] = useState<string>("all");
  const [license, setLicense] = useState<"all" | "open" | "closed">("all");
  const [showLabels, setShowLabels] = useState(false);

  const orgs = useMemo(
    () =>
      [...new Set(rows.map((r) => r.model.organization))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [rows]
  );

  const familyOptions = useMemo(() => {
    const present = new Set(rows.map((r) => modelFamilyId(r.model)));
    return MODEL_FAMILIES.filter((f) => present.has(f.id));
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (org !== "all" && r.model.organization !== org) return false;
      if (family !== "all" && modelFamilyId(r.model) !== family) return false;
      if (license === "open" && !r.model.openSource) return false;
      if (license === "closed" && r.model.openSource) return false;
      return true;
    });
  }, [rows, org, family, license]);

  const points = useMemo(() => {
    const pts: Point[] = [];
    for (const row of filteredRows) {
      const price = blendedPrice(row.model);
      if (price === undefined || price <= 0) continue;
      pts.push({
        x: price,
        y: row.zScore,
        name: row.model.name,
        org: row.model.organization,
        family: modelFamilyId(row.model),
        open: row.model.openSource,
        benchmarkCount: row.benchmarkCount,
        slug: row.model.slug,
        color: orgColor(row.model.organization),
        label: false,
        labelDx: 8,
        labelDy: -2,
      });
    }
    const shouldLabel = showLabels || pts.length <= 12;
    if (!shouldLabel) return pts;
    return assignLabels(pts, 640, 340);
  }, [filteredRows, showLabels]);

  const openPts = points.filter((p) => p.open);
  const closedPts = points.filter((p) => !p.open);
  const labelsActive = showLabels || points.length <= 12;

  const xTicks = useMemo(
    () => [...new Set(points.map((p) => p.x))].sort((a, b) => a - b),
    [points]
  );

  const makeShape =
    (shape: "circle" | "diamond") =>
    function CompositeScatterShape(props: {
      cx?: number;
      cy?: number;
      payload?: Point;
    }) {
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
        <p className="text-sm text-muted-foreground">
          Blended price (3:1 in:out, log scale) vs composite z-score. Models
          without a listed price are omitted from the plot.
        </p>
        <div className="flex flex-wrap gap-2">
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
        Showing {points.length} models with price + composite score
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
        {" · "}
        <button
          type="button"
          className="underline-offset-2 hover:underline"
          onClick={() => setShowLabels((v) => !v)}
        >
          {showLabels ? "Hide labels" : "Show all labels"}
        </button>
      </p>

      <div className="h-[400px] w-full">
        {points.length === 0 ? (
          <div className="flex h-full items-center justify-center border border-dashed border-border text-sm text-muted-foreground">
            No models match these filters with both price and a composite
            score.
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
                name="composite"
                domain={["auto", "auto"]}
                tickFormatter={(v) => formatZScore(Number(v))}
                label={{
                  value: "Composite z-score",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                  className: "fill-muted-foreground text-xs",
                }}
                tick={{ fontSize: 11 }}
                width={52}
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
                        Composite: {formatZScore(p.y)} ({p.benchmarkCount}/
                        {benchmarkTotal} benchmarks)
                      </p>
                      <p className="font-mono tabular-nums text-xs">
                        {formatPrice(p.x)} blended /1M
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
