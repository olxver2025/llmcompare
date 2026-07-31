import {
  apiError,
  apiOptions,
  apiResponse,
  compareResource,
  handleApiQueryError,
  parseCompareQuery,
} from "@/lib/api";

export function GET(request: Request) {
  try {
    const { a, b } = parseCompareQuery(new URL(request.url).searchParams);
    const comparison = compareResource(a, b);
    if (!comparison) {
      return apiError("NOT_FOUND", "One or both model slugs were not found.", 404, {
        a,
        b,
      });
    }
    return apiResponse(comparison);
  } catch (error) {
    return handleApiQueryError(error);
  }
}

export function OPTIONS() {
  return apiOptions();
}
