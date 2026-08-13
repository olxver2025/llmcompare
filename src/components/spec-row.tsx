import type { ReactNode } from "react";

export function Spec({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-2 border-b border-border py-2.5 last:border-0 sm:grid-cols-[9rem_1fr]">
      <dt className="font-mono text-xs text-muted-foreground">{label}</dt>
      <dd className="font-mono text-sm tabular-nums text-foreground">
        {value}
        {hint ? (
          <span className="mt-0.5 block font-sans text-xs font-normal normal-case tabular-nums text-muted-foreground">
            {hint}
          </span>
        ) : null}
      </dd>
    </div>
  );
}
