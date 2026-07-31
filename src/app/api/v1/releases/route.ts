import {
  apiResponse,
  apiOptions,
  filterAndSortModels,
  handleApiQueryError,
  paginateModels,
  parseModelQuery,
  serializeModel,
} from "@/lib/api";

export function GET(request: Request) {
  try {
    const query = parseModelQuery(new URL(request.url).searchParams, {
      sort: "releaseDate",
      order: "desc",
    });
    const filtered = filterAndSortModels(query);
    const page = paginateModels(filtered, query);
    return apiResponse(page.items.map(serializeModel), {
      ...page.pagination,
      query: {
        ...(query.q ? { q: query.q } : {}),
        ...(query.organization ? { organization: query.organization } : {}),
        ...(query.family ? { family: query.family } : {}),
        ...(query.openSource !== undefined ? { openSource: query.openSource } : {}),
        ...(query.benchmark ? { benchmark: query.benchmark } : {}),
        sort: query.sort,
        order: query.order,
      },
    });
  } catch (error) {
    return handleApiQueryError(error);
  }
}

export function OPTIONS() {
  return apiOptions();
}
