import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrgIcon } from "@/components/org-icon";
import { ModelsTable } from "@/components/models-table";
import { MediaModelsTable } from "@/components/media-models-table";
import { getLlmcompareIndexBySlug } from "@/lib/benchmark-composite";
import {
  getOrganizationDetail,
  getOrganizationSlugs,
} from "@/lib/organizations";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getOrganizationSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const org = getOrganizationDetail(slug);
  if (!org) return { title: "Organization not found" };
  return {
    title: org.name,
    description: `${org.name}'s models in the LLMcompare catalog: benchmarks, pricing, and specs.`,
  };
}

export default async function OrganizationDetailPage({ params }: Props) {
  const { slug } = await params;
  const org = getOrganizationDetail(slug);
  if (!org) notFound();

  const openCount = org.models.filter((m) => m.openSource).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link
          href="/organizations"
          className="hover:text-foreground hover:underline"
        >
          Organizations
        </Link>
        <span className="mx-2 text-border">/</span>
        <span className="text-foreground">{org.name}</span>
      </nav>

      <header className="mb-10 flex items-center gap-3">
        <OrgIcon organization={org.name} size="xl" />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{org.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {org.models.length} LLM{org.models.length === 1 ? "" : "s"}
            {openCount > 0 ? ` (${openCount} open-weight)` : ""}
            {org.imageModels.length > 0
              ? ` · ${org.imageModels.length} image model${org.imageModels.length === 1 ? "" : "s"}`
              : ""}
            {org.videoModels.length > 0
              ? ` · ${org.videoModels.length} video model${org.videoModels.length === 1 ? "" : "s"}`
              : ""}
          </p>
        </div>
      </header>

      {org.models.length > 0 ? (
        <section className="section-rule mb-12">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">
            LLMs
          </h2>
          <ModelsTable
            models={org.models}
            organizations={[org.name]}
            indexScores={getLlmcompareIndexBySlug()}
          />
        </section>
      ) : null}

      {org.imageModels.length > 0 ? (
        <section className="section-rule mb-12">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">
            Image models
          </h2>
          <MediaModelsTable
            kind="image"
            models={org.imageModels}
            organizations={[org.name]}
          />
        </section>
      ) : null}

      {org.videoModels.length > 0 ? (
        <section className="section-rule mb-12">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">
            Video models
          </h2>
          <MediaModelsTable
            kind="video"
            models={org.videoModels}
            organizations={[org.name]}
          />
        </section>
      ) : null}
    </div>
  );
}
