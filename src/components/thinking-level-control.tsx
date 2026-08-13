"use client";

import type { ThinkingLevel } from "@/data/types";
import { cn } from "@/lib/utils";

export function ThinkingLevelControl({
  levels,
  value,
  onChange,
  enabledIds,
  ariaLabel,
}: {
  levels: ThinkingLevel[];
  value: string;
  onChange: (id: string) => void;
  enabledIds?: ReadonlySet<string>;
  ariaLabel?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel ?? "Thinking level"}
      className="inline-flex flex-wrap gap-1"
    >
      {levels.map((level) => {
        const enabled = !enabledIds || enabledIds.has(level.id);
        const selected = value === level.id;
        return (
          <button
            key={level.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-disabled={!enabled}
            disabled={!enabled}
            onClick={() => enabled && onChange(level.id)}
            className={cn(
              "border px-2 py-0.5 font-mono text-[11px] tracking-wide",
              selected
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground",
              enabled
                ? "hover:border-foreground hover:text-foreground"
                : "cursor-not-allowed opacity-40"
            )}
          >
            {level.label}
          </button>
        );
      })}
    </div>
  );
}
