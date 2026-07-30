"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Model } from "@/data/types";
import { BENCHMARKS, BENCHMARK_CATEGORIES } from "@/data/benchmarks";
import { formatScore, sharedBenchmarks } from "@/lib/models";

const COLOR_A = "var(--compare-a)";
const COLOR_B = "var(--compare-b)";

export function CompareBars({ a, b }: { a: Model; b: Model }) {
  const shared = new Set(sharedBenchmarks(a, b));

  return (
    <div className="space-y-8">
      {BENCHMARK_CATEGORIES.map((cat) => {
        const ids = cat.ids.filter((id) => shared.has(id));
        if (ids.length === 0) return null;

        const data = ids.map((id) => {
          const av = a.benchmarks[id]!;
          const bv = b.benchmarks[id]!;
          const delta = av - bv;
          return {
            name: BENCHMARKS[id].shortName,
            id,
            [a.slug]: av,
            [b.slug]: bv,
            delta,
            deltaLabel:
              Math.abs(delta) < 0.05
                ? "tie"
                : delta > 0
                  ? `A +${formatScore(id, Math.abs(delta))}`
                  : `B +${formatScore(id, Math.abs(delta))}`,
            winner: Math.abs(delta) < 0.05 ? "tie" : delta > 0 ? "a" : "b",
          };
        });

        return (
          <div key={cat.id} className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h3 className="text-base font-semibold">
                {cat.label}
              </h3>
              <div className="flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-wider">
                {data.map((d) => (
                  <span
                    key={d.id}
                    className={
                      d.winner === "a"
                        ? "text-[color:var(--compare-a)]"
                        : d.winner === "b"
                          ? "text-[color:var(--compare-b)]"
                          : "text-muted-foreground"
                    }
                  >
                    {d.name}: {d.deltaLabel}
                  </span>
                ))}
              </div>
            </div>
            <div className="h-[280px] w-full border border-border p-2 sm:p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 24, right: 8, left: 0, bottom: 0 }}
                  barCategoryGap="28%"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                    vertical={false}
                  />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} width={44} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const row = payload[0].payload as (typeof data)[0];
                      const id = row.id as keyof typeof BENCHMARKS;
                      return (
                        <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
                          <p className="mb-1 font-medium">{label}</p>
                          {payload.map((entry) => (
                            <p
                              key={String(entry.dataKey)}
                              className="font-mono tabular-nums text-xs"
                              style={{ color: entry.color }}
                            >
                              {entry.name}:{" "}
                              {formatScore(id, entry.value as number)}
                            </p>
                          ))}
                          <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                            Delta {row.deltaLabel}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    dataKey={a.slug}
                    name={a.name}
                    fill={COLOR_A}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  >
                    <LabelList
                      dataKey={a.slug}
                      position="top"
                      className="fill-foreground"
                      style={{
                        fontSize: 10,
                        fontFamily: "var(--font-ibm-mono), monospace",
                      }}
                      formatter={(v) =>
                        typeof v === "number" ? formatScore(ids[0], v) : ""
                      }
                    />
                    {data.map((d) => (
                      <Cell
                        key={`a-${d.id}`}
                        fill={COLOR_A}
                        fillOpacity={d.winner === "b" ? 0.45 : 1}
                        stroke={d.winner === "a" ? COLOR_A : "transparent"}
                        strokeWidth={d.winner === "a" ? 2 : 0}
                      />
                    ))}
                  </Bar>
                  <Bar
                    dataKey={b.slug}
                    name={b.name}
                    fill={COLOR_B}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  >
                    <LabelList
                      dataKey={b.slug}
                      position="top"
                      className="fill-foreground"
                      style={{
                        fontSize: 10,
                        fontFamily: "var(--font-ibm-mono), monospace",
                      }}
                      formatter={(v) =>
                        typeof v === "number" ? formatScore(ids[0], v) : ""
                      }
                    />
                    {data.map((d) => (
                      <Cell
                        key={`b-${d.id}`}
                        fill={COLOR_B}
                        fillOpacity={d.winner === "a" ? 0.45 : 1}
                        stroke={d.winner === "b" ? COLOR_B : "transparent"}
                        strokeWidth={d.winner === "b" ? 2 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
      {shared.size === 0 && (
        <p className="border border-dashed border-border p-4 text-sm text-muted-foreground">
          These two models have no overlapping published benchmarks in our
          dataset. Compare specs and pricing instead.
        </p>
      )}
    </div>
  );
}

/** Horizontal delta chart for pricing / cost. */
export function ComparePriceBars({ a, b }: { a: Model; b: Model }) {
  if (!a.pricing && !b.pricing) return null;

  const rows = [
    {
      name: "Input",
      a: a.pricing?.inputPer1M,
      b: b.pricing?.inputPer1M,
    },
    {
      name: "Output",
      a: a.pricing?.outputPer1M,
      b: b.pricing?.outputPer1M,
    },
  ].filter((r) => r.a !== undefined || r.b !== undefined);

  const data = rows.map((r) => ({
    name: r.name,
    [a.slug]: r.a ?? 0,
    [b.slug]: r.b ?? 0,
    aMissing: r.a === undefined,
    bMissing: r.b === undefined,
  }));

  return (
    <div className="h-[220px] w-full border border-border p-2 sm:p-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-border"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `$${v}`}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={56}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value, name) => [
              typeof value === "number" ? `$${value}` : "-",
              String(name),
            ]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            dataKey={a.slug}
            name={a.name}
            fill={COLOR_A}
            radius={[0, 4, 4, 0]}
            maxBarSize={22}
          />
          <Bar
            dataKey={b.slug}
            name={b.name}
            fill={COLOR_B}
            radius={[0, 4, 4, 0]}
            maxBarSize={22}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
