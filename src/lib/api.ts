import { BENCHMARKS, BENCHMARK_IDS } from "@/data/benchmarks";
import type { BenchmarkId, Model } from "@/data/types";
import { MODEL_FAMILIES, modelFamilyId, modelFamilyLabel } from "@/lib/model-family";
import {
  compareBreakdown,
  DATA_FRESHNESS,
  formatApiAccess,
  getAllModels,
  getBenchmarkScoredCount,
  getModel,
  getRelatedModels,
  getTopModelsByBenchmark,
  workloadCost,
  blendedPrice,
  compareSlug,
  generateVerdict,
} from "@/lib/models";

export const API_VERSION = "v1";
export const API_BASE_PATH = `/api/${API_VERSION}`;

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 250;

export type ApiModel = Model & {
  family: string;
  familyLabel: string;
  derived: {
    apiProvider?: string;
    blendedPricePer1M?: number;
    workloadCost?: number;
    benchmarkCount: number;
  };
};

export type ModelSort =
  | "name"
  | "organization"
  | "releaseDate"
  | "contextWindow"
  | "inputPrice"
  | "outputPrice"
  | "tokensPerSec"
  | "slug"
  | BenchmarkId;

export type ModelQuery = {
  q?: string;
  organization?: string;
  family?: string;
  openSource?: boolean;
  modality?: string;
  benchmark?: BenchmarkId;
  minScore?: number;
  sort: ModelSort;
  order: "asc" | "desc";
  page: number;
  limit: number;
};

export class ApiQueryError extends Error {
  readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "ApiQueryError";
    this.code = code;
    this.details = details;
  }
}

export function apiHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
  };
}

export function apiOptions() {
  return new Response(null, {
    status: 204,
    headers: { ...apiHeaders(), Allow: "GET, HEAD, OPTIONS" },
  });
}

export function apiResponse<T>(
  data: T,
  meta: Record<string, unknown> = {},
  status = 200,
  headers: HeadersInit = {}
) {
  return Response.json(
    {
      data,
      meta: {
        apiVersion: API_VERSION,
        dataFreshness: DATA_FRESHNESS,
        ...meta,
      },
    },
    { status, headers: { ...apiHeaders(), ...headers } }
  );
}

export function apiError(
  code: string,
  message: string,
  status: number,
  details?: Record<string, unknown>
) {
  return Response.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
      meta: {
        apiVersion: API_VERSION,
        dataFreshness: DATA_FRESHNESS,
      },
    },
    { status, headers: apiHeaders() }
  );
}

export function handleApiQueryError(error: unknown) {
  if (error instanceof ApiQueryError) {
    return apiError(error.code, error.message, 400, error.details);
  }
  return apiError("INTERNAL_ERROR", "The request could not be completed.", 500);
}

export function apiIndex() {
  const models = getAllModels();
  return {
    name: "LLMcompare API",
    version: API_VERSION,
    description:
      "Read-only REST API for the LLMcompare model catalog, benchmarks, releases, organizations, and comparisons.",
    dataFreshness: DATA_FRESHNESS,
    statistics: {
      models: models.length,
      openWeightModels: models.filter((model) => model.openSource).length,
      organizations: new Set(models.map((model) => model.organization)).size,
      benchmarks: BENCHMARK_IDS.length,
    },
    endpoints: {
      models: `${API_BASE_PATH}/models`,
      model: `${API_BASE_PATH}/models/{slug}`,
      relatedModels: `${API_BASE_PATH}/models/{slug}/related`,
      benchmarks: `${API_BASE_PATH}/benchmarks`,
      benchmark: `${API_BASE_PATH}/benchmarks/{id}`,
      compare: `${API_BASE_PATH}/compare?a={slug}&b={slug}`,
      compareBySlug: `${API_BASE_PATH}/compare/{a}-vs-{b}`,
      organizations: `${API_BASE_PATH}/organizations`,
      releases: `${API_BASE_PATH}/releases`,
      openapi: "/api/openapi.json",
    },
  };
}

export function serializeModel(model: Model): ApiModel {
  const cost = workloadCost(model);
  const price = blendedPrice(model);
  return {
    ...model,
    family: modelFamilyId(model),
    familyLabel: modelFamilyLabel(model),
    derived: {
      ...(model.pricing ? { apiProvider: formatApiAccess(model) } : {}),
      ...(price !== undefined ? { blendedPricePer1M: price } : {}),
      ...(cost !== undefined ? { workloadCost: cost } : {}),
      benchmarkCount: Object.keys(model.benchmarks).length,
    },
  };
}

function queryValue(params: URLSearchParams, key: string) {
  const value = params.get(key);
  return value?.trim() || undefined;
}

