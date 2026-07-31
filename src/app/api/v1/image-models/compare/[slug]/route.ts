import {
  apiNotFound,
  apiOptions,
  apiResponse,
  comparePairFromPath,
  handleApiQueryError,
  mediaCompareResource,
} from "@/lib/api";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const pair = comparePairFromPath(slug);
  if (!pair) return apiNotFound("comparison", slug);
  try {
    const comparison = mediaCompareResource("image", pair.a, pair.b);
    return apiResponse(comparison);
  } catch (error) {
    return handleApiQueryError(error);
  }
}

export function OPTIONS() {
  return apiOptions();
}
