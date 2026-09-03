"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown, Zap } from "lucide-react";
import type { BenchmarkId, Model } from "@/data/types";
import { BENCHMARKS } from "@/data/benchmarks";
import {
  formatZScore,
  LLMCOMPARE_INDEX,
  type IndexScore,
} from "@/lib/benchmark-composite";
import {
  CATALOG_VIEWS,
  catalogBenchmarkIds,
  catalogDefaultSort,
  catalogGroups,
  catalogShowGroupHeaders,
  catalogShowsIndex,
  catalogShowsSpecs,
  catalogViewHint,
  heatStyle,
  isCatalogViewId,
  isKnownBenchmarkId,
  type CatalogViewId,
} from "@/lib/catalog-views";
import {
  formatContext,
  formatRateWithOffPeak,
  formatScore,
  MISSING,
} from "@/lib/models";
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
import { MODEL_FAMILIES, modelFamilyId } from "@/lib/model-family";
import { getModelThinking, highestThinkingLevel } from "@/lib/thinking";

type SortKey =
  | "name"
  | "organization"
  | "contextWindow"
  | "input"
  | "output"
  | "tokensPerSec"
  | "llmcompare-index"
  | BenchmarkId;

type CatalogState = {
  query: string;
  org: string;
  family: string;
  license: "all" | "open" | "closed";
  modality: string;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  view: CatalogViewId;
};

function CatalogThinkingLabel({ model }: { model: Model }) {
  const thinking = getModelThinking(model);
  if (!thinking) return null;
  return (
    <span className="font-mono text-[11px] font-normal text-muted-foreground">
      {highestThinkingLevel(thinking).label}
    </span>
  );
}

function FastModeBadge() {
  return (
    <Zap
      className="size-3.5 shrink-0 fill-amber-400 text-amber-500"
      aria-label="Fast/turbo mode available via API"
    />
  );
}

function compareValues(
  a: Model,
  b: Model,
  key: SortKey,
  dir: "asc" | "desc",
  indexScores?: Record<string, IndexScore>
): number {
  const mul = dir === "asc" ? 1 : -1;
  const num = (v: number | undefined) =>
    v === undefined ? (dir === "asc" ? Infinity : -Infinity) : v;

  switch (key) {
    case LLMCOMPARE_INDEX.id:
      return (
        mul *
        (num(indexScores?.[a.slug]?.zScore) -
          num(indexScores?.[b.slug]?.zScore))
      );
    case "name":
      return mul * a.name.localeCompare(b.name);
    case "organization":
      return mul * a.organization.localeCompare(b.organization);
    case "contextWindow":
      return mul * (a.contextWindow - b.contextWindow);
    case "input":
      return mul * (num(a.pricing?.inputPer1M) - num(b.pricing?.inputPer1M));
    case "output":
      return mul * (num(a.pricing?.outputPer1M) - num(b.pricing?.outputPer1M));
    case "tokensPerSec":
      return mul * (num(a.speed?.tokensPerSec) - num(b.speed?.tokensPerSec));
    default:
      return mul * (num(a.benchmarks[key]) - num(b.benchmarks[key]));
  }
}

function isSortKey(value: string | null, hasIndex: boolean): value is SortKey {
  if (!value) return false;
  if (
    value === "name" ||
    value === "organization" ||
    value === "contextWindow" ||
    value === "input" ||
    value === "output" ||
    value === "tokensPerSec"
  ) {
    return true;
  }
  if (value === LLMCOMPARE_INDEX.id) return hasIndex;
  return isKnownBenchmarkId(value);
}

function parseState(
  params: URLSearchParams,
  hasIndex: boolean
): CatalogState {
  const viewRaw = params.get("view");
  const view: CatalogViewId = isCatalogViewId(viewRaw) ? viewRaw : "overview";
  const sortRaw = params.get("sort");
  const dirRaw = params.get("dir");
  const licenseRaw = params.get("license");
  const license =
    licenseRaw === "open" || licenseRaw === "closed" ? licenseRaw : "all";

  return {
    query: params.get("q") ?? "",
    org: params.get("org") ?? "all",
    family: params.get("family") ?? "all",
    license,
    modality: params.get("modality") ?? "all",
    view,
    sortKey: isSortKey(sortRaw, hasIndex)
      ? sortRaw
      : (catalogDefaultSort(view) as SortKey),
    sortDir: dirRaw === "asc" || dirRaw === "desc" ? dirRaw : "desc",
  };
}

