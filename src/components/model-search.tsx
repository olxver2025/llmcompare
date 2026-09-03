"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { BENCHMARKS } from "@/data/benchmarks";
import type { ImageModel, Model, VideoModel } from "@/data/types";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { OpenBadge } from "@/components/open-badge";
import { OrgIcon } from "@/components/org-icon";
import { LLMCOMPARE_INDEX } from "@/lib/benchmark-composite";
import { compareSlug, popularComparePairs } from "@/lib/models";
import { organizationSummaries } from "@/lib/organizations";

const PAGES: { href: string; label: string; keywords: string }[] = [
  { href: "/#catalog", label: "LLM catalog", keywords: "llms models home" },
  { href: "/image", label: "Image models", keywords: "image generation" },
  { href: "/video", label: "Video models", keywords: "video generation" },
  { href: "/benchmarks", label: "Benchmarks", keywords: "leaderboard scores" },
  {
    href: LLMCOMPARE_INDEX.href,
    label: LLMCOMPARE_INDEX.name,
    keywords: "index composite ranking",
  },
  { href: "/releases", label: "Latest releases", keywords: "timeline launches" },
  { href: "/organizations", label: "Organizations", keywords: "providers labs" },
  { href: "/compare", label: "Compare models", keywords: "vs head to head" },
  { href: "/compare/multi", label: "Compare multiple models", keywords: "table" },
  { href: "/api/docs", label: "API documentation", keywords: "rest openapi json" },
];

export function ModelSearch({
  models,
  imageModels,
  videoModels,
}: {
  models: Model[];
  imageModels?: ImageModel[];
  videoModels?: VideoModel[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const orgs = useMemo(() => organizationSummaries(), []);
  const pairs = useMemo(() => {
    const bySlug = new Map(models.map((m) => [m.slug, m]));
    return popularComparePairs()
      .map(([a, b]) => {
        const left = bySlug.get(a);
        const right = bySlug.get(b);
        return left && right ? { left, right } : null;
      })
      .filter((row): row is { left: Model; right: Model } => row !== null);
  }, [models]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-2 border-border bg-background text-muted-foreground shadow-none"
        onClick={() => setOpen(true)}
      >
        <Search className="size-3.5" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="pointer-events-none ml-1 hidden h-5 select-none items-center gap-0.5 rounded-md border bg-muted px-1.5 font-mono text-[10px] font-medium sm:inline-flex">
          ⌘K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Search">
        <CommandInput placeholder="Jump to a model, benchmark, org, or compare…" />
        <CommandList>
          <CommandEmpty>No match.</CommandEmpty>
          <CommandGroup heading="Pages">
            {PAGES.map((page) => (
              <CommandItem
                key={page.href}
                value={`${page.label} ${page.keywords}`}
                onSelect={() => go(page.href)}
              >
                {page.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Models">
            {models.map((m) => (
              <CommandItem
                key={m.slug}
                value={`${m.name} ${m.organization} ${m.slug}`}
                onSelect={() => go(`/models/${m.slug}`)}
                className="gap-3"
              >
                <OrgIcon organization={m.organization} size="md" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">{m.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {m.organization}
                  </span>
                </div>
                <OpenBadge openSource={m.openSource} />
              </CommandItem>
            ))}
          </CommandGroup>
          {imageModels && imageModels.length > 0 ? (
            <CommandGroup heading="Image models">
              {imageModels.map((m) => (
                <CommandItem
                  key={`image-${m.slug}`}
                  value={`image ${m.name} ${m.organization} ${m.slug}`}
                  onSelect={() => go(`/image/${m.slug}`)}
                  className="gap-3"
                >
                  <OrgIcon organization={m.organization} size="md" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium">{m.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {m.organization}
                    </span>
                  </div>
                  <OpenBadge openSource={m.openSource} />
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
          {videoModels && videoModels.length > 0 ? (
            <CommandGroup heading="Video models">
              {videoModels.map((m) => (
                <CommandItem
                  key={`video-${m.slug}`}
                  value={`video ${m.name} ${m.organization} ${m.slug}`}
                  onSelect={() => go(`/video/${m.slug}`)}
                  className="gap-3"
                >
                  <OrgIcon organization={m.organization} size="md" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium">{m.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {m.organization}
                    </span>
                  </div>
                  <OpenBadge openSource={m.openSource} />
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
          <CommandGroup heading="Benchmarks">
            {Object.values(BENCHMARKS).map((b) => (
              <CommandItem
                key={b.id}
                value={`${b.name} ${b.shortName} ${b.id} benchmark`}
                onSelect={() => go(`/benchmarks/${b.id}`)}
              >
                <span className="truncate font-medium">{b.name}</span>
                <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                  {b.shortName}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Organizations">
            {orgs.map((org) => (
              <CommandItem
                key={org.slug}
                value={`${org.name} ${org.slug} organization provider`}
                onSelect={() => go(`/organizations/${org.slug}`)}
                className="gap-3"
              >
                <OrgIcon organization={org.name} size="md" />
                <span className="truncate font-medium">{org.name}</span>
                <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground">
                  {org.modelCount} LLM{org.modelCount === 1 ? "" : "s"}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
          {pairs.length > 0 ? (
            <CommandGroup heading="Compare">
              {pairs.map(({ left, right }) => (
                <CommandItem
                  key={`${left.slug}-${right.slug}`}
                  value={`compare ${left.name} vs ${right.name} ${left.slug} ${right.slug}`}
                  onSelect={() =>
                    go(`/compare/${compareSlug(left.slug, right.slug)}`)
                  }
                >
                  {left.name} vs {right.name}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      </CommandDialog>
    </>
  );
}
