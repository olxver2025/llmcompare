import type { ReactNode } from "react";
import Link from "next/link";
import type { ImageModel, VideoModel } from "@/data/types";
import { OpenBadge } from "@/components/open-badge";
import { OrgIcon } from "@/components/org-icon";
import {
  formatDate,
  formatDurationSeconds,
  formatMediaLicense,
  formatPerImagePrice,
  formatPerSecondPrice,
  formatResolution,
  type MediaCompareBreakdown,
  type MediaCompareRow,
  type MediaKind,
  type MediaModel,
} from "@/lib/media-models";
import { cn } from "@/lib/utils";

function sideTone(
  winner: "a" | "b" | "tie" | "na" | undefined,
  side: "a" | "b"
) {
  if (!winner || winner === "na" || winner === "tie") return "";
  if (winner === side) return "font-semibold text-foreground";
  return "text-muted-foreground";
}

const ROW_GROUP_ORDER = ["arena", "spec", "speed", "pricing"] as const;

const ROW_GROUP_LABELS: Record<(typeof ROW_GROUP_ORDER)[number], string> = {
  arena: "Arena",
  spec: "Specs",
  speed: "Speed",
  pricing: "Pricing",
};

function groupRows(rows: MediaCompareRow[]) {
  return ROW_GROUP_ORDER.map((cat) => ({
    cat,
    label: ROW_GROUP_LABELS[cat],
    rows: rows.filter((r) => r.category === cat),
  })).filter((g) => g.rows.length > 0);
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
  kind,
  model,
  tone,
}: {
  kind: MediaKind;
  model: MediaModel;
  tone: "a" | "b";
}) {
  const color =
    tone === "a"
      ? "text-[color:var(--compare-a)]"
      : "text-[color:var(--compare-b)]";
  const image = kind === "image" ? (model as ImageModel) : null;
  const video = kind === "video" ? (model as VideoModel) : null;

  return (
    <div>
      <h2 className={cn("text-sm font-semibold", color)}>{model.name}</h2>
      <dl className="mt-2 space-y-1 text-sm text-muted-foreground">
        <div className="flex justify-between gap-4">
          <dt>Max resolution</dt>
          <dd className="font-mono tabular-nums text-foreground">
            {formatResolution(model.specs.maxResolution)}
          </dd>
        </div>
        {video ? (
          <div className="flex justify-between gap-4">
            <dt>Max duration</dt>
            <dd className="font-mono tabular-nums text-foreground">
              {formatDurationSeconds(video.specs.maxDurationSeconds)}
            </dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-4">
          <dt>Price</dt>
          <dd className="font-mono tabular-nums text-foreground">
            {image
              ? formatPerImagePrice(image.pricing?.perImage)
              : formatPerSecondPrice(video?.pricing?.perSecond)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>License</dt>
          <dd className="text-right text-foreground">
            {formatMediaLicense(model)}
          </dd>
        </div>
        <p className="pt-2 text-pretty">{model.summary}</p>
      </dl>
    </div>
  );
}

export function MediaCompareView({
  kind,
  a,
  b,
  breakdown,
  verdict,
}: {
  kind: MediaKind;
  a: MediaModel;
  b: MediaModel;
  breakdown: MediaCompareBreakdown;
  verdict: string;
}) {
  const { points, wins, categoryWins, rows, highlights, overallLead } =
    breakdown;
  const groupedRows = groupRows(rows);
  const catalogPath = `/${kind}`;
  const catalogLabel = kind === "image" ? "Image models" : "Video models";
  const comparePickerPath = `/${kind}/compare`;
  const scoredRows = rows.filter((r) => r.winner !== "na");

  const metaRows = [
    { label: "Organization", left: a.organization, right: b.organization },
    {
      label: "License",
      left: formatMediaLicense(a),
      right: formatMediaLicense(b),
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
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link
          href={catalogPath}
          className="hover:text-foreground hover:underline"
        >
          {catalogLabel}
        </Link>
        <span className="mx-2 text-border">/</span>
        <Link
          href={comparePickerPath}
          className="hover:text-foreground hover:underline"
        >
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
          </p>
          <h1 className="mt-1 flex items-center gap-2.5 text-2xl font-semibold tracking-tight sm:text-3xl">
            <OrgIcon organization={a.organization} size="lg" />
            <Link
              href={`/${kind}/${a.slug}`}
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
          </p>
          <h1 className="mt-1 flex items-center gap-2.5 text-2xl font-semibold tracking-tight sm:justify-end sm:text-3xl">
            <OrgIcon organization={b.organization} size="lg" />
            <Link
              href={`/${kind}/${b.slug}`}
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
            <span className="text-[color:var(--compare-a)]">{points.a}</span>
            <span className="mx-2 text-muted-foreground">:</span>
            <span className="text-[color:var(--compare-b)]">{points.b}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            weighted points ({wins.a}:{wins.b} metric wins, {wins.ties} ties
            across {scoredRows.length} scored). Arena Elo and specs outweigh
            price.{" "}
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
        <p className="mt-2 text-base text-pretty leading-relaxed">{verdict}</p>
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
                      {row.weight > 1 ? (
                        <span className="ml-1 text-[10px] text-muted-foreground/80">
                          ×{row.weight}
                        </span>
                      ) : null}
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
        <SideSummary kind={kind} model={a} tone="a" />
        <SideSummary kind={kind} model={b} tone="b" />
      </section>

      <p className="text-sm text-muted-foreground">
        <Link
          href={comparePickerPath}
          className="text-open underline-offset-4 hover:underline"
        >
          Pick a different pair
        </Link>
        {" · "}
        <Link
          href={catalogPath}
          className="underline-offset-4 hover:underline"
        >
          Back to {kind} catalog
        </Link>
      </p>
    </div>
  );
}
