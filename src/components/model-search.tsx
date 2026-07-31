"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
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

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-2 border-border/80 bg-background/60 text-muted-foreground shadow-none"
        onClick={() => setOpen(true)}
      >
        <Search className="size-3.5" />
        <span className="hidden sm:inline">Search models</span>
        <kbd className="pointer-events-none ml-1 hidden h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:inline-flex">
          ⌘K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Search models">
        <CommandInput placeholder="Jump to a model…" />
        <CommandList>
          <CommandEmpty>No model found.</CommandEmpty>
          <CommandGroup heading="Models">
            {models.map((m) => (
              <CommandItem
                key={m.slug}
                value={`${m.name} ${m.organization} ${m.slug}`}
                onSelect={() => {
                  setOpen(false);
                  router.push(`/models/${m.slug}`);
                }}
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
                  onSelect={() => {
                    setOpen(false);
                    router.push(`/image/${m.slug}`);
                  }}
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
                  onSelect={() => {
                    setOpen(false);
                    router.push(`/video/${m.slug}`);
                  }}
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
        </CommandList>
      </CommandDialog>
    </>
  );
}
