import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BENCHMARK_IDS } from "@/data/benchmarks";
import type { BenchmarkId, Model, ResolvedThinking } from "@/data/types";
import { baseSlugForFastSlug } from "@/data/model-variants";
import { OpenBadge } from "@/components/open-badge";
import { OrgIcon } from "@/components/org-icon";
import { CompareWithPicker } from "@/components/compare-with-picker";
import { ModelBenchmarks } from "@/components/model-benchmarks";
import { Spec } from "@/components/spec-row";
import { SpeedModeProvider } from "@/components/model-speed-context";
import {
  ModelSpeedPricingCard,
  ModelSpeedSpecRow,
} from "@/components/model-speed-panel";
import {
  blendedPrice,
  formatApiAccess,
  formatContext,
  formatDate,
  formatLicense,
  formatModalities,
  formatParams,
  formatPrice,
  formatRateWithOffPeak,
  formatSpeed,
  getAllModels,
  getBenchmarkRank,
  getBenchmarkScoredCount,
  getModel,
  getRelatedModels,
  getSpecRank,
  modelFamilyLabel,
  offPeakBlendedPrice,
  offPeakWorkloadCost,
  workloadCost,
} from "@/lib/models";
import { getModelThinking, thinkingLevelLabel } from "@/lib/thinking";
import { orgSlug } from "@/lib/organizations";

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

export default async function ModelPage({ params }: Props) {
  const { slug } = await params;

  const baseSlug = baseSlugForFastSlug(slug);
  if (baseSlug) redirect(`/models/${baseSlug}`);

  const model = getModel(slug);
  if (!model) notFound();

  const hasSpeedModes =
    model.fast !== undefined || model.ultrafast !== undefined;

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
  const thinking = getModelThinking(model);
  const ranks = Object.fromEntries(
    BENCHMARK_IDS.map((id) => [id, getBenchmarkRank(model, id)])
  );
  const scoredCounts = Object.fromEntries(
    BENCHMARK_IDS.map((id) => [id, scoredCount(id)])
  );

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
          <Link
            href={`/organizations/${orgSlug(model.organization)}`}
            className="hover:text-foreground hover:underline"
          >
            {model.organization}
          </Link>
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
          {thinking ? (
            <li>
              Thinking{" "}
              <span className="text-foreground">
                {thinkingLevelLabel(thinking, thinking.highestLevel)}
              </span>
              <span>
                {" "}
                · {thinking.levels.map((level) => level.label).join(" / ")}
              </span>
            </li>
          ) : null}
        </ul>
      </header>

      {(() => {
        const grid = buildGrid({
          model,
          hasSpeedModes,
          models,
          related,
          blend,
          cost,
          contextRank,
          priceRank,
          pricedCount,
          thinking,
          ranks,
          scoredCounts,
        });
        return hasSpeedModes ? (
          <SpeedModeProvider baseModel={model}>{grid}</SpeedModeProvider>
        ) : (
          grid
        );
      })()}

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

function buildGrid({
  model,
  hasSpeedModes,
  models,
  related,
  blend,
  cost,
  contextRank,
  priceRank,
  pricedCount,
  thinking,
  ranks,
  scoredCounts,
}: {
  model: Model;
  hasSpeedModes: boolean;
  models: Model[];
  related: Model[];
  blend: number | undefined;
  cost: number | undefined;
  contextRank: number | undefined;
  priceRank: number | undefined;
  pricedCount: number;
  thinking: ResolvedThinking | undefined;
  ranks: Partial<Record<BenchmarkId, number>>;
  scoredCounts: Partial<Record<BenchmarkId, number>>;
}) {
  return (
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
              {hasSpeedModes ? (
                <ModelSpeedSpecRow />
              ) : (
                <Spec label="Speed" value={formatSpeed(model)} />
              )}
              <Spec label="API" value={formatApiAccess(model)} />
              {thinking ? (
                <Spec
                  label="Thinking"
                  value={thinking.levels.map((level) => level.label).join(" / ")}
                  hint={`${thinking.param}; catalog uses ${thinkingLevelLabel(thinking, thinking.highestLevel)}`}
                />
              ) : null}
            </dl>
          </section>

          <ModelBenchmarks
            model={model}
            thinking={thinking}
            ranks={ranks}
            scoredCounts={scoredCounts}
          />
        </div>

        <aside className="space-y-10">
          {hasSpeedModes ? (
            <ModelSpeedPricingCard
              thinking={thinking}
              priceRank={priceRank}
              pricedCount={pricedCount}
            />
          ) : (
            <section className="section-rule">
              <h2 className="text-lg font-semibold">Pricing</h2>
              {model.pricing ? (
                <div className="mt-3 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {model.pricing.provider}, $ per 1M tokens
                    {model.pricing.offPeak
                      ? ` (peak / off-peak${
                          model.pricing.peakHours
                            ? `; peak hours ${model.pricing.peakHours}`
                            : ""
                        }).`
                      : ""}
                    {thinking
                      ? ". Thinking tokens bill as output; list rates do not change by effort."
                      : ""}
                  </p>
                  <dl>
                    <Spec
                      label="Input"
                      value={formatRateWithOffPeak(
                        model.pricing.inputPer1M,
                        model.pricing.offPeak?.inputPer1M
                      )}
                    />
                    <Spec
                      label="Output"
                      value={formatRateWithOffPeak(
                        model.pricing.outputPer1M,
                        model.pricing.offPeak?.outputPer1M
                      )}
                    />
                    <Spec
                      label="Blended"
                      value={formatRateWithOffPeak(
                        blend,
                        offPeakBlendedPrice(model)
                      )}
                      hint="3∶1 input:output mix"
                    />
                    <Spec
                      label="1M+250K"
                      value={formatRateWithOffPeak(
                        cost,
                        offPeakWorkloadCost(model)
                      )}
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
          )}

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
  );
}
