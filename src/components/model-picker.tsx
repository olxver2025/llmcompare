"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import type { Model } from "@/data/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { OpenBadge } from "@/components/open-badge";
import { OrgIcon } from "@/components/org-icon";

export function ModelPicker({
  models,
  value,
  onChange,
  placeholder = "Select a model…",
  excludeSlug,
  id,
}: {
  models: Model[];
  value?: string;
  onChange: (slug: string) => void;
  placeholder?: string;
  excludeSlug?: string;
  id?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = models.find((m) => m.slug === value);
  const options = models.filter((m) => m.slug !== excludeSlug);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-11 w-full justify-between font-normal"
        >
          {selected ? (
            <span className="flex min-w-0 items-center gap-2 truncate">
              <OrgIcon organization={selected.organization} size="md" />
              <span className="truncate font-medium">{selected.name}</span>
              <span className="truncate text-muted-foreground">
                · {selected.organization}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search models…" />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {options.map((m) => (
                <CommandItem
                  key={m.slug}
                  value={`${m.name} ${m.organization} ${m.slug}`}
                  onSelect={() => {
                    onChange(m.slug);
                    setOpen(false);
                  }}
                  className="gap-2"
                >
                  <Check
                    className={cn(
                      "size-4 shrink-0",
                      value === m.slug ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <OrgIcon organization={m.organization} size="md" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate">{m.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {m.organization}
                    </span>
                  </div>
                  <OpenBadge openSource={m.openSource} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