function serializeState(state: CatalogState, hasIndex: boolean): string {
  const params = new URLSearchParams();
  if (state.view !== "overview") params.set("view", state.view);
  if (state.query.trim()) params.set("q", state.query.trim());
  if (state.org !== "all") params.set("org", state.org);
  if (state.family !== "all") params.set("family", state.family);
  if (state.license !== "all") params.set("license", state.license);
  if (state.modality !== "all") params.set("modality", state.modality);
  const defaultSort = catalogDefaultSort(state.view);
  const sortIsDefault =
    state.sortKey === defaultSort ||
    (defaultSort === LLMCOMPARE_INDEX.id &&
      !hasIndex &&
      state.sortKey === "lmarena-elo");
  if (!sortIsDefault) params.set("sort", state.sortKey);
  const defaultDir =
    state.sortKey === "name" || state.sortKey === "organization"
      ? "asc"
      : "desc";
  if (state.sortDir !== defaultDir) params.set("dir", state.sortDir);
  return params.toString();
}

function sortIsVisible(
  key: SortKey,
  view: CatalogViewId,
  showIndex: boolean,
  showSpecs: boolean
): boolean {
  if (key === "name" || key === "organization") return true;
  if (
    key === "contextWindow" ||
    key === "input" ||
    key === "output" ||
    key === "tokensPerSec"
  ) {
    return showSpecs;
  }
  if (key === LLMCOMPARE_INDEX.id) return showIndex;
  return catalogBenchmarkIds(view).includes(key);
}

const stickyHead =
  "sticky top-0 z-20 bg-background shadow-[0_1px_0_0_var(--border)]";
const stickyFirstHead =
  "sticky left-0 top-0 z-30 bg-background shadow-[1px_0_0_0_var(--border),0_1px_0_0_var(--border)]";
const stickyFirstCell =
  "sticky left-0 z-10 bg-background shadow-[1px_0_0_0_var(--border)] group-hover:bg-muted/50";

export function ModelsTable({
  models,
  organizations,
  indexScores,
}: {
  models: Model[];
  organizations: string[];
  indexScores?: Record<string, IndexScore>;
}) {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground">Loading catalog…</p>
      }
    >
      <ModelsTableClient
        models={models}
        organizations={organizations}
        indexScores={indexScores}
      />
    </Suspense>
  );
}

