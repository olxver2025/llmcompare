import { BENCHMARKS } from "@/data/benchmarks";
import {
  apiNotFound,
  apiOptions,
  apiResponse,
  benchmarkResource,
  isBenchmarkId,
} from "@/lib/api";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isBenchmarkId(id)) return apiNotFound("benchmark", id);
  return apiResponse(benchmarkResource(id), {
    resource: BENCHMARKS[id].name,
  });
}

export function OPTIONS() {
  return apiOptions();
}
