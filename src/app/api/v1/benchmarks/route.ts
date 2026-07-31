import { BENCHMARK_CATEGORIES, BENCHMARK_IDS } from "@/data/benchmarks";
import {
  apiResponse,
  apiOptions,
  benchmarkResource,
  handleApiQueryError,
} from "@/lib/api";

export function GET() {
  try {
    return apiResponse(
      BENCHMARK_IDS.map(benchmarkResource),
      {
        count: BENCHMARK_IDS.length,
        categories: BENCHMARK_CATEGORIES,
      }
    );
  } catch (error) {
    return handleApiQueryError(error);
  }
}

export function OPTIONS() {
  return apiOptions();
}
