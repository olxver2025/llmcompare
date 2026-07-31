import {
  apiNotFound,
  apiOptions,
  apiResponse,
  getVideoModelResource,
} from "@/lib/api";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const model = getVideoModelResource(slug);
  if (!model) return apiNotFound("video model", slug);
  return apiResponse(model);
}

export function OPTIONS() {
  return apiOptions();
}
