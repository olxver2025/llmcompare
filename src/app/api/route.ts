import { apiIndex, apiOptions, apiResponse } from "@/lib/api";

export const dynamic = "force-static";

export function GET() {
  return apiResponse(apiIndex());
}

export function OPTIONS() {
  return apiOptions();
}
