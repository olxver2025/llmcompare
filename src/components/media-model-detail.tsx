import type { ReactNode } from "react";
import Link from "next/link";
import type { ImageModel, MediaBenchmarkMeta, VideoModel } from "@/data/types";
import { MediaCompareWithPicker } from "@/components/media-compare-with-picker";
import { OpenBadge } from "@/components/open-badge";
import { OrgIcon } from "@/components/org-icon";
import {
  IMAGE_BENCHMARKS,
  IMAGE_BENCHMARK_IDS,
  VIDEO_BENCHMARKS,
  VIDEO_BENCHMARK_IDS,
  formatDate,
  formatDurationSeconds,
  formatGenerationSpeed,
  formatMediaLicense,
  formatMediaScore,
  formatPerImagePrice,
  formatPerSecondPrice,
  formatResolution,
  getAllImageModels,
  getAllVideoModels,
  getMediaBenchmarkRank,
  getMediaScoredCount,
} from "@/lib/media-models";

type MediaKind = "image" | "video";

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

function moreFromOrg<T extends { slug: string; organization: string; releaseDate: string }>(
  model: T,
  catalog: T[],
  limit = 6
): T[] {
  return catalog
    .filter((m) => m.slug !== model.slug && m.organization === model.organization)
    .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))
    .slice(0, limit);
}

function benchmarkMeta(
  kind: MediaKind,
  id: string
): MediaBenchmarkMeta | undefined {
  const list = kind === "image" ? IMAGE_BENCHMARKS : VIDEO_BENCHMARKS;
  return list.find((b) => b.id === id);
}

