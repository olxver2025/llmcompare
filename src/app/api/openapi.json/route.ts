import openapi from "../../../../Documents/api-openapi.json";
import { apiOptions } from "@/lib/api";

export const dynamic = "force-static";

export function GET() {
  return Response.json(openapi, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

export function OPTIONS() {
  return apiOptions();
}
