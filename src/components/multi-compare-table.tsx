import Link from "next/link";
import type { ReactNode } from "react";
import type { Model } from "@/data/types";
import { MULTI_COMPARE_GROUP_ORDER, multiCompareRows } from "@/lib/multi-compare";
import { OrgIcon } from "@/components/org-icon";
import { ScrollX } from "@/components/scroll-x";
import { orgColor } from "@/lib/org-colors";
import { cn } from "@/lib/utils";

export function MultiCompareTable({ models }: { models: Model[] }) {
  const rows = multiCompareRows(models);
  const grouped = MULTI_COMPARE_GROUP_ORDER.map((cat) => ({
    cat,
    label: rows.find((r) => r.category === cat)?.categoryLabel ?? cat,
    rows: rows.filter((r) => r.category === cat),
  })).filter((g) => g.rows.length > 0);

  return (
    <ScrollX>
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-foreground/20 text-left">
              <th className="py-2 pr-4 font-mono text-xs font-medium text-muted-foreground">
                Metric
              </th>
              {models.map((m) => (
                <th
                  key={m.slug}
                  className="border-b-2 py-2 pr-4 font-medium"
                  style={{ borderBottomColor: orgColor(m.organization) }}
                >
                  <Link
                    href={`/models/${m.slug}`}
                    className="flex items-center gap-1.5 hover:underline"
                  >
                    <OrgIcon organization={m.organization} size="sm" />
                    {m.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grouped.map((group) => (
              <FragmentGroup
                key={group.cat}
                label={group.label}
                colSpan={models.length + 1}
              >
                {group.rows.map((row) => (
                  <tr key={row.id} className="border-b border-border">
                    <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">
                      {row.label}
                    </td>
                    {row.values.map((value, i) => (
                      <td
                        key={models[i].slug}
                        className={cn(
                          "py-2 pr-4 font-mono tabular-nums",
                          row.bestIndices.includes(i)
                            ? "font-semibold text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </FragmentGroup>
            ))}
          </tbody>
        </table>
    </ScrollX>
  );
}

function FragmentGroup({
  label,
  colSpan,
  children,
}: {
  label: string;
  colSpan: number;
  children: ReactNode;
}) {
  return (
    <>
      <tr>
        <td
          colSpan={colSpan}
          className="pb-1 pt-5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
        >
          {label}
        </td>
      </tr>
      {children}
    </>
  );
}
