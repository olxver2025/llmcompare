"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ImageModel, VideoModel } from "@/data/types";
import {
  formatDate,
  formatDurationSeconds,
  formatMediaScore,
  formatPerImagePrice,
  formatPerSecondPrice,
  formatResolution,
} from "@/lib/media-models";
import { OpenBadge } from "@/components/open-badge";
import { OrgIcon } from "@/components/org-icon";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type MediaKind = "image" | "video";
type MediaModel = ImageModel | VideoModel;

type SortKey =
  | "name"
  | "organization"
  | "maxRes"
  | "price"
  | "elo"
  | "speed"
  | "release"
  | "maxDuration";

function resolutionArea(m: MediaModel): number {
  return m.specs.maxResolution.width * m.specs.maxResolution.height;
}

function priceOf(kind: MediaKind, m: MediaModel): number | undefined {
  if (kind === "image") {
    return (m as ImageModel).pricing?.perImage;
  }
  return (m as VideoModel).pricing?.perSecond;
}

function eloOf(kind: MediaKind, m: MediaModel): number | undefined {
  if (kind === "image") {
    return (m as ImageModel).benchmarks["image-arena-elo"];
  }
  return (m as VideoModel).benchmarks["video-arena-elo"];
}

function speedOf(kind: MediaKind, m: MediaModel): number | undefined {
  if (kind === "image") {
    return (m as ImageModel).specs.secondsPerImage;
  }
  return (m as VideoModel).specs.secondsPerVideoSecond;
}

function compareValues(
  kind: MediaKind,
  a: MediaModel,
  b: MediaModel,
  key: SortKey,
  dir: "asc" | "desc"
): number {
  const mul = dir === "asc" ? 1 : -1;
  const num = (v: number | undefined) =>
    v === undefined ? (dir === "asc" ? Infinity : -Infinity) : v;

  switch (key) {
    case "name":
      return mul * a.name.localeCompare(b.name);
    case "organization":
      return mul * a.organization.localeCompare(b.organization);
    case "maxRes":
      return mul * (resolutionArea(a) - resolutionArea(b));
    case "price":
      return mul * (num(priceOf(kind, a)) - num(priceOf(kind, b)));
    case "elo":
      return mul * (num(eloOf(kind, a)) - num(eloOf(kind, b)));
    case "speed":
      return mul * (num(speedOf(kind, a)) - num(speedOf(kind, b)));
    case "release":
      return mul * a.releaseDate.localeCompare(b.releaseDate);
    case "maxDuration":
      return (
        mul *
        ((a as VideoModel).specs.maxDurationSeconds -
          (b as VideoModel).specs.maxDurationSeconds)
      );
  }
}

