import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Model } from "@/data/types";
import { CompareBars, ComparePriceBars } from "@/components/compare-bars";
import { OpenBadge } from "@/components/open-badge";
import { OrgIcon } from "@/components/org-icon";
import {
  compareBreakdown,
  compareSlug,
  formatApiAccess,
  formatContext,
  formatDate,
  formatLicense,
  formatModalities,
  formatParams,
  formatPrice,
  formatSpeed,
  generateVerdict,
  getModel,
  modelFamilyLabel,
  parseCompareSlug,
  popularComparePairs,
  type CompareRow,
} from "@/lib/models";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = true;

export function generateStaticParams() {
  return popularComparePairs().map(([a, b]) => ({
    slug: compareSlug(a, b),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseCompareSlug(slug);
  if (!parsed) return { title: "Compare" };
  const a = getModel(parsed.a);
  const b = getModel(parsed.b);
  if (!a || !b) return { title: "Compare" };
  return {
    title: `${a.name} vs ${b.name}`,
    description: generateVerdict(a, b),
  };
}

function sideTone(
  winner: "a" | "b" | "tie" | "na" | undefined,
  side: "a" | "b"
) {
  if (!winner || winner === "na" || winner === "tie") return "";
  if (winner === side) {
    return "font-semibold text-foreground";
  }
  return "text-muted-foreground";
}

const ROW_GROUP_ORDER = [
  "spec",
  "pricing",
  "speed",
  "reasoning",
  "coding",
  "arena",
] as const;

const ROW_GROUP_LABELS: Record<(typeof ROW_GROUP_ORDER)[number], string> = {
  spec: "Specs",
  pricing: "Pricing",
  speed: "Speed",
  reasoning: "Reasoning",
  coding: "Coding",
  arena: "Arena",
};

function groupRows(rows: CompareRow[]) {
  return ROW_GROUP_ORDER.map((cat) => ({
    cat,
    label: ROW_GROUP_LABELS[cat],
    rows: rows.filter((r) => r.category === cat),
  })).filter((g) => g.rows.length > 0);
}

export default async function ComparePage({ params }: Props) {
  const { slug } = await params;
  const parsed = parseCompareSlug(slug);
  if (!parsed) notFound();

  const canonical = compareSlug(parsed.a, parsed.b);
  if (slug !== canonical) {
    permanentRedirect(`/compare/${canonical}`);
  }

  const a = getModel(parsed.a);
  const b = getModel(parsed.b);
  if (!a || !b) notFound();

  const breakdown = compareBreakdown(a, b);
  const { wins, categoryWins, rows, estimatedCost, highlights } = breakdown;
  const groupedRows = groupRows(rows);

  const metaRows = [
    { label: "Organization", left: a.organization, right: b.organization },
    {
      label: "Family",
      left: modelFamilyLabel(a),
      right: modelFamilyLabel(b),
    },
    {
      label: "License",
      left: formatLicense(a),
      right: formatLicense(b),
    },
    {
      label: "Open weights",
      left: a.openSource ? "Yes" : "No",
      right: b.openSource ? "Yes" : "No",
    },
    {
      label: "Release",
      left: formatDate(a.releaseDate),
      right: formatDate(b.releaseDate),
    },
    {
      label: "Knowledge cutoff",
      left: a.knowledgeCutoff ?? "-",
      right: b.knowledgeCutoff ?? "-",
    },
    {
      label: "API / provider",
      left: formatApiAccess(a),
      right: formatApiAccess(b),
    },
    {
      label: "Modalities",
      left: formatModalities(a),
      right: formatModalities(b),
    },
  ];

  const scoredRows = rows.filter((r) => r.winner !== "na");
  const overallLead =
    wins.a === wins.b ? null : wins.a > wins.b ? ("a" as const) : ("b" as const);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/compare" className="hover:text-foreground hover:underline">
          Compare
        </Link>
        <span className="mx-2 text-border">/</span>
        <span className="text-foreground">
          {a.name} vs {b.name}
        </span>
      </nav>

      <header className="mb-10 grid gap-6 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <div>
          <p className="text-sm text-muted-foreground">
            <span className="font-mono text-[color:var(--compare-a)]">A</span>
            {" · "}
            <OpenBadge openSource={a.openSource} />
            <span className="text-border"> · </span>
            <span className="font-mono text-xs">{modelFamilyLabel(a)}</span>
          </p>
          <h1 className="mt-1 flex items-center gap-2.5 text-2xl font-semibold tracking-tight sm:text-3xl">
            <OrgIcon organization={a.organization} size="lg" />
            <Link
              href={`/models/${a.slug}`}
              className="hover:underline"
              style={{ textDecorationColor: "var(--compare-a)" }}
            >
              {a.name}
            </Link>
          </h1>
          <p className="text-sm text-muted-foreground">{a.organization}</p>
        </div>
        <p className="hidden text-sm text-muted-foreground sm:block sm:pb-1">
          vs
        </p>
        <div className="sm:text-right">
          <p className="text-sm text-muted-foreground">
            <span className="font-mono text-[color:var(--compare-b)]">B</span>
            {" · "}
            <OpenBadge openSource={b.openSource} />
            <span className="text-border"> · </span>
            <span className="font-mono text-xs">{modelFamilyLabel(b)}</span>
          </p>
          <h1 className="mt-1 flex items-center gap-2.5 text-2xl font-semibold tracking-tight sm:justify-end sm:text-3xl">
            <OrgIcon organization={b.organization} size="lg" />
            <Link
              href={`/models/${b.slug}`}
              className="hover:underline"
              style={{ textDecorationColor: "var(--compare-b)" }}
            >
              {b.name}
            </Link>
          </h1>
          <p className="text-sm text-muted-foreground">{b.organization}</p>
        </div>
      </header>

      <section className="section-rule mb-10">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <p className="font-mono text-2xl tabular-nums">
            <span className="text-[color:var(--compare-a)]">{wins.a}</span>
            <span className="mx-2 text-muted-foreground">:</span>
            <span className="text-[color:var(--compare-b)]">{wins.b}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            metric wins ({wins.ties} ties across {scoredRows.length} scored).{" "}
            {overallLead === "a"
              ? `${a.name} leads overall.`
              : overallLead === "b"
                ? `${b.name} leads overall.`
                : "Tied overall."}
          </p>
        </div>
        {Object.keys(categoryWins).length > 0 && (
          <ul className="mt-4 grid gap-1 sm:grid-cols-2">
            {Object.entries(categoryWins).map(([key, cat]) => {
              const lead =
                cat.a === cat.b ? "tie" : cat.a > cat.b ? "a" : "b";
              return (
                <li
                  key={key}
                  className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0"
                >
                  <span>{cat.label}</span>
                  <span className="font-mono text-xs tabular-nums">
                    <span
                      className={
                        lead === "a"
                          ? "font-semibold text-[color:var(--compare-a)]"
                          : "text-muted-foreground"
                      }
                    >
                      {cat.a}
                    </span>
                    <span className="mx-1 text-muted-foreground">:</span>
                    <span
                      className={
                        lead === "b"
                          ? "font-semibold text-[color:var(--compare-b)]"
                          : "text-muted-foreground"
                      }
                    >
                      {cat.b}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="section-rule mb-10">
        <h2 className="text-lg font-semibold">Verdict</h2>
        <p className="mt-2 text-base text-pretty leading-relaxed">
          {generateVerdict(a, b)}
        </p>
        {highlights.length > 1 && (
          <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            {highlights.map((h) => (
              <li key={h} className="text-pretty">
                {h}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section-rule mb-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">
            Cost for 1M in + 250K out
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Illustrative chat workload at primary-provider list prices.
          </p>
          <dl className="mt-4 space-y-2">
            <div className="flex justify-between border-b border-border py-2 text-sm">
              <dt className="text-[color:var(--compare-a)]">{a.name}</dt>
              <dd className="font-mono tabular-nums">
                {estimatedCost.a !== undefined
                  ? formatPrice(estimatedCost.a)
                  : "-"}
              </dd>
            </div>
            <div className="flex justify-between border-b border-border py-2 text-sm">
              <dt className="text-[color:var(--compare-b)]">{b.name}</dt>
              <dd className="font-mono tabular-nums">
                {estimatedCost.b !== undefined
                  ? formatPrice(estimatedCost.b)
                  : "-"}
              </dd>
            </div>
          </dl>
          {estimatedCost.cheaper &&
            estimatedCost.cheaper !== "tie" &&
            estimatedCost.ratio && (
              <p className="mt-3 text-sm text-muted-foreground">
                {(estimatedCost.cheaper === "a" ? a.name : b.name)} is about{" "}
                <span className="font-mono tabular-nums text-foreground">
                  {estimatedCost.ratio.toFixed(1)}x
                </span>{" "}
                cheaper on this workload.
              </p>
            )}
        </div>
        <div>
          <h2 className="mb-3 text-lg font-semibold">Price per 1M tokens</h2>
          <ComparePriceBars a={a} b={b} />
        </div>
      </section>

      <section className="section-rule mb-10 overflow-x-auto">
        <h2 className="mb-3 text-lg font-semibold">Full comparison</h2>
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-foreground/20 text-left">
              <th className="py-2 pr-4 font-mono text-xs font-medium text-muted-foreground">
                Metric
              </th>
              <th className="py-2 pr-4 font-medium text-[color:var(--compare-a)]">
                {a.name}
              </th>
              <th className="py-2 pr-4 font-medium text-[color:var(--compare-b)]">
                {b.name}
              </th>
              <th className="py-2 font-mono text-xs font-medium text-muted-foreground">
                Delta
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={4}
                className="pb-1 pt-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                Identity
              </td>
            </tr>
            {metaRows.map((row) => (
              <tr key={row.label} className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">
                  {row.label}
                </td>
                <td className="py-2 pr-4">{row.left}</td>
                <td className="py-2 pr-4">{row.right}</td>
                <td className="py-2 font-mono text-xs text-muted-foreground">
                  -
                </td>
              </tr>
            ))}
            {groupedRows.map((group) => (
              <FragmentGroup key={group.cat} label={group.label}>
                {group.rows.map((row) => (
                  <tr key={row.id} className="border-b border-border">
                    <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">
                      {row.label}
                    </td>
                    <td
                      className={cn(
                        "py-2 pr-4 font-mono tabular-nums",
                        sideTone(row.winner, "a")
                      )}
                    >
                      {row.left}
                    </td>
                    <td
                      className={cn(
                        "py-2 pr-4 font-mono tabular-nums",
                        sideTone(row.winner, "b")
                      )}
                    >
                      {row.right}
                    </td>
                    <td
                      className={cn(
                        "py-2 font-mono text-xs tabular-nums",
                        row.winner === "a"
                          ? "text-[color:var(--compare-a)]"
                          : row.winner === "b"
                            ? "text-[color:var(--compare-b)]"
                            : "text-muted-foreground"
                      )}
                    >
                      {row.deltaLabel ?? "-"}
                    </td>
                  </tr>
                ))}
              </FragmentGroup>
            ))}
          </tbody>
        </table>
      </section>

      <section className="section-rule mb-10 grid gap-8 sm:grid-cols-2">
        <SideSummary model={a} tone="a" />
        <SideSummary model={b} tone="b" />
      </section>

      <section className="section-rule mb-10">
        <h2 className="mb-2 text-lg font-semibold">Benchmark charts</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Winner bars are emphasized. Per-benchmark deltas sit above each chart.
        </p>
        <CompareBars a={a} b={b} />
      </section>

      <p className="text-sm text-muted-foreground">
        <Link href="/compare" className="text-open underline-offset-4 hover:underline">
          Pick a different pair
        </Link>
        {" · "}
        <Link href="/" className="underline-offset-4 hover:underline">
          Back to catalog
        </Link>
      </p>
    </div>
  );
}

function FragmentGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <>
      <tr>
        <td
          colSpan={4}
          className="pb-1 pt-5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
        >
          {label}
        </td>
      </tr>
      {children}
    </>
  );
}

function SideSummary({
  model,
  tone,
}: {
  model: Model;
  tone: "a" | "b";
}) {
  const color =
    tone === "a" ? "text-[color:var(--compare-a)]" : "text-[color:var(--compare-b)]";
  return (
    <div>
      <h2 className={cn("text-sm font-semibold", color)}>{model.name}</h2>
      <dl className="mt-2 space-y-1 text-sm text-muted-foreground">
        <div className="flex justify-between gap-4">
          <dt>Context</dt>
          <dd className="font-mono tabular-nums text-foreground">
            {formatContext(model.contextWindow)}
            {model.maxOutput ? ` / ${formatContext(model.maxOutput)} out` : ""}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Parameters</dt>
          <dd className="font-mono tabular-nums text-foreground">
            {formatParams(model.parameters)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Price</dt>
          <dd className="font-mono tabular-nums text-foreground">
            {model.pricing
              ? `${formatPrice(model.pricing.inputPer1M)} / ${formatPrice(model.pricing.outputPer1M)}`
              : "-"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Speed</dt>
          <dd className="font-mono tabular-nums text-foreground">
            {formatSpeed(model)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Modalities</dt>
          <dd className="text-right text-foreground">{formatModalities(model)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>License</dt>
          <dd className="text-right text-foreground">{formatLicense(model)}</dd>
        </div>
        <p className="pt-2 text-pretty">{model.summary}</p>
      </dl>
    </div>
  );
}