function parseBoolean(value: string | undefined, key: string) {
  if (value === undefined) return undefined;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  throw new ApiQueryError(
    "INVALID_QUERY",
    `${key} must be true, false, 1, or 0.`,
    { parameter: key, value }
  );
}

function parsePositiveInteger(
  value: string | undefined,
  key: string,
  fallback: number,
  max?: number
) {
  if (value === undefined) return fallback;
  if (!/^\d+$/.test(value)) {
    throw new ApiQueryError("INVALID_QUERY", `${key} must be a positive integer.`, {
      parameter: key,
      value,
    });
  }
  const parsed = Number(value);
  if (parsed < 1 || (max !== undefined && parsed > max)) {
    throw new ApiQueryError(
      "INVALID_QUERY",
      `${key} must be between 1 and ${max ?? Number.MAX_SAFE_INTEGER}.`,
      { parameter: key, value }
    );
  }
  return parsed;
}

const SORT_KEYS = new Set<ModelSort>([
  "name",
  "organization",
  "releaseDate",
  "contextWindow",
  "inputPrice",
  "outputPrice",
  "tokensPerSec",
  "slug",
  ...BENCHMARK_IDS,
]);

export function parseModelQuery(
  params: URLSearchParams,
  defaults: Partial<Pick<ModelQuery, "sort" | "order" | "limit">> = {}
): ModelQuery {
  const sortValue = queryValue(params, "sort") ?? defaults.sort ?? "lmarena-elo";
  if (!SORT_KEYS.has(sortValue as ModelSort)) {
    throw new ApiQueryError("INVALID_QUERY", "sort is not a supported field.", {
      parameter: "sort",
      value: sortValue,
    });
  }

  const orderValue = queryValue(params, "order") ?? defaults.order ?? "desc";
  if (orderValue !== "asc" && orderValue !== "desc") {
    throw new ApiQueryError("INVALID_QUERY", "order must be asc or desc.", {
      parameter: "order",
      value: orderValue,
    });
  }

  const benchmarkValue = queryValue(params, "benchmark");
  if (benchmarkValue && !BENCHMARK_IDS.includes(benchmarkValue as BenchmarkId)) {
    throw new ApiQueryError("INVALID_QUERY", "benchmark is not recognized.", {
      parameter: "benchmark",
      value: benchmarkValue,
    });
  }

  const minScoreValue = queryValue(params, "minScore");
  const minScore = minScoreValue === undefined ? undefined : Number(minScoreValue);
  if (minScoreValue !== undefined && !Number.isFinite(minScore)) {
    throw new ApiQueryError("INVALID_QUERY", "minScore must be numeric.", {
      parameter: "minScore",
      value: minScoreValue,
    });
  }
  if (minScore !== undefined && !benchmarkValue) {
    throw new ApiQueryError(
      "INVALID_QUERY",
      "minScore requires a benchmark parameter.",
      { parameter: "minScore" }
    );
  }

  const license = queryValue(params, "license");
  const openSource = parseBoolean(queryValue(params, "openSource"), "openSource");
  if (license && license !== "open" && license !== "closed") {
    throw new ApiQueryError("INVALID_QUERY", "license must be open or closed.", {
      parameter: "license",
      value: license,
    });
  }

  return {
    q: queryValue(params, "q")?.slice(0, 200),
    organization: queryValue(params, "organization") ?? queryValue(params, "org"),
    family: queryValue(params, "family"),
    openSource: license === "open" ? true : license === "closed" ? false : openSource,
    modality: queryValue(params, "modality"),
    benchmark: benchmarkValue as BenchmarkId | undefined,
    minScore,
    sort: sortValue as ModelSort,
    order: orderValue,
    page: parsePositiveInteger(queryValue(params, "page"), "page", 1),
    limit: parsePositiveInteger(
      queryValue(params, "limit"),
      "limit",
      defaults.limit ?? DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE
    ),
  };
}

function modelSortValue(model: Model, sort: ModelSort): number | string | undefined {
  switch (sort) {
    case "name":
      return model.name;
    case "organization":
      return model.organization;
    case "releaseDate":
      return model.releaseDate;
    case "contextWindow":
      return model.contextWindow;
    case "inputPrice":
      return model.pricing?.inputPer1M;
    case "outputPrice":
      return model.pricing?.outputPer1M;
    case "tokensPerSec":
      return model.speed?.tokensPerSec;
    case "slug":
      return model.slug;
    default:
      return model.benchmarks[sort];
  }
}

