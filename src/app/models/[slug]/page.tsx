import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BENCHMARK_CATEGORIES, BENCHMARK_IDS, BENCHMARKS } from "@/data/benchmarks";
import { OpenBadge } from "@/components/open-badge";
import { OrgIcon } from "@/components/org-icon";
import { CompareWithPicker } from "@/components/compare-with-picker";
import {
  blendedPrice,
  formatApiAccess,
  formatContext,
  formatDate,
  formatLicense,
  formatModalities,
  formatParams,
  formatPrice,
  formatScore,
  formatSpeed,
  getAllModels,
  getBenchmarkRank,
  getBenchmarkScoredCount,
  getModel,
  getRelatedModels,
  getSpecRank,
  modelFamilyLabel,
  workloadCost,
} from "@/lib/models";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllModels().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const model = getModel(slug);
  if (!model) return { title: "Model not found" };
  return {
    title: model.name,
    description: model.summary,
  };
}

function Spec({
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

export default async function ModelPage({ params }: Props) {
  const { slug } = await params;
  const model = getModel(slug);
  if (!model) notFound();

  const models = getAllModels();
  const related = getRelatedModels(model);
  const blend = blendedPrice(model);
  const cost = workloadCost(model);

  const scoredCount = getBenchmarkScoredCount;

  const contextRank = getSpecRank(
    model.contextWindow,
    models.map((m) => m.contextWindow),
    true
  );
  const priceRank = getSpecRank(
    blend,
    models.map((m) => blendedPrice(m)),
    false
  );
  const speedRank = getSpecRank(
    model.speed?.tokensPerSec,
    models.map((m) => m.speed?.tokensPerSec),
    true
  );
  const pricedCount = models.filter((m) => blendedPrice(m) !== undefined).length;
  const speedCount = models.filter(
    (m) => m.speed?.tokensPerSec !== undefined
  ).length;

  const scoredBenchmarks = BENCHMARK_IDS.filter(
    (id) => model.benchmarks[id] !== undefined
  ).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground hover:underline">
          Catalog
        </Link>
        <span className="mx-2 text-border">/</span>
        <span className="text-foreground">{model.name}</span>
      </nav>

      <header className="mb-10 max-w-2xl">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <OrgIcon organization={model.organization} size="md" />
          <span>{model.organization}</span>
          <span className="text-border">·</span>
          <span className="font-mono text-xs">{modelFamilyLabel(model)}</span>
          <span className="text-border">·</span>
          <OpenBadge openSource={model.openSource} />
          {model.license ? (
            <>
              <span className="text-border">·</span>
              <span className="font-mono text-xs">{model.license}</span>
            </>
          ) : null}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {model.name}
        </h1>
        <p className="mt-3 text-muted-foreground text-pretty">{model.summary}</p>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs tabular-nums text-muted-foreground">
          <li>
            Context{" "}
            <span className="text-foreground">
              {formatContext(model.contextWindow)}
            </span>
            {contextRank !== undefined ? (
              <span>
                {" "}
                · #{contextRank}/{models.length}
              </span>
            ) : null}
          </li>
          {blend !== undefined && priceRank !== undefined ? (
            <li>
              Blended{" "}
              <span className="text-foreground">{formatPrice(blend)}</span>
              <span>
                {" "}
                · #{priceRank}/{pricedCount}
              </span>
            </li>
          ) : null}
          {model.speed?.tokensPerSec !== undefined &&
          speedRank !== undefined ? (
            <li>
              Speed{" "}
              <span className="text-foreground">
                {model.speed.tokensPerSec} tok/s
              </span>
              <span>
                {" "}
                · #{speedRank}/{speedCount}
              </span>
            </li>
          ) : null}
          <li>
            Benchmarks{" "}
            <span className="text-foreground">
              {scoredBenchmarks}/{BENCHMARK_IDS.length}
            </span>
          </li>
        </ul>
      </header>

      <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-10">
          <section className="section-rule">
            <h2 className="text-lg font-semibold">Specs</h2>
            <dl className="mt-3">
              <Spec label="Family" value={modelFamilyLabel(model)} />
              <Spec label="License" value={formatLicense(model)} />
              <Spec
                label="Open weights"
                value={model.openSource ? "Yes" : "No"}
              />
              <Spec
                label="Context"
                value={formatContext(model.contextWindow)}
                hint={
                  contextRank !== undefined
                    ? `#${contextRank} of ${models.length} in catalog`
                    : undefined
                }
              />
              <Spec
                label="Max output"
                value={
                  model.maxOutput ? formatContext(model.maxOutput) : "-"
                }
              />
              <Spec label="Parameters" value={formatParams(model.parameters)} />
              <Spec label="Release" value={formatDate(model.releaseDate)} />
              <Spec label="Cutoff" value={model.knowledgeCutoff ?? "-"} />
              <Spec label="Modalities" value={formatModalities(model)} />
              <Spec label="Speed" value={formatSpeed(model)} />
              <Spec label="API" value={formatApiAccess(model)} />
            </dl>
          </section>

          <section className="section-rule">
            <h2 className="text-lg font-semibold">Benchmarks</h2>
            <div className="mt-3 space-y-6">
              {BENCHMARK_CATEGORIES.map((cat) => (
                <div key={cat.id}>
                  <h3 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {cat.label}
                  </h3>
                  <ul className="mt-1">
                    {cat.ids.map((id) => {
                      const score = model.benchmarks[id];
                      const rank = getBenchmarkRank(model, id);
                      const meta = BENCHMARKS[id];
                      return (
                        <li
                          key={id}
                          className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border py-3 last:border-0"
                        >
                          <div>
                            <p className="font-medium">{meta.name}</p>
                            <p className="max-w-md text-xs text-muted-foreground text-pretty">
                              {meta.description}{" "}
                              <a
                                href={meta.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="underline-offset-2 hover:underline"
                              >
                                (source)
                              </a>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-base font-medium tabular-nums">
                              {formatScore(id, score)}
                              {meta.unit === "percent" && score !== undefined
                                ? "%"
                                : ""}
                            </p>
                            {rank !== undefined ? (
                              <p className="font-mono text-xs tabular-nums text-muted-foreground">
                                #{rank} of {scoredCount(id)}
                              </p>
                            ) : (
                              <p className="font-mono text-xs text-muted-foreground">
                                unreported
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-10">
          <section className="section-rule">
            <h2 className="text-lg font-semibold">Pricing</h2>
            {model.pricing ? (
              <div className="mt-3 space-y-3">
                <p className="text-sm text-muted-foreground">
                  {model.pricing.provider}, $ per 1M tokens
                </p>
                <dl>
                  <Spec
                    label="Input"
                    value={formatPrice(model.pricing.inputPer1M)}
                  />
                  <Spec
                    label="Output"
                    value={formatPrice(model.pricing.outputPer1M)}
                  />
                  <Spec
                    label="Blended"
                    value={blend !== undefined ? formatPrice(blend) : "-"}
                    hint="3∶1 input:output mix"
                  />
                  <Spec
                    label="1M+250K"
                    value={cost !== undefined ? formatPrice(cost) : "-"}
                    hint="Illustrative chat workload"
                  />
                  {priceRank !== undefined ? (
                    <Spec
                      label="Catalog rank"
                      value={`#${priceRank} of ${pricedCount}`}
                      hint="Lower blended price ranks higher"
                    />
                  ) : null}
                </dl>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                No primary-provider API pricing in this dataset.
              </p>
            )}
          </section>

          <section className="section-rule">
            <h2 className="mb-3 text-lg font-semibold">Compare with</h2>
            <CompareWithPicker models={models} currentSlug={model.slug} />
          </section>

          {related.length > 0 ? (
            <section className="section-rule">
              <h2 className="text-lg font-semibold">Same family</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Other {modelFamilyLabel(model)} models in the catalog.
              </p>
              <ul className="mt-3">
                {related.map((m) => (
                  <li
                    key={m.slug}
                    className="flex items-baseline justify-between gap-3 border-b border-border py-2 text-sm last:border-0"
                  >
                    <Link
                      href={`/models/${m.slug}`}
                      className="text-open underline-offset-4 hover:underline"
                    >
                      {m.name}
                    </Link>
                    <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                      {formatContext(m.contextWindow)}
                      {m.pricing
                        ? ` · ${formatPrice(m.pricing.inputPer1M)}`
                        : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="section-rule">
            <h2 className="text-lg font-semibold">Links</h2>
            <ul className="mt-3 space-y-2">
              {(
                [
                  ["docs", "Documentation"],
                  ["modelCard", "Model card"],
                  ["announcement", "Announcement"],
                ] as const
              ).map(([key, label]) => {
                const href = model.links[key];
                if (!href) return null;
                return (
                  <li key={key}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-open underline-offset-4 hover:underline"
                    >
                      {label}
                    </a>
                  </li>
                );
              })}
              {!model.links.docs &&
                !model.links.modelCard &&
                !model.links.announcement && (
                  <li className="text-sm text-muted-foreground">
                    No links recorded.
                  </li>
                )}
            </ul>
          </section>
        </aside>
      </div>

      <p className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
        <Link
          href="/compare"
          className="text-open underline-offset-4 hover:underline"
        >
          Open the compare picker
        </Link>
      </p>
    </div>
  );
}
