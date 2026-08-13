"use client";

import { useSpeedMode } from "@/components/model-speed-context";
import { cn } from "@/lib/utils";

export function ModelSpeedToggle() {
  const { fast, setFast } = useSpeedMode();
  return (
    <div
      role="radiogroup"
      aria-label="API speed tier"
      className="inline-flex gap-1"
    >
      {(
        [
          ["standard", "Standard", false],
          ["fast", "Fast", true],
        ] as const
      ).map(([id, label, isFast]) => {
        const selected = fast === isFast;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setFast(isFast)}
            className={cn(
              "border px-2 py-0.5 font-mono text-[11px] tracking-wide",
              selected
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
