"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { BenchmarkId, Model } from "@/data/types";
import { BENCHMARKS } from "@/data/benchmarks";
import {
  formatContext,
  formatPrice,
  formatScore,
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

type SortKey =
  | "name"
  | "organization"
  | "contextWindow"
  | "input"
  | "output"
  | "tokensPerSec"
  | BenchmarkId;

const TABLE_BENCHMARKS: BenchmarkId[] = [
  "mmlu-pro",
  "gpqa-diamond",
  "aime-2025",
  "swe-bench-verified",
  "swe-bench-pro",
  "terminal-bench-2-1",
  "cursorbench",
  "aider-polyglot",
  "lmarena-elo",
  "arena-hard",
];

function compareValues(
  a: Model,
  b: Model,
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

export function ModelsTable({
  models,
  organizations,
}: {
  models: Model[];
  organizations: string[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [org, setOrg] = useState<string>("all");
  const [family, setFamily] = useState<string>("all");
  const [license, setLicense] = useState<"all" | "open" | "closed">("all");
  const [modality, setModality] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("lmarena-elo");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

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
      .sort((a, b) => compareValues(a, b, sortKey, sortDir));
  }, [models, query, org, family, license, modality, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(
        key === "name" || key === "organization" ? "asc" : "desc"
      );
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
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
        <Select value={family} onValueChange={setFamily}>
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
        <Select value={modality} onValueChange={setModality}>
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
        <p className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">
          {filtered.length} / {models.length} models
        </p>
      </div>

      <div className="overflow-x-auto border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead
                className={headClass}
                onClick={() => toggleSort("name")}
              >
                Model
                <SortIcon col="name" />
              </TableHead>
              <TableHead
                className={headClass}
                onClick={() => toggleSort("organization")}
              >
                Org
                <SortIcon col="organization" />
              </TableHead>
              <TableHead className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Type
              </TableHead>
              <TableHead
                className={cn(headClass, "text-right")}
                onClick={() => toggleSort("contextWindow")}
              >
                Ctx
                <SortIcon col="contextWindow" />
              </TableHead>
              <TableHead
                className={cn(headClass, "text-right")}
                onClick={() => toggleSort("input")}
              >
                In $/1M
                <SortIcon col="input" />
              </TableHead>
              <TableHead
                className={cn(headClass, "text-right")}
                onClick={() => toggleSort("output")}
              >
                Out $/1M
                <SortIcon col="output" />
              </TableHead>
              {TABLE_BENCHMARKS.map((id) => (
                <TableHead
                  key={id}
                  className={cn(headClass, "text-right")}
                  onClick={() => toggleSort(id)}
                >
                  {BENCHMARKS[id].shortName}
                  <SortIcon col={id} />
                </TableHead>
              ))}
              <TableHead
                className={cn(headClass, "text-right")}
                onClick={() => toggleSort("tokensPerSec")}
              >
                tok/s
                <SortIcon col="tokensPerSec" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => (
              <TableRow
                key={m.slug}
                className="cursor-pointer"
                onClick={() =>
                  startTransition(() => router.push(`/models/${m.slug}`))
                }
              >
                <TableCell className="font-medium whitespace-nowrap">
                  <span className="inline-flex items-center gap-2">
                    <OrgIcon organization={m.organization} size="md" />
                    {m.name}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {m.organization}
                </TableCell>
                <TableCell>
                  <OpenBadge openSource={m.openSource} />
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatContext(m.contextWindow)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatPrice(m.pricing?.inputPer1M)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatPrice(m.pricing?.outputPer1M)}
                </TableCell>
                {TABLE_BENCHMARKS.map((id) => (
                  <TableCell
                    key={id}
                    className="text-right font-mono tabular-nums"
                  >
                    {formatScore(id, m.benchmarks[id])}
                  </TableCell>
                ))}
                <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                  {m.speed?.tokensPerSec ?? "-"}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8 + TABLE_BENCHMARKS.length}
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
  );
}
