import {
  apiNotFound,
  apiOptions,
  apiResponse,
  getImageModelResource,
} from "@/lib/api";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const model = getImageModelResource(slug);
  if (!model) return apiNotFound("image model", slug);
  return apiResponse(model);
}

export function OPTIONS() {
  return apiOptions();
}
