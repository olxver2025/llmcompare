import { apiOptions, apiResponse, organizationResources } from "@/lib/api";

export function GET() {
  const data = organizationResources();
  return apiResponse(data, { count: data.length });
}

export function OPTIONS() {
  return apiOptions();
}
