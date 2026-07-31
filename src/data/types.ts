export type BenchmarkId =
  | "mmlu-pro"
  | "gpqa-diamond"
  | "hle"
  | "aime-2025"
  | "math-500"
  | "simpleqa"
  | "swe-bench-verified"
  | "swe-bench-pro"
  | "swe-bench-multilingual"
  | "livecodebench"
  | "terminal-bench-2-1"
  | "aider-polyglot"
  | "bfcl-v3"
  | "scicode"
  | "cursorbench"
  | "swe-rebench"
  | "nl2repo"
  | "vibe-code-bench"
  | "webdev-arena"
  | "lmarena-elo"
  | "arena-hard";

export type Model = {
  slug: string;
  name: string;
  organization: string;
  releaseDate: string;
  knowledgeCutoff?: string;
  openSource: boolean;
  license?: string;
  parameters?: { total?: number; active?: number };
  contextWindow: number;
  maxOutput?: number;
  modalities: { input: string[]; output: string[] };
  pricing?: {
    provider: string;
    inputPer1M: number;
    outputPer1M: number;
  };
  speed?: { tokensPerSec?: number; ttftSeconds?: number };
  benchmarks: Partial<Record<BenchmarkId, number>>;
  links: { docs?: string; modelCard?: string; announcement?: string };
  summary: string;
};

export type BenchmarkMeta = {
  id: BenchmarkId;
  name: string;
  shortName: string;
  description: string;
  higherIsBetter: boolean;
  unit: "percent" | "elo";
  category: "reasoning" | "coding" | "arena";
  sourceUrl: string;
};
