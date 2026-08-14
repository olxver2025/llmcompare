import type { Metadata } from "next";
import Link from "next/link";
import { OrgIcon } from "@/components/org-icon";
import { organizationSummaries } from "@/lib/organizations";

export const metadata: Metadata = {
  title: "Organizations",
  description:
    "Every model provider in the LLMcompare catalog, with LLM, image, and video model counts.",
};

export default function OrganizationsPage() {
  const orgs = organizationSummaries();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <section className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Organizations
        </h1>
        <p className="mt-3 text-base text-muted-foreground text-pretty">
          {orgs.length} providers with at least one model in the catalog.
        </p>
      </section>

      <ul className="border-t border-border">
        {orgs.map((org) => (
          <li key={org.slug} className="border-b border-border">
            <Link
              href={`/organizations/${org.slug}`}
              className="flex items-center gap-3 py-3 hover:bg-muted/50"
            >
              <OrgIcon organization={org.name} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{org.name}</p>
                <p className="text-xs text-muted-foreground">
                  {org.modelCount} LLM{org.modelCount === 1 ? "" : "s"}
                  {org.openWeightModelCount > 0
                    ? ` (${org.openWeightModelCount} open-weight)`
                    : ""}
                  {org.imageModelCount > 0
                    ? ` · ${org.imageModelCount} image`
                    : ""}
                  {org.videoModelCount > 0
                    ? ` · ${org.videoModelCount} video`
                    : ""}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