function ModelsTableClient({
  models,
  organizations,
  indexScores,
}: {
  models: Model[];
  organizations: string[];
  indexScores?: Record<string, IndexScore>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasIndex = Boolean(indexScores);
  // First paint always uses defaults so static HTML matches hydration.
  // URL query is applied after mount (shared ?view= links still work).
  const [state, setState] = useState<CatalogState>(() =>
    parseState(new URLSearchParams(), hasIndex)
  );
  // null until the URL has been read once, so the first paint does not
  // clobber a shared ?view= link with overview defaults.
  const lastWritten = useRef<string | null>(null);

  useEffect(() => {
    const parsed = parseState(searchParams, hasIndex);
    const qs = serializeState(parsed, hasIndex);
    if (lastWritten.current === qs) return;
    lastWritten.current = qs;
    setState((prev) =>
      serializeState(prev, hasIndex) === qs ? prev : parsed
    );
  }, [searchParams, hasIndex]);

  useEffect(() => {
    const qs = serializeState(state, hasIndex);
    if (lastWritten.current === null || lastWritten.current !== qs) return;
    const urlQs = serializeState(parseState(searchParams, hasIndex), hasIndex);
    if (urlQs === qs) return;
    const hash = pathname === "/" ? "#catalog" : "";
    const href = qs ? `${pathname}?${qs}${hash}` : `${pathname}${hash}`;
    router.replace(href, { scroll: false });
  }, [state, hasIndex, pathname, router, searchParams]);

  const update = useCallback(
    (patch: Partial<CatalogState>) => {
      setState((prev) => {
        const next = { ...prev, ...patch };
        lastWritten.current = serializeState(next, hasIndex);
        return next;
      });
    },
    [hasIndex]
  );

  const { query, org, family, license, modality, sortKey, sortDir, view } =
    state;

  const showSpecs = catalogShowsSpecs(view);
  const showIndex = catalogShowsIndex(view) && hasIndex;
  const groups = catalogGroups(view);
  const benches = catalogBenchmarkIds(view);
  const showGroups = catalogShowGroupHeaders(view);

  const familyOptions = useMemo(() => {
    const present = new Set(models.map(modelFamilyId));
    return MODEL_FAMILIES.filter((f) => present.has(f.id));
  }, [models]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return models
      .filter((m) => {
        if (org !== "all" && m.organization !== org) return false;
        if (family !== "all" && modelFamilyId(m) !== family) return false;
        if (license === "open" && !m.openSource) return false;
        if (license === "closed" && m.openSource) return false;
        if (modality !== "all") {
          const all = [...m.modalities.input, ...m.modalities.output];
          if (!all.includes(modality)) return false;
        }
        if (!q) return true;
        return (
          m.name.toLowerCase().includes(q) ||
          m.organization.toLowerCase().includes(q) ||
          m.slug.includes(q)
        );
      })
      .sort((a, b) => compareValues(a, b, sortKey, sortDir, indexScores));
  }, [
    models,
    query,
    org,
    family,
    license,
    modality,
    sortKey,
    sortDir,
    indexScores,
  ]);

  const heat = useMemo(() => {
    const cols: Record<string, number[]> = {};
    const collect = (key: string, value: number | undefined) => {
      if (value === undefined) return;
      (cols[key] ??= []).push(value);
    };
    for (const m of filtered) {
      if (showSpecs) {
        collect("contextWindow", m.contextWindow);
        collect("input", m.pricing?.inputPer1M);
        collect("output", m.pricing?.outputPer1M);
        collect("tokensPerSec", m.speed?.tokensPerSec);
      }
      if (showIndex) collect(LLMCOMPARE_INDEX.id, indexScores?.[m.slug]?.zScore);
      for (const id of benches) collect(id, m.benchmarks[id]);
    }
    return cols;
  }, [filtered, showSpecs, showIndex, benches, indexScores]);

  function setView(next: CatalogViewId) {
    const nextShowSpecs = catalogShowsSpecs(next);
    const nextShowIndex = catalogShowsIndex(next) && hasIndex;
    const keepSort = sortIsVisible(
      sortKey,
      next,
      nextShowIndex,
      nextShowSpecs
    );
    let nextSort: SortKey = keepSort
      ? sortKey
      : (catalogDefaultSort(next) as SortKey);
    if (nextSort === LLMCOMPARE_INDEX.id && !nextShowIndex) {
      nextSort = "lmarena-elo";
    }
    update({
      view: next,
      sortKey: nextSort,
      sortDir: keepSort
        ? sortDir
        : nextSort === "name" || nextSort === "organization"
          ? "asc"
          : "desc",
    });
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      update({ sortDir: sortDir === "asc" ? "desc" : "asc" });
    } else {
      update({
        sortKey: key,
        sortDir: key === "name" || key === "organization" ? "asc" : "desc",
      });
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

  const identityCols = 3;
  const specCols = (showSpecs ? 3 : 0) + (showIndex ? 1 : 0);
  const leadingCols = identityCols + specCols;
  const trailingCols = showSpecs ? 1 : 0;
  const colCount = leadingCols + benches.length + trailingCols;

  const filtersActive =
    query.trim() !== "" ||
    org !== "all" ||
    family !== "all" ||
    license !== "all" ||
    modality !== "all";

  const showOrgFilter = organizations.length > 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Input
          value={query}
          onChange={(e) => update({ query: e.target.value })}
          placeholder="Filter by name or org…"
          className="h-9 sm:max-w-xs"
        />
        {showOrgFilter ? (
          <Select value={org} onValueChange={(v) => update({ org: v })}>
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
        ) : null}
        <Select value={family} onValueChange={(v) => update({ family: v })}>
          <SelectTrigger className="h-9 w-full sm:w-48">
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
          onValueChange={(v) =>
            update({ license: v as CatalogState["license"] })
          }
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
        <Select
          value={modality}
          onValueChange={(v) => update({ modality: v })}
        >
          <SelectTrigger className="h-9 w-full sm:w-36">
            <SelectValue placeholder="Modality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any modality</SelectItem>
            <SelectItem value="image">Image input</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="video">Video</SelectItem>
          </SelectContent>
        </Select>
        {filtersActive ? (
          <button
            type="button"
            className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            onClick={() =>
              update({
                query: "",
                org: "all",
                family: "all",
                license: "all",
                modality: "all",
              })
            }
          >
            Clear filters
          </button>
        ) : null}
        <p className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">
          {filtered.length} / {models.length} models
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <div
          role="tablist"
          aria-label="Catalog columns"
          className="flex flex-wrap gap-x-3 gap-y-1 text-sm"
        >
          {CATALOG_VIEWS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={view === item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "underline-offset-4 hover:text-foreground",
                view === item.id
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{catalogViewHint(view)}</p>
      </div>

      <ul className="divide-y divide-border md:hidden">
        {filtered.map((m) => (
          <li key={m.slug}>
            <Link
              href={`/models/${m.slug}`}
              prefetch={false}
              className="flex flex-col gap-1 py-3"
            >
              <span className="inline-flex items-center gap-2 font-medium">
                <OrgIcon organization={m.organization} size="md" />
                {m.name}
                {m.fast ? <FastModeBadge /> : null}
                <OpenBadge openSource={m.openSource} className="ml-auto" />
              </span>
              <span className="flex flex-wrap gap-x-3 font-mono text-xs tabular-nums text-muted-foreground">
                <span>{m.organization}</span>
                <span>{formatContext(m.contextWindow)}</span>
                <span>
                  {formatRateWithOffPeak(
                    m.pricing?.inputPer1M,
                    m.pricing?.offPeak?.inputPer1M
                  )}
                </span>
                {indexScores?.[m.slug] ? (
                  <span>LC {formatZScore(indexScores[m.slug].zScore)}</span>
                ) : null}
                {m.benchmarks["lmarena-elo"] !== undefined ? (
                  <span>
                    Arena {formatScore("lmarena-elo", m.benchmarks["lmarena-elo"])}
                  </span>
                ) : null}
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
              {showGroups ? (
                <TableRow className="hover:bg-transparent">
                  <TableHead
                    colSpan={leadingCols}
                    className={cn(
                      stickyFirstHead,
                      "font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                    )}
                  />
                  {groups.map((group) => (
                    <TableHead
                      key={group.id}
                      colSpan={group.ids.length}
                      className={cn(
                        stickyHead,
                        "font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                      )}
                    >
                      {group.label}
                    </TableHead>
                  ))}
                  {showSpecs ? (
                    <TableHead className={stickyHead} />
                  ) : null}
                </TableRow>
              ) : null}
              <TableRow className="hover:bg-transparent">
                <TableHead
                  className={cn(headClass, stickyFirstHead)}
                  onClick={() => toggleSort("name")}
                >
                  Model
                  {sortIcon("name")}
                </TableHead>
                <TableHead
                  className={cn(headClass, stickyHead)}
                  onClick={() => toggleSort("organization")}
                >
                  Org
                  {sortIcon("organization")}
                </TableHead>
                <TableHead
                  className={cn(
                    stickyHead,
                    "font-mono text-[11px] uppercase tracking-wider text-muted-foreground"
                  )}
                >
                  Type
                </TableHead>
                {showSpecs ? (
                  <>
                    <TableHead
                      className={cn(headClass, stickyHead, "text-right")}
                      onClick={() => toggleSort("contextWindow")}
                    >
                      Ctx
                      {sortIcon("contextWindow")}
                    </TableHead>
                    <TableHead
                      className={cn(headClass, stickyHead, "text-right")}
                      onClick={() => toggleSort("input")}
                    >
                      In $/1M
                      {sortIcon("input")}
                    </TableHead>
                    <TableHead
                      className={cn(headClass, stickyHead, "text-right")}
                      onClick={() => toggleSort("output")}
                    >
                      Out $/1M
                      {sortIcon("output")}
                    </TableHead>
                  </>
                ) : null}
                {showIndex ? (
                  <TableHead
                    className={cn(headClass, stickyHead, "text-right")}
                    onClick={() => toggleSort(LLMCOMPARE_INDEX.id)}
                    title={`${LLMCOMPARE_INDEX.name} — site-computed composite across all benchmarks`}
                  >
                    {LLMCOMPARE_INDEX.shortName}
                    {sortIcon(LLMCOMPARE_INDEX.id)}
                  </TableHead>
                ) : null}
                {benches.map((id) => (
                  <TableHead
                    key={id}
                    className={cn(headClass, stickyHead, "text-right")}
                    onClick={() => toggleSort(id)}
                    title={BENCHMARKS[id].name}
                  >
                    {BENCHMARKS[id].shortName}
                    {sortIcon(id)}
                  </TableHead>
                ))}
                {showSpecs ? (
                  <TableHead
                    className={cn(headClass, stickyHead, "text-right")}
                    onClick={() => toggleSort("tokensPerSec")}
                  >
                    tok/s
                    {sortIcon("tokensPerSec")}
                  </TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.slug} className="group">
                  <TableCell
                    className={cn(stickyFirstCell, "font-medium whitespace-nowrap")}
                  >
                    <Link
                      href={`/models/${m.slug}`}
                      prefetch={false}
                      className="inline-flex items-center gap-2 hover:underline"
                    >
                      <OrgIcon organization={m.organization} size="md" />
                      {m.name}
                      {m.fast ? <FastModeBadge /> : null}
                      <CatalogThinkingLabel model={m} />
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {m.organization}
                  </TableCell>
                  <TableCell>
                    <OpenBadge openSource={m.openSource} />
                  </TableCell>
                  {showSpecs ? (
                    <>
                      <TableCell
                        className="text-right font-mono tabular-nums"
                        style={heatStyle(
                          m.contextWindow,
                          heat.contextWindow ?? [],
                          true
                        )}
                      >
                        {formatContext(m.contextWindow)}
                      </TableCell>
                      <TableCell
                        className="text-right font-mono tabular-nums"
                        style={heatStyle(
                          m.pricing?.inputPer1M,
                          heat.input ?? [],
                          false
                        )}
                      >
                        {formatRateWithOffPeak(
                          m.pricing?.inputPer1M,
                          m.pricing?.offPeak?.inputPer1M
                        )}
                      </TableCell>
                      <TableCell
                        className="text-right font-mono tabular-nums"
                        style={heatStyle(
                          m.pricing?.outputPer1M,
                          heat.output ?? [],
                          false
                        )}
                      >
                        {formatRateWithOffPeak(
                          m.pricing?.outputPer1M,
                          m.pricing?.offPeak?.outputPer1M
                        )}
                      </TableCell>
                    </>
                  ) : null}
                  {showIndex ? (
                    <TableCell
                      className="text-right font-mono tabular-nums"
                      style={heatStyle(
                        indexScores?.[m.slug]?.zScore,
                        heat[LLMCOMPARE_INDEX.id] ?? [],
                        true
                      )}
                    >
                      {indexScores?.[m.slug]
                        ? formatZScore(indexScores[m.slug].zScore)
                        : MISSING}
                    </TableCell>
                  ) : null}
                  {benches.map((id) => {
                    const value = m.benchmarks[id];
                    return (
                      <TableCell
                        key={id}
                        className={cn(
                          "text-right font-mono tabular-nums",
                          value === undefined && "text-muted-foreground/40"
                        )}
                        style={heatStyle(
                          value,
                          heat[id] ?? [],
                          BENCHMARKS[id].higherIsBetter
                        )}
                      >
                        {formatScore(id, value)}
                      </TableCell>
                    );
                  })}
                  {showSpecs ? (
                    <TableCell
                      className="text-right font-mono tabular-nums text-muted-foreground"
                      style={heatStyle(
                        m.speed?.tokensPerSec,
                        heat.tokensPerSec ?? [],
                        true
                      )}
                    >
                      {m.speed?.tokensPerSec ?? MISSING}
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={Math.max(colCount, 1)}
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