export function MediaModelsTable({
  kind,
  models,
  organizations,
}: {
  kind: MediaKind;
  models: MediaModel[];
  organizations: string[];
}) {
  const [query, setQuery] = useState("");
  const [org, setOrg] = useState<string>("all");
  const [license, setLicense] = useState<"all" | "open" | "closed">("all");
  const [sortKey, setSortKey] = useState<SortKey>("elo");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return models
      .filter((m) => {
        if (org !== "all" && m.organization !== org) return false;
        if (license === "open" && !m.openSource) return false;
        if (license === "closed" && m.openSource) return false;
        if (!q) return true;
        return (
          m.name.toLowerCase().includes(q) ||
          m.organization.toLowerCase().includes(q) ||
          m.slug.includes(q)
        );
      })
      .sort((a, b) => compareValues(kind, a, b, sortKey, sortDir));
  }, [models, kind, query, org, license, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(
        key === "name" || key === "organization" || key === "release"
          ? "asc"
          : "desc"
      );
    }
  }

  function sortIcon(col: SortKey) {
    if (sortKey !== col)
      return <ArrowUpDown className="ml-1 inline size-3 opacity-40" />;
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 inline size-3 text-open" />
    ) : (
      <ArrowDown className="ml-1 inline size-3 text-open" />
    );
  }

  const headClass =
    "cursor-pointer select-none whitespace-nowrap font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground";

  const label = kind === "image" ? "image models" : "video models";
  const colCount = kind === "video" ? 9 : 8;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name or org…"
          className="h-9 sm:max-w-xs"
        />
        <Select value={org} onValueChange={setOrg}>
          <SelectTrigger className="h-9 w-full sm:w-44">
            <SelectValue placeholder="Organization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All organizations</SelectItem>
            {organizations.map((o) => (
              <SelectItem key={o} value={o}>
                <span className="inline-flex items-center gap-2">
                  <OrgIcon organization={o} size="sm" />
                  {o}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={license}
          onValueChange={(v) => setLicense(v as typeof license)}
        >
          <SelectTrigger className="h-9 w-full sm:w-36">
            <SelectValue placeholder="License" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Open & closed</SelectItem>
            <SelectItem value="open">Open weights</SelectItem>
            <SelectItem value="closed">Proprietary</SelectItem>
          </SelectContent>
        </Select>
        <p className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">
          {filtered.length} / {models.length} {label}
        </p>
      </div>

      <ul className="divide-y divide-border md:hidden">
        {filtered.map((m) => (
          <li key={m.slug}>
            <Link
              href={`/${kind}/${m.slug}`}
              prefetch={false}
              className="flex flex-col gap-1 py-3"
            >
              <span className="inline-flex items-center gap-2 font-medium">
                <OrgIcon organization={m.organization} size="md" />
                {m.name}
                <OpenBadge openSource={m.openSource} className="ml-auto" />
              </span>
              <span className="flex flex-wrap gap-x-3 font-mono text-xs tabular-nums text-muted-foreground">
                <span>{m.organization}</span>
                <span>{formatResolution(m.specs.maxResolution)}</span>
                <span>
                  {kind === "image"
                    ? formatPerImagePrice((m as ImageModel).pricing?.perImage)
                    : formatPerSecondPrice(
                        (m as VideoModel).pricing?.perSecond
                      )}
                </span>
                <span>
                  {formatMediaScore(eloOf(kind, m))}
                </span>
              </span>
            </Link>
          </li>
        ))}
        {filtered.length === 0 ? (
          <li className="py-8 text-center text-sm text-muted-foreground">
            No models match these filters. Clear a filter to widen the catalog.
          </li>
        ) : null}
      </ul>

      <div className="hidden border border-border md:block">
        <div className="max-h-[min(72vh,56rem)] overflow-auto scroll-rail">
        <Table container={false}>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead
                className={cn(
                  headClass,
                  "sticky left-0 top-0 z-30 bg-background shadow-[1px_0_0_0_var(--border),0_1px_0_0_var(--border)]"
                )}
                onClick={() => toggleSort("name")}
              >
                Model
                {sortIcon("name")}
              </TableHead>
              <TableHead
                className={cn(
                  headClass,
                  "sticky top-0 z-20 bg-background shadow-[0_1px_0_0_var(--border)]"
                )}
                onClick={() => toggleSort("organization")}
              >
                Org
                {sortIcon("organization")}
              </TableHead>
              <TableHead className="sticky top-0 z-20 bg-background font-mono text-[11px] uppercase tracking-wider text-muted-foreground shadow-[0_1px_0_0_var(--border)]">
                Type
              </TableHead>
              <TableHead
                className={cn(
                  headClass,
                  "sticky top-0 z-20 bg-background text-right shadow-[0_1px_0_0_var(--border)]"
                )}
                onClick={() => toggleSort("maxRes")}
              >
                Max res
                {sortIcon("maxRes")}
              </TableHead>
              {kind === "video" ? (
                <TableHead
                  className={cn(
                    headClass,
                    "sticky top-0 z-20 bg-background text-right shadow-[0_1px_0_0_var(--border)]"
                  )}
                  onClick={() => toggleSort("maxDuration")}
                >
                  Max duration
                  {sortIcon("maxDuration")}
                </TableHead>
              ) : null}
              <TableHead
                className={cn(
                  headClass,
                  "sticky top-0 z-20 bg-background text-right shadow-[0_1px_0_0_var(--border)]"
                )}
                onClick={() => toggleSort("price")}
              >
                {kind === "image" ? "$/image" : "$/s"}
                {sortIcon("price")}
              </TableHead>
              <TableHead
                className={cn(
                  headClass,
                  "sticky top-0 z-20 bg-background text-right shadow-[0_1px_0_0_var(--border)]"
                )}
                onClick={() => toggleSort("elo")}
              >
                Arena Elo
                {sortIcon("elo")}
              </TableHead>
              <TableHead
                className={cn(
                  headClass,
                  "sticky top-0 z-20 bg-background text-right shadow-[0_1px_0_0_var(--border)]"
                )}
                onClick={() => toggleSort("speed")}
              >
                {kind === "image" ? "s/image" : "s/s"}
                {sortIcon("speed")}
              </TableHead>
              <TableHead
                className={cn(
                  headClass,
                  "sticky top-0 z-20 bg-background text-right shadow-[0_1px_0_0_var(--border)]"
                )}
                onClick={() => toggleSort("release")}
              >
                Release
                {sortIcon("release")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => (
              <TableRow key={m.slug} className="group">
                <TableCell className="sticky left-0 z-10 bg-background font-medium whitespace-nowrap shadow-[1px_0_0_0_var(--border)] group-hover:bg-muted/50">
                  <Link
                    href={`/${kind}/${m.slug}`}
                    prefetch={false}
                    className="inline-flex items-center gap-2 hover:underline"
                  >
                    <OrgIcon organization={m.organization} size="md" />
                    {m.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {m.organization}
                </TableCell>
                <TableCell>
                  <OpenBadge openSource={m.openSource} />
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums whitespace-nowrap">
                  {formatResolution(m.specs.maxResolution)}
                </TableCell>
                {kind === "video" ? (
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatDurationSeconds(
                      (m as VideoModel).specs.maxDurationSeconds
                    )}
                  </TableCell>
                ) : null}
                <TableCell className="text-right font-mono tabular-nums whitespace-nowrap">
                  {kind === "image"
                    ? formatPerImagePrice((m as ImageModel).pricing?.perImage)
                    : formatPerSecondPrice(
                        (m as VideoModel).pricing?.perSecond
                      )}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatMediaScore(eloOf(kind, m))}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                  {speedOf(kind, m) ?? "—"}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-muted-foreground whitespace-nowrap">
                  {formatDate(m.releaseDate)}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={colCount}
                  className="h-24 text-center text-muted-foreground"
                >
                  No models match these filters. Clear a filter to widen the
                  catalog.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  );
}