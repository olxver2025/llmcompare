import {
  IMAGE_BENCHMARKS,
  IMAGE_BENCHMARK_IDS,
  imageModels,
} from "@/data/image-models";
import {
  VIDEO_BENCHMARKS,
  VIDEO_BENCHMARK_IDS,
  videoModels,
} from "@/data/video-models";
import type { ImageModel, VideoModel } from "@/data/types";
import {
  compareSlug,
  DATA_FRESHNESS,
  formatDate,
  formatPrice,
  getSpecRank,
  parseCompareSlug,
} from "@/lib/models";

export {
  compareSlug,
  DATA_FRESHNESS,
  formatDate,
  formatPrice,
  getSpecRank,
  parseCompareSlug,
  IMAGE_BENCHMARKS,
  IMAGE_BENCHMARK_IDS,
  VIDEO_BENCHMARKS,
  VIDEO_BENCHMARK_IDS,
};

export type MediaKind = "image" | "video";
export type MediaModel = ImageModel | VideoModel;

type MediaScoredModel = {
  slug: string;
  benchmarks: Partial<Record<string, number>>;
};

export function getAllImageModels(): ImageModel[] {
  return imageModels;
}

export function getImageModel(slug: string): ImageModel | undefined {
  return imageModels.find((m) => m.slug === slug);
}

export function getImageOrganizations(): string[] {
  return [...new Set(imageModels.map((m) => m.organization))].sort();
}

export function getAllVideoModels(): VideoModel[] {
  return videoModels;
}

export function getVideoModel(slug: string): VideoModel | undefined {
  return videoModels.find((m) => m.slug === slug);
}

export function getVideoOrganizations(): string[] {
  return [...new Set(videoModels.map((m) => m.organization))].sort();
}

export function formatResolution(res: {
  width: number;
  height: number;
}): string {
  return `${res.width} × ${res.height}`;
}

export function formatPerImagePrice(perImage: number | undefined): string {
  if (perImage === undefined) return "—";
  return `${formatPrice(perImage)} / image`;
}

export function formatPerSecondPrice(perSecond: number | undefined): string {
  if (perSecond === undefined) return "—";
  return `${formatPrice(perSecond)} / s`;
}

export function formatDurationSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = seconds / 60;
  return Number.isInteger(minutes) ? `${minutes}m` : `${minutes.toFixed(1)}m`;
}

export function formatGenerationSpeed(
  seconds: number | undefined,
  per: "image" | "video-second" = "image"
): string {
  if (seconds === undefined) return "—";
  return per === "image" ? `${seconds}s / image` : `${seconds}s / s`;
}

export function formatMediaScore(value: number | undefined): string {
  if (value === undefined) return "—";
  return Math.round(value).toLocaleString();
}

export function formatMediaLicense(m: {
  license?: string;
  openSource: boolean;
}): string {
  return m.license ?? (m.openSource ? "Open" : "Proprietary");
}

export function getMediaBenchmarkRank<T extends MediaScoredModel>(
  model: T,
  id: string,
  catalog: T[],
  higherIsBetter = true
): number | undefined {
  const score = model.benchmarks[id];
  if (score === undefined) return undefined;
  const scored = catalog
    .map((m) => m.benchmarks[id])
    .filter((v): v is number => v !== undefined)
    .sort((a, b) => (higherIsBetter ? b - a : a - b));
  return scored.indexOf(score) + 1;
}

export function getMediaScoredCount<T extends MediaScoredModel>(
  id: string,
  catalog: T[]
): number {
  return catalog.filter((m) => m.benchmarks[id] !== undefined).length;
}

function pixelCount(res: { width: number; height: number }): number {
  return res.width * res.height;
}

function mediaRowWinner(
  left?: number,
  right?: number,
  higherIsBetter = true
): "a" | "b" | "tie" | "na" {
  if (left === undefined || right === undefined) return "na";
  if (left === right) return "tie";
  const leftWins = higherIsBetter ? left > right : left < right;
  return leftWins ? "a" : "b";
}

