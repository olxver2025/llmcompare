import {
  apiResponse,
  apiOptions,
  filterAndSortMediaModels,
  handleApiQueryError,
  imageModelFacets,
  paginateModels,
  parseMediaModelQuery,
  serializeImageModel,
} from "@/lib/api";
import { getAllImageModels } from "@/lib/media-models";

export function GET(request: Request) {
  try {
    const query = parseMediaModelQuery(new URL(request.url).searchParams);
    const filtered = filterAndSortMediaModels(query, getAllImageModels(), {
      priceOf: (model) => model.pricing?.perImage,
      eloOf: (model) => model.benchmarks["image-arena-elo"],
    });
    const page = paginateModels(filtered, query);
    return apiResponse(page.items.map(serializeImageModel), {
      ...page.pagination,
      query: {
        ...(query.q ? { q: query.q } : {}),
        ...(query.organization ? { organization: query.organization } : {}),
        ...(query.openSource !== undefined ? { openSource: query.openSource } : {}),
        sort: query.sort,
        order: query.order,
      },
      facets: imageModelFacets(),
    });
  } catch (error) {
    return handleApiQueryError(error);
  }
}

export function OPTIONS() {
  return apiOptions();
}
