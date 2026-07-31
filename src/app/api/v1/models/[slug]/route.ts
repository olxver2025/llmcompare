import {
  apiNotFound,
  apiOptions,
  apiResponse,
  getModelResource,
  relatedModelResources,
} from "@/lib/api";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const model = getModelResource(slug);
  if (!model) return apiNotFound("model", slug);
  return apiResponse(model, {
    related: relatedModelResources(slug),
  });
}

export function OPTIONS() {
  return apiOptions();
}