export function filterAndSortModels(query: ModelQuery, source = getAllModels()) {
  const normalizedQuery = query.q?.toLowerCase();
  const filtered = source.filter((model) => {
    if (
      normalizedQuery &&
      ![model.name, model.organization, model.slug, model.summary]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    ) {
      return false;
    }
    if (query.organization && model.organization !== query.organization) return false;
    if (query.family && modelFamilyId(model) !== query.family) return false;
    if (query.openSource !== undefined && model.openSource !== query.openSource) return false;
    if (query.modality) {
      const modalities = [...model.modalities.input, ...model.modalities.output];
      if (!modalities.includes(query.modality)) return false;
    }
    if (query.benchmark) {
      const score = model.benchmarks[query.benchmark];
      if (score === undefined) return false;
      if (query.minScore !== undefined && score < query.minScore) return false;
    }
    return true;
  });

  const direction = query.order === "asc" ? 1 : -1;
  filtered.sort((a, b) => {
    const aValue = modelSortValue(a, query.sort);
    const bValue = modelSortValue(b, query.sort);
    if (aValue === undefined && bValue === undefined) return a.slug.localeCompare(b.slug);
    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;
    const comparison =
      typeof aValue === "string" && typeof bValue === "string"
        ? aValue.localeCompare(bValue)
        : Number(aValue) - Number(bValue);
    return comparison === 0 ? a.slug.localeCompare(b.slug) : comparison * direction;
  });
  return filtered;
}

export function paginateModels(models: Model[], query: ModelQuery) {
  const start = (query.page - 1) * query.limit;
  return {
    items: models.slice(start, start + query.limit),
    pagination: {
      page: query.page,
      limit: query.limit,
      total: models.length,
      pageCount: Math.ceil(models.length / query.limit),
      hasNextPage: start + query.limit < models.length,
      hasPreviousPage: query.page > 1,
    },
  };
}

export function modelFacets() {
  const models = getAllModels();
  return {
    organizations: [...new Set(models.map((model) => model.organization))].sort(),
    families: MODEL_FAMILIES.filter((family) => models.some((model) => modelFamilyId(model) === family.id)),
    modalities: ["text", "image", "audio", "video"].filter((modality) =>
      models.some((model) => [...model.modalities.input, ...model.modalities.output].includes(modality))
    ),
    benchmarks: BENCHMARK_IDS,
  };
}

export function benchmarkResource(id: BenchmarkId) {
  const meta = BENCHMARKS[id];
  const topModels = getTopModelsByBenchmark(id, 10).map(({ model, score, rank }) => ({
    rank,
    score,
    model: serializeModel(model),
  }));
  return {
    ...meta,
    scoredCount: getBenchmarkScoredCount(id),
    topModels,
  };
}

export function organizationResources() {
  const grouped = new Map<string, Model[]>();
  for (const model of getAllModels()) {
    const existing = grouped.get(model.organization) ?? [];
    existing.push(model);
    grouped.set(model.organization, existing);
  }
  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, models]) => ({
      name,
      modelCount: models.length,
      openWeightModelCount: models.filter((model) => model.openSource).length,
      modelSlugs: models.map((model) => model.slug).sort(),
    }));
}

export function compareResource(aSlug: string, bSlug: string) {
  const a = getModel(aSlug);
  const b = getModel(bSlug);
  if (!a || !b) return undefined;
  const breakdown = compareBreakdown(a, b);
  return {
    slug: compareSlug(a.slug, b.slug),
    left: serializeModel(a),
    right: serializeModel(b),
    verdict: generateVerdict(a, b),
    breakdown,
  };
}

export function relatedModelResources(slug: string) {
  const model = getModel(slug);
  return model ? getRelatedModels(model).map(serializeModel) : undefined;
}

export function parseCompareQuery(params: URLSearchParams) {
  const a = queryValue(params, "a") ?? queryValue(params, "left");
  const b = queryValue(params, "b") ?? queryValue(params, "right");
  if (!a || !b) {
    throw new ApiQueryError(
      "MISSING_QUERY",
      "Both a and b model slugs are required.",
      { required: ["a", "b"] }
    );
  }
  if (a === b) {
    throw new ApiQueryError("INVALID_QUERY", "a and b must refer to different models.");
  }
  return { a, b };
}

export function comparePairFromPath(slug: string) {
  const idx = slug.indexOf("-vs-");
  if (idx <= 0 || idx === slug.length - 4) return undefined;
  return { a: slug.slice(0, idx), b: slug.slice(idx + 4) };
}

export function apiNotFound(resource: string, value: string) {
  return apiError("NOT_FOUND", `${resource} '${value}' was not found.`, 404, {
    resource,
    value,
  });
}

export function isBenchmarkId(value: string): value is BenchmarkId {
  return BENCHMARK_IDS.includes(value as BenchmarkId);
}

export function getModelResource(slug: string) {
  const model = getModel(slug);
  return model ? serializeModel(model) : undefined;
}
