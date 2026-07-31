import {
  apiNotFound,
  apiOptions,
  apiResponse,
  comparePairFromPath,
  compareResource,
} from "@/lib/api";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const pair = comparePairFromPath(slug);
  if (!pair) return apiNotFound("comparison", slug);
  const comparison = compareResource(pair.a, pair.b);
  if (!comparison) return apiNotFound("comparison", slug);
  return apiResponse(comparison);
}

export function OPTIONS() {
  return apiOptions();
}
