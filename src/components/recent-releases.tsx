import Link from "next/link";
import type { Model } from "@/data/types";
import { OpenBadge } from "@/components/open-badge";
import { OrgIcon } from "@/components/org-icon";
import { formatDate } from "@/lib/models";

export function RecentReleases({ models }: { models: Model[] }) {
  if (models.length === 0) return null;

  return (
    <section className="section-rule mb-12">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Recent releases</h2>
        <Link
          href="/releases"
          className="text-sm text-open underline-offset-4 hover:underline"
        >
          All releases →
        </Link>
      </div>
      <ol>
        {models.map((model) => (
          <li key={model.slug} className="border-b border-border last:border-0">
            <Link
              href={`/models/${model.slug}`}
              prefetch={false}
              className="flex items-baseline gap-3 py-2 text-sm hover:bg-muted/50"
            >
              <time
                dateTime={model.releaseDate}
                className="w-[6.5rem] shrink-0 font-mono text-xs tabular-nums text-muted-foreground"
              >
                {formatDate(model.releaseDate)}
              </time>
              <span className="inline-flex min-w-0 items-baseline gap-2">
                <OrgIcon
                  organization={model.organization}
                  size="sm"
                  className="translate-y-0.5"
                />
                <span className="truncate font-medium">{model.name}</span>
              </span>
              <span className="hidden truncate text-muted-foreground sm:inline">
                {model.organization}
              </span>
              <OpenBadge openSource={model.openSource} className="ml-auto shrink-0" />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
