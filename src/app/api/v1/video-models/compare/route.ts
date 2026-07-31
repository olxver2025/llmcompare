import {
  apiOptions,
  apiResponse,
  handleApiQueryError,
  mediaCompareResource,
  parseCompareQuery,
} from "@/lib/api";

export function GET(request: Request) {
  try {
    const { a, b } = parseCompareQuery(new URL(request.url).searchParams);
    const comparison = mediaCompareResource("video", a, b);
    return apiResponse(comparison);
  } catch (error) {
    return handleApiQueryError(error);
  }
}

export function OPTIONS() {
  return apiOptions();
}
