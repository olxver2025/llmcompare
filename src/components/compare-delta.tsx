import { cn } from "@/lib/utils";

export function CompareDeltaBar({
  a,
  b,
  winner,
  label,
}: {
  a?: number;
  b?: number;
  winner?: "a" | "b" | "tie" | "na";
  label?: string;
}) {
  if (
    a === undefined ||
    b === undefined ||
    winner === "na" ||
    winner === undefined
  ) {
    return (
      <span className="font-mono text-xs text-muted-foreground">
        {label ?? "—"}
      </span>
    );
  }

  const aAbs = Math.abs(a);
  const bAbs = Math.abs(b);
  const sum = aAbs + bAbs;
  const aPct = sum === 0 ? 50 : (aAbs / sum) * 100;

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex h-1.5 w-16 shrink-0 overflow-hidden bg-muted"
        aria-hidden
      >
        <div
          className="h-full bg-[color:var(--compare-a)]"
          style={{ width: `${aPct}%` }}
        />
        <div
          className="h-full bg-[color:var(--compare-b)]"
          style={{ width: `${100 - aPct}%` }}
        />
      </div>
      <span
        className={cn(
          "font-mono text-xs tabular-nums",
          winner === "a"
            ? "text-[color:var(--compare-a)]"
            : winner === "b"
              ? "text-[color:var(--compare-b)]"
              : "text-muted-foreground"
        )}
      >
        {label ?? (winner === "tie" ? "tie" : "—")}
      </span>
    </div>
  );
}