export function MediaModelDetail({
  kind,
  model,
}: {
  kind: MediaKind;
  model: ImageModel | VideoModel;
}) {
  const catalog: Array<ImageModel | VideoModel> =
    kind === "image" ? getAllImageModels() : getAllVideoModels();
  const related = moreFromOrg(model, catalog);
  const benchmarkIds =
    kind === "image" ? IMAGE_BENCHMARK_IDS : VIDEO_BENCHMARK_IDS;
  const eloId =
    kind === "image" ? "image-arena-elo" : "video-arena-elo";
  const elo = model.benchmarks[eloId as keyof typeof model.benchmarks] as
    | number
    | undefined;
  const eloRank = getMediaBenchmarkRank(model, eloId, catalog);
  const eloScored = getMediaScoredCount(eloId, catalog);
  const catalogPath = kind === "image" ? "/image" : "/video";
  const catalogLabel = kind === "image" ? "Image models" : "Video models";

  const imageModel = kind === "image" ? (model as ImageModel) : null;
  const videoModel = kind === "video" ? (model as VideoModel) : null;

  const priceLabel =
    kind === "image"
      ? formatPerImagePrice(imageModel?.pricing?.perImage)
      : formatPerSecondPrice(videoModel?.pricing?.perSecond);

  const speedLabel =
    kind === "image"
      ? formatGenerationSpeed(imageModel?.specs.secondsPerImage, "image")
      : formatGenerationSpeed(
          videoModel?.specs.secondsPerVideoSecond,
          "video-second"
        );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href={catalogPath} className="hover:text-foreground hover:underline">
          {catalogLabel}
        </Link>
        <span className="mx-2 text-border">/</span>
        <span className="text-foreground">{model.name}</span>
      </nav>

      <header className="mb-10 max-w-2xl">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <OrgIcon organization={model.organization} size="md" />
          <span>{model.organization}</span>
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
            Max res{" "}
            <span className="text-foreground">
              {formatResolution(model.specs.maxResolution)}
            </span>
          </li>
          {videoModel ? (
            <li>
              Max duration{" "}
              <span className="text-foreground">
                {formatDurationSeconds(videoModel.specs.maxDurationSeconds)}
              </span>
            </li>
          ) : null}
          {priceLabel !== "-" ? (
            <li>
              Price <span className="text-foreground">{priceLabel}</span>
            </li>
          ) : null}
          {elo !== undefined && eloRank !== undefined ? (
            <li>
              Arena Elo{" "}
              <span className="text-foreground">{formatMediaScore(elo)}</span>
              <span>
                {" "}
                · #{eloRank}/{eloScored}
              </span>
            </li>
          ) : null}
          {speedLabel !== "-" ? (
            <li>
              Speed <span className="text-foreground">{speedLabel}</span>
            </li>
          ) : null}
        </ul>
      </header>

      <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-10">
          <section className="section-rule">
            <h2 className="text-lg font-semibold">Specs</h2>
            <dl className="mt-3">
              <Spec label="License" value={formatMediaLicense(model)} />
              <Spec
                label="Open weights"
                value={model.openSource ? "Yes" : "No"}
              />
              <Spec
                label="Max resolution"
                value={formatResolution(model.specs.maxResolution)}
              />
              {videoModel ? (
                <Spec
                  label="Max duration"
                  value={formatDurationSeconds(
                    videoModel.specs.maxDurationSeconds
                  )}
                />
              ) : null}
              <Spec label="Generation" value={speedLabel} />
              <Spec label="Release" value={formatDate(model.releaseDate)} />
            </dl>
          </section>

          <section className="section-rule">
            <h2 className="text-lg font-semibold">Benchmarks</h2>
            <ul className="mt-3">
              {benchmarkIds.map((id) => {
                const meta = benchmarkMeta(kind, id);
                if (!meta) return null;
                const score = model.benchmarks[
                  id as keyof typeof model.benchmarks
                ] as number | undefined;
                const rank = getMediaBenchmarkRank(
                  model,
                  id,
                  catalog,
                  meta.higherIsBetter
                );
                const scored = getMediaScoredCount(id, catalog);
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
                        {formatMediaScore(score)}
                      </p>
                      {rank !== undefined ? (
                        <p className="font-mono text-xs tabular-nums text-muted-foreground">
                          #{rank} of {scored}
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
          </section>
        </div>

        <aside className="space-y-10">
          <section className="section-rule">
            <h2 className="text-lg font-semibold">Pricing</h2>
            {(kind === "image" ? imageModel?.pricing : videoModel?.pricing) ? (
              <div className="mt-3 space-y-3">
                <p className="text-sm text-muted-foreground">
                  {kind === "image"
                    ? imageModel!.pricing!.provider
                    : videoModel!.pricing!.provider}
                  ,{" "}
                  {kind === "image" ? "$ per image" : "$ per second of video"}
                </p>
                <dl>
                  {kind === "image" ? (
                    <Spec
                      label="Per image"
                      value={formatPerImagePrice(
                        imageModel!.pricing!.perImage
                      )}
                    />
                  ) : (
                    <Spec
                      label="Per second"
                      value={formatPerSecondPrice(
                        videoModel!.pricing!.perSecond
                      )}
                    />
                  )}
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
            <p className="mb-3 text-sm text-muted-foreground">
              Same-type only — other {kind} models.
            </p>
            <MediaCompareWithPicker
              kind={kind}
              models={catalog}
              currentSlug={model.slug}
            />
          </section>

          {related.length > 0 ? (
            <section className="section-rule">
              <h2 className="text-lg font-semibold">
                More from {model.organization}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Other {kind} models from the same organization.
              </p>
              <ul className="mt-3">
                {related.map((m) => (
                  <li
                    key={m.slug}
                    className="flex items-baseline justify-between gap-3 border-b border-border py-2 text-sm last:border-0"
                  >
                    <Link
                      href={`/${kind}/${m.slug}`}
                      className="text-open underline-offset-4 hover:underline"
                    >
                      {m.name}
                    </Link>
                    <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                      {formatResolution(m.specs.maxResolution)}
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
          href={`/${kind}/compare`}
          className="text-open underline-offset-4 hover:underline"
        >
          Open the {kind} compare picker
        </Link>
      </p>
    </div>
  );
}