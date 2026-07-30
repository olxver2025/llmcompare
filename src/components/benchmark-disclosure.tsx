"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { OpenBadge } from "@/components/open-badge";
import { OrgIcon } from "@/components/org-icon";
import { cn } from "@/lib/utils";

export type BenchmarkLeaderboardRow = {
  slug: string;
  name: string;
  organization: string;
  openSource: boolean;
  rank: number;
  scoreLabel: string;
};

export function BenchmarkDisclosure({
  id,
  name,
  description,
  sourceUrl,
  scored,
  rows,
  defaultOpen = false,
}: {
  id: string;
  name: string;
  description: string;
  sourceUrl: string;
  scored: number;
  rows: BenchmarkLeaderboardRow[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const panelId = `benchmark-${id}-panel`;

  React.useEffect(() => {
    const expandIfHash = () => {
      if (window.location.hash === `#${id}`) setOpen(true);
    };
    expandIfHash();
    window.addEventListener("hashchange", expandIfHash);
    return () => window.removeEventListener("hashchange", expandIfHash);
  }, [id]);

  return (
    <article id={id} className="scroll-mt-16 max-w-3xl">
      <div className="mb-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="min-w-0 flex-1 text-lg font-semibold tracking-tight">
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((v) => !v)}
              className="group flex w-full items-baseline gap-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ChevronDown
                aria-hidden
                className={cn(
                  "mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                  open && "rotate-180"
                )}
              />
              <span className="group-hover:underline group-hover:underline-offset-4">
                {name}
              </span>
            </button>
          </h3>
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            source
          </a>
        </div>
        <p className="mt-1.5 pl-6 text-sm text-muted-foreground text-pretty">
          {description}
        </p>
        <p className="mt-1 pl-6 font-mono text-xs tabular-nums text-muted-foreground">
          {scored} model{scored === 1 ? "" : "s"} scored · top{" "}
          {Math.min(10, scored) || 0} shown
        </p>
      </div>

      <div id={panelId} role="region" hidden={!open}>
        {rows.length === 0 ? (
          <p className="pl-6 text-sm text-muted-foreground">
            No verified scores in the catalog yet.
          </p>
        ) : (
          <ol className="border-t border-border">
            {rows.map((row) => (
              <li
                key={row.slug}
                className="flex items-center gap-3 border-b border-border py-2.5"
              >
                <span className="w-7 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                  {row.rank}
                </span>
                <OrgIcon organization={row.organization} size="sm" />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/models/${row.slug}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {row.name}
                  </Link>
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    <span>{row.organization}</span>
                    <OpenBadge openSource={row.openSource} />
                  </p>
                </div>
                <span className="shrink-0 font-mono text-sm font-medium tabular-nums">
                  {row.scoreLabel}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </article>
  );
}
