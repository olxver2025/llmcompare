"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Model } from "@/data/types";
import { formatDate, formatScore, MISSING } from "@/lib/models";
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

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function dayOfMonth(iso: string): string {
  return String(Number(iso.slice(8, 10)));
}

export function ReleasesTable({
  models,
  organizations,
}: {
  models: Model[];
  organizations: string[];
}) {
  const [query, setQuery] = useState("");
  const [org, setOrg] = useState<string>("all");
  const [license, setLicense] = useState<"all" | "open" | "closed">("all");

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
      .sort(
        (a, b) =>
          b.releaseDate.localeCompare(a.releaseDate) ||
          a.name.localeCompare(b.name)
      );
  }, [models, query, org, license]);

  const groups = useMemo(() => {
    const map = new Map<string, Model[]>();
    for (const model of filtered) {
      const key = monthKey(model.releaseDate);
      const list = map.get(key);
      if (list) list.push(model);
      else map.set(key, [model]);
    }
    return [...map.entries()];
  }, [filtered]);

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
          {filtered.length} / {models.length} releases
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No releases match these filters. Clear a filter to widen the list.
        </p>
      ) : (
        <ol className="space-y-10">
          {groups.map(([month, items]) => (
            <li key={month}>
              <h3 className="sticky top-12 z-10 -mx-4 bg-background px-4 py-2 text-sm font-semibold tracking-tight sm:-mx-0 sm:px-0">
                {monthLabel(month)}
              </h3>
              <ol>
                {items.map((m) => (
                  <li
                    key={m.slug}
                    className="border-b border-border last:border-0"
                  >
                    <Link
                      href={`/models/${m.slug}`}
                      prefetch={false}
                      className="flex items-baseline gap-3 py-2.5 text-sm hover:bg-muted/50"
                    >
                      <time
                        dateTime={m.releaseDate}
                        title={formatDate(m.releaseDate)}
                        className="w-6 shrink-0 font-mono text-xs tabular-nums text-muted-foreground"
                      >
                        {dayOfMonth(m.releaseDate)}
                      </time>
                      <span className="inline-flex min-w-0 items-baseline gap-2">
                        <OrgIcon
                          organization={m.organization}
                          size="sm"
                          className="translate-y-0.5"
                        />
                        <span className="truncate font-medium">{m.name}</span>
                      </span>
                      <span className="hidden truncate text-muted-foreground sm:inline">
                        {m.organization}
                      </span>
                      <OpenBadge
                        openSource={m.openSource}
                        className="hidden sm:inline"
                      />
                      <span className="ml-auto shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                        {m.benchmarks["lmarena-elo"] !== undefined
                          ? formatScore(
                              "lmarena-elo",
                              m.benchmarks["lmarena-elo"]
                            )
                          : MISSING}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
