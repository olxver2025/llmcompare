import { apiNotFound, apiOptions, apiResponse, relatedModelResources } from "@/lib/api";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const related = relatedModelResources(slug);
  if (!related) return apiNotFound("model", slug);
  return apiResponse(related, { count: related.length, model: slug });
}

export function OPTIONS() {
  return apiOptions();
}
