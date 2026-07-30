import { cn } from "@/lib/utils";

/** License state marker: color + text, not a decorative pill. */
export function OpenBadge({
  openSource,
  className,
}: {
  openSource: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-mono text-[11px] tabular-nums",
        openSource ? "text-open" : "text-closed",
        className
      )}
    >
      {openSource ? "open" : "closed"}
    </span>
  );
}
