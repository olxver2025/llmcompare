import {
  apiResponse,
  apiOptions,
  filterAndSortMediaModels,
  handleApiQueryError,
  paginateModels,
  parseMediaModelQuery,
  serializeVideoModel,
  videoModelFacets,
} from "@/lib/api";
import { getAllVideoModels } from "@/lib/media-models";

export function GET(request: Request) {
  try {
    const query = parseMediaModelQuery(new URL(request.url).searchParams);
    const filtered = filterAndSortMediaModels(query, getAllVideoModels(), {
      priceOf: (model) => model.pricing?.perSecond,
      eloOf: (model) => model.benchmarks["video-arena-elo"],
    });
    const page = paginateModels(filtered, query);
    return apiResponse(page.items.map(serializeVideoModel), {
      ...page.pagination,
      query: {
        ...(query.q ? { q: query.q } : {}),
        ...(query.organization ? { organization: query.organization } : {}),
        ...(query.openSource !== undefined ? { openSource: query.openSource } : {}),
        sort: query.sort,
        order: query.order,
      },
      facets: videoModelFacets(),
    });
  } catch (error) {
    return handleApiQueryError(error);
  }
}

export function OPTIONS() {
  return apiOptions();
}
