import {
  apiResponse,
  apiOptions,
  filterAndSortModels,
  handleApiQueryError,
  modelFacets,
  paginateModels,
  parseModelQuery,
  serializeModel,
} from "@/lib/api";

export function GET(request: Request) {
  try {
    const query = parseModelQuery(new URL(request.url).searchParams);
    const filtered = filterAndSortModels(query);
    const page = paginateModels(filtered, query);
    return apiResponse(page.items.map(serializeModel), {
      ...page.pagination,
      query: {
        ...(query.q ? { q: query.q } : {}),
        ...(query.organization ? { organization: query.organization } : {}),
        ...(query.family ? { family: query.family } : {}),
        ...(query.openSource !== undefined ? { openSource: query.openSource } : {}),
        ...(query.modality ? { modality: query.modality } : {}),
        ...(query.benchmark ? { benchmark: query.benchmark } : {}),
        ...(query.minScore !== undefined ? { minScore: query.minScore } : {}),
        sort: query.sort,
        order: query.order,
      },
      facets: modelFacets(),
    });
  } catch (error) {
    return handleApiQueryError(error);
  }
}

export function OPTIONS() {
  return apiOptions();
}