function mediaFormatDelta(
  left?: number,
  right?: number,
  opts?: {
    unit?: "elo" | "price" | "raw" | "seconds" | "megapixels";
    higherIsBetter?: boolean;
  }
): string | undefined {
  if (left === undefined || right === undefined) return undefined;
  if (left === right) return "tie";
  const abs = Math.abs(left - right);
  const unit = opts?.unit ?? "raw";
  let mag: string;
  if (unit === "elo") mag = `${abs.toFixed(0)} Elo`;
  else if (unit === "price") mag = formatPrice(abs);
  else if (unit === "seconds") {
    mag = abs >= 10 ? `${abs.toFixed(0)}s` : `${abs.toFixed(1)}s`;
  } else if (unit === "megapixels") {
    mag = `${(abs / 1_000_000).toFixed(1)} MP`;
  } else {
    mag = abs >= 10 ? abs.toFixed(0) : abs.toFixed(2);
  }
  const aLeads =
    (opts?.higherIsBetter ?? true) ? left > right : left < right;
  return `${aLeads ? "A" : "B"} +${mag}`;
}

/** Weight quality/Elo above price when declaring an overall lead. */
const MEDIA_ROW_WEIGHT: Record<string, number> = {
  elo: 3,
  resolution: 2,
  duration: 2,
  speed: 1,
  price: 1,
};

export type MediaCompareRow = {
  id: string;
  label: string;
  category: "arena" | "spec" | "pricing" | "speed";
  left: string;
  right: string;
  leftNum?: number;
  rightNum?: number;
  higherIsBetter?: boolean;
  deltaLabel?: string;
  winner?: "a" | "b" | "tie" | "na";
  weight: number;
};

export type MediaCompareBreakdown = {
  kind: MediaKind;
  highlights: string[];
  /** Weighted points (Elo/specs outweigh price). */
  points: { a: number; b: number };
  wins: { a: number; b: number; ties: number };
  categoryWins: Record<string, { a: number; b: number; label: string }>;
  rows: MediaCompareRow[];
  overallLead: "a" | "b" | null;
};

