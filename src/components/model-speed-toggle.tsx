"use client";

import { useSpeedMode, type SpeedMode } from "@/components/model-speed-context";
import { cn } from "@/lib/utils";

const MODES: { id: SpeedMode; label: string }[] = [
  { id: "standard", label: "Standard" },
  { id: "fast", label: "Fast" },
  { id: "ultrafast", label: "Ultrafast" },
];

export function ModelSpeedToggle() {
  const { mode, setMode, availableModes } = useSpeedMode();
  return (
    <div
      role="radiogroup"
      aria-label="API speed tier"
      className="inline-flex gap-1"
    >
      {MODES.filter(({ id }) => availableModes.includes(id)).map(
        ({ id, label }) => {
          const selected = mode === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setMode(id)}
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
        }
      )}
    </div>
  );
}