export function mediaCompareBreakdown(
  kind: MediaKind,
  a: MediaModel,
  b: MediaModel
): MediaCompareBreakdown {
  const rows: MediaCompareRow[] = [];
  const eloId = kind === "image" ? "image-arena-elo" : "video-arena-elo";
  const eloMeta =
    kind === "image" ? IMAGE_BENCHMARKS[0] : VIDEO_BENCHMARKS[0];

  const push = (
    row: Omit<MediaCompareRow, "winner" | "deltaLabel" | "weight"> & {
      deltaLabel?: string;
      unit?: "elo" | "price" | "raw" | "seconds" | "megapixels";
      weight?: number;
    }
  ) => {
    const winner = mediaRowWinner(
      row.leftNum,
      row.rightNum,
      row.higherIsBetter ?? true
    );
    const deltaLabel =
      row.deltaLabel ??
      mediaFormatDelta(row.leftNum, row.rightNum, {
        unit: row.unit,
        higherIsBetter: row.higherIsBetter,
      });
    rows.push({
      ...row,
      winner,
      deltaLabel,
      weight: row.weight ?? MEDIA_ROW_WEIGHT[row.id] ?? 1,
    });
  };

  const eloA = a.benchmarks[eloId as keyof typeof a.benchmarks] as
    | number
    | undefined;
  const eloB = b.benchmarks[eloId as keyof typeof b.benchmarks] as
    | number
    | undefined;
  push({
    id: "elo",
    label: eloMeta.name,
    category: "arena",
    left: formatMediaScore(eloA),
    right: formatMediaScore(eloB),
    leftNum: eloA,
    rightNum: eloB,
    unit: "elo",
    weight: 3,
  });

  push({
    id: "resolution",
    label: "Max resolution",
    category: "spec",
    left: formatResolution(a.specs.maxResolution),
    right: formatResolution(b.specs.maxResolution),
    leftNum: pixelCount(a.specs.maxResolution),
    rightNum: pixelCount(b.specs.maxResolution),
    unit: "megapixels",
    weight: 2,
  });

  if (kind === "video") {
    const va = a as VideoModel;
    const vb = b as VideoModel;
    push({
      id: "duration",
      label: "Max duration",
      category: "spec",
      left: formatDurationSeconds(va.specs.maxDurationSeconds),
      right: formatDurationSeconds(vb.specs.maxDurationSeconds),
      leftNum: va.specs.maxDurationSeconds,
      rightNum: vb.specs.maxDurationSeconds,
      unit: "seconds",
      weight: 2,
    });
  }

  if (kind === "image") {
    const ia = a as ImageModel;
    const ib = b as ImageModel;
    push({
      id: "speed",
      label: "Generation time",
      category: "speed",
      left: formatGenerationSpeed(ia.specs.secondsPerImage, "image"),
      right: formatGenerationSpeed(ib.specs.secondsPerImage, "image"),
      leftNum: ia.specs.secondsPerImage,
      rightNum: ib.specs.secondsPerImage,
      higherIsBetter: false,
      unit: "seconds",
      weight: 1,
    });
    push({
      id: "price",
      label: "Price / image",
      category: "pricing",
      left: formatPerImagePrice(ia.pricing?.perImage),
      right: formatPerImagePrice(ib.pricing?.perImage),
      leftNum: ia.pricing?.perImage,
      rightNum: ib.pricing?.perImage,
      higherIsBetter: false,
      unit: "price",
      weight: 1,
    });
  } else {
    const va = a as VideoModel;
    const vb = b as VideoModel;
    push({
      id: "speed",
      label: "Gen time / video-s",
      category: "speed",
      left: formatGenerationSpeed(
        va.specs.secondsPerVideoSecond,
        "video-second"
      ),
      right: formatGenerationSpeed(
        vb.specs.secondsPerVideoSecond,
        "video-second"
      ),
      leftNum: va.specs.secondsPerVideoSecond,
      rightNum: vb.specs.secondsPerVideoSecond,
      higherIsBetter: false,
      unit: "seconds",
      weight: 1,
    });
    push({
      id: "price",
      label: "Price / second",
      category: "pricing",
      left: formatPerSecondPrice(va.pricing?.perSecond),
      right: formatPerSecondPrice(vb.pricing?.perSecond),
      leftNum: va.pricing?.perSecond,
      rightNum: vb.pricing?.perSecond,
      higherIsBetter: false,
      unit: "price",
      weight: 1,
    });
  }

  const scored = rows.filter(
    (r) => r.winner === "a" || r.winner === "b" || r.winner === "tie"
  );
  const wins = {
    a: scored.filter((r) => r.winner === "a").length,
    b: scored.filter((r) => r.winner === "b").length,
    ties: scored.filter((r) => r.winner === "tie").length,
  };

  const points = { a: 0, b: 0 };
  for (const row of rows) {
    if (row.winner === "a") points.a += row.weight;
    else if (row.winner === "b") points.b += row.weight;
  }
  const overallLead =
    points.a === points.b ? null : points.a > points.b ? ("a" as const) : ("b" as const);

  const categoryWins: MediaCompareBreakdown["categoryWins"] = {};
  for (const cat of ["arena", "spec", "pricing", "speed"] as const) {
    const subset = rows.filter(
      (r) => r.category === cat && (r.winner === "a" || r.winner === "b")
    );
    if (subset.length === 0) continue;
    categoryWins[cat] = {
      a: subset.filter((r) => r.winner === "a").length,
      b: subset.filter((r) => r.winner === "b").length,
      label:
        cat === "arena"
          ? "Arena"
          : cat === "spec"
            ? "Specs"
            : cat === "pricing"
              ? "Pricing"
              : "Speed",
    };
  }

  const highlights: string[] = [];
  if (eloA !== undefined && eloB !== undefined && Math.abs(eloA - eloB) >= 3) {
    const lead = eloA > eloB ? a : b;
    highlights.push(
      `${lead.name} ranks higher on ${eloMeta.shortName} (+${Math.abs(eloA - eloB).toFixed(0)} Elo)`
    );
  }

  const pxA = pixelCount(a.specs.maxResolution);
  const pxB = pixelCount(b.specs.maxResolution);
  if (pxA !== pxB) {
    const lead = pxA > pxB ? a : b;
    const other = pxA > pxB ? b : a;
    highlights.push(
      `${lead.name} supports higher max resolution (${formatResolution(lead.specs.maxResolution)} vs ${formatResolution(other.specs.maxResolution)})`
    );
  }

  if (kind === "video") {
    const va = a as VideoModel;
    const vb = b as VideoModel;
    if (va.specs.maxDurationSeconds !== vb.specs.maxDurationSeconds) {
      const lead =
        va.specs.maxDurationSeconds > vb.specs.maxDurationSeconds ? a : b;
      const secs = Math.max(
        va.specs.maxDurationSeconds,
        vb.specs.maxDurationSeconds
      );
      highlights.push(
        `${lead.name} allows longer clips (up to ${formatDurationSeconds(secs)})`
      );
    }
  }

  const priceA =
    kind === "image"
      ? (a as ImageModel).pricing?.perImage
      : (a as VideoModel).pricing?.perSecond;
  const priceB =
    kind === "image"
      ? (b as ImageModel).pricing?.perImage
      : (b as VideoModel).pricing?.perSecond;
  if (
    priceA !== undefined &&
    priceB !== undefined &&
    priceA > 0 &&
    priceB > 0
  ) {
    const ratio = Math.max(priceA, priceB) / Math.min(priceA, priceB);
    if (ratio >= 1.15) {
      const cheaper = priceA < priceB ? a : b;
      const unit = kind === "image" ? "per image" : "per second";
      highlights.push(
        `${cheaper.name} is ~${ratio.toFixed(1)}x cheaper ${unit}`
      );
    }
  }

  if (a.openSource !== b.openSource) {
    const open = a.openSource ? a : b;
    highlights.push(
      `${open.name} ships open weights (${open.license ?? "open"})`
    );
  }

  // Prefer quality highlights ahead of price when composing the verdict.
  const eloFirst = highlights.filter((h) => h.includes("Elo"));
  const rest = highlights.filter((h) => !h.includes("Elo"));
  const ordered = [...eloFirst, ...rest];

  return {
    kind,
    highlights: ordered,
    points,
    wins,
    categoryWins,
    rows,
    overallLead,
  };
}

export function generateMediaVerdict(
  kind: MediaKind,
  a: MediaModel,
  b: MediaModel
): string {
  const breakdown = mediaCompareBreakdown(kind, a, b);
  const lead =
    breakdown.overallLead === "a"
      ? a
      : breakdown.overallLead === "b"
        ? b
        : null;
  const parts = breakdown.highlights;
  if (parts.length === 0) {
    return lead
      ? `${lead.name} leads on the weighted comparison of ${a.name} and ${b.name}.`
      : `${a.name} and ${b.name} are closely matched on the overlapping metrics we have.`;
  }
  const head = lead
    ? `${lead.name} leads overall`
    : `${a.name} and ${b.name} are closely matched overall`;
  if (parts.length === 1) return `${head}: ${parts[0]}.`;
  if (parts.length === 2) return `${head}: ${parts[0]}; ${parts[1]}.`;
  return `${head}: ${parts[0]}; ${parts[1]}; ${parts[2]}.`;
}

export function popularImageComparePairs(): [string, string][] {
  return [
    ["gpt-image-2", "nano-banana-2"],
    ["gpt-image-2", "flux-2-max"],
    ["nano-banana-2", "flux-2-max"],
    ["gpt-image-1-5", "nano-banana-pro"],
    ["flux-2-dev", "stable-diffusion-3-5-large"],
    ["midjourney-v7", "gpt-image-2"],
  ];
}

export function popularVideoComparePairs(): [string, string][] {
  return [
    ["veo-3-1", "sora-2-pro"],
    ["veo-3-1", "kling-3-0-pro"],
    ["sora-2-pro", "runway-gen-4-5"],
    ["kling-3-0-pro", "dreamina-seedance-2-0"],
    ["luma-ray-2", "runway-gen-4-5"],
    ["ltx-2-3", "wan-2-2-t2v-a14b"],
  ];
}

export function mediaComparePath(kind: MediaKind, a: string, b: string): string {
  return `/${kind}/compare/${compareSlug(a, b)}`;
}
