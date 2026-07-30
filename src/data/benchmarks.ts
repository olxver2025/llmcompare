import type { BenchmarkId, BenchmarkMeta } from "./types";

export const BENCHMARKS: Record<BenchmarkId, BenchmarkMeta> = {
  "mmlu-pro": {
    id: "mmlu-pro",
    name: "MMLU-Pro",
    shortName: "MMLU-Pro",
    description:
      "Harder multi-task language understanding across STEM and professional domains.",
    higherIsBetter: true,
    unit: "percent",
    category: "reasoning",
    sourceUrl: "https://github.com/TIGER-AI-Lab/MMLU-Pro",
  },
  "gpqa-diamond": {
    id: "gpqa-diamond",
    name: "GPQA Diamond",
    shortName: "GPQA",
    description:
      "Graduate-level Google-proof Q&A in biology, physics, and chemistry (diamond subset).",
    higherIsBetter: true,
    unit: "percent",
    category: "reasoning",
    sourceUrl: "https://github.com/idavidrein/gpqa",
  },
  hle: {
    id: "hle",
    name: "Humanity's Last Exam",
    shortName: "HLE",
    description:
      "Expert-level closed-ended questions across dozens of academic fields.",
    higherIsBetter: true,
    unit: "percent",
    category: "reasoning",
    sourceUrl: "https://agi.safe.ai/",
  },
  "aime-2025": {
    id: "aime-2025",
    name: "AIME 2025",
    shortName: "AIME",
    description:
      "American Invitational Mathematics Examination 2025 — contest math problems testing multi-step reasoning.",
    higherIsBetter: true,
    unit: "percent",
    category: "reasoning",
    sourceUrl: "https://matharena.ai/",
  },
  "math-500": {
    id: "math-500",
    name: "MATH-500",
    shortName: "MATH-500",
    description:
      "500-problem subset of the MATH competition dataset covering algebra, geometry, and number theory.",
    higherIsBetter: true,
    unit: "percent",
    category: "reasoning",
    sourceUrl: "https://huggingface.co/datasets/HuggingFaceH4/MATH-500",
  },
  simpleqa: {
    id: "simpleqa",
    name: "SimpleQA",
    shortName: "SimpleQA",
    description:
      "Short-form factuality benchmark measuring whether models give correct answers to challenging fact questions.",
    higherIsBetter: true,
    unit: "percent",
    category: "reasoning",
    sourceUrl: "https://openai.com/index/introducing-simpleqa/",
  },
  "swe-bench-verified": {
    id: "swe-bench-verified",
    name: "SWE-bench Verified",
    shortName: "SWE-bench",
    description:
      "Resolves real GitHub issues in popular Python repositories (human-verified subset).",
    higherIsBetter: true,
    unit: "percent",
    category: "coding",
    sourceUrl: "https://www.swebench.com/",
  },
  "swe-bench-pro": {
    id: "swe-bench-pro",
    name: "SWE-bench Pro",
    shortName: "SWE-Pro",
    description:
      "Long-horizon repository engineering across 1,865 tasks from 41 professional codebases (harder than Verified).",
    higherIsBetter: true,
    unit: "percent",
    category: "coding",
    sourceUrl: "https://scale.com/leaderboard/swe_bench_pro_public",
  },
  "swe-bench-multilingual": {
    id: "swe-bench-multilingual",
    name: "SWE-bench Multilingual",
    shortName: "SWE-Multi",
    description:
      "Real-world GitHub issue resolution across multiple programming languages beyond Python-only SWE-bench.",
    higherIsBetter: true,
    unit: "percent",
    category: "coding",
    sourceUrl: "https://www.swebench.com/",
  },
  livecodebench: {
    id: "livecodebench",
    name: "LiveCodeBench",
    shortName: "LiveCode",
    description:
      "Contamination-free coding problems collected after model training cutoffs.",
    higherIsBetter: true,
    unit: "percent",
    category: "coding",
    sourceUrl: "https://livecodebench.github.io/",
  },
  "terminal-bench-2": {
    id: "terminal-bench-2",
    name: "Terminal-Bench 2.0",
    shortName: "TermBench",
    description:
      "Agentic software engineering in real terminal environments — CLI workflows, debugging, and end-to-end task completion.",
    higherIsBetter: true,
    unit: "percent",
    category: "coding",
    sourceUrl: "https://www.tbench.ai/",
  },
  "aider-polyglot": {
    id: "aider-polyglot",
    name: "Aider Polyglot",
    shortName: "Aider",
    description:
      "Multi-language coding agent benchmark: edit existing codebases to pass unit tests across languages.",
    higherIsBetter: true,
    unit: "percent",
    category: "coding",
    sourceUrl: "https://aider.chat/docs/leaderboards/",
  },
  "bfcl-v3": {
    id: "bfcl-v3",
    name: "BFCL v3",
    shortName: "BFCL",
    description:
      "Berkeley Function-Calling Leaderboard v3 — tool/API calling accuracy across single and multi-turn scenarios.",
    higherIsBetter: true,
    unit: "percent",
    category: "coding",
    sourceUrl: "https://gorilla.cs.berkeley.edu/leaderboard.html",
  },
  scicode: {
    id: "scicode",
    name: "SciCode",
    shortName: "SciCode",
    description:
      "Scientific research coding across physics, math, chemistry, biology, and materials — domain knowledge plus precise code synthesis.",
    higherIsBetter: true,
    unit: "percent",
    category: "coding",
    sourceUrl: "https://scicode-bench.github.io/",
  },
  cursorbench: {
    id: "cursorbench",
    name: "CursorBench",
    shortName: "CursorBench",
    description:
      "Cursor's IDE-native agent eval on ambiguous, multi-file tasks from real Cursor sessions — correctness under agent scaffolding (v3.2).",
    higherIsBetter: true,
    unit: "percent",
    category: "coding",
    sourceUrl: "https://cursor.com/cursorbench",
  },
  "swe-rebench": {
    id: "swe-rebench",
    name: "SWE-Rebench",
    shortName: "SWE-Rebench",
    description:
      "Contamination-resistant software engineering: rolling window of fresh GitHub issues under a fixed ReAct agent scaffold.",
    higherIsBetter: true,
    unit: "percent",
    category: "coding",
    sourceUrl: "https://swe-rebench.com/",
  },
  nl2repo: {
    id: "nl2repo",
    name: "NL2Repo-Bench",
    shortName: "NL2Repo",
    description:
      "Long-horizon repository generation: build a full installable Python library from a natural-language spec, graded by upstream pytest.",
    higherIsBetter: true,
    unit: "percent",
    category: "coding",
    sourceUrl: "https://github.com/multimodal-art-projection/NL2RepoBench",
  },
  "vibe-code-bench": {
    id: "vibe-code-bench",
    name: "Vibe Code Bench",
    shortName: "Vibe Code",
    description:
      "End-to-end web app builds from natural-language specs in a production-like agent environment (Vals.ai Vibe Code Bench).",
    higherIsBetter: true,
    unit: "percent",
    category: "coding",
    sourceUrl: "https://www.vals.ai/benchmarks/vibe-code",
  },
  "webdev-arena": {
    id: "webdev-arena",
    name: "WebDev Arena",
    shortName: "WebDev Elo",
    description:
      "LMArena Code / WebDev human-preference Elo for front-end and agentic web development tasks.",
    higherIsBetter: true,
    unit: "elo",
    category: "coding",
    sourceUrl: "https://arena.ai/leaderboard/code/webdev",
  },
  "lmarena-elo": {
    id: "lmarena-elo",
    name: "LMArena Elo",
    shortName: "Arena Elo",
    description:
      "Blind pairwise human preference rating from the LMArena (Chatbot Arena) leaderboard.",
    higherIsBetter: true,
    unit: "elo",
    category: "arena",
    sourceUrl: "https://arena.ai/leaderboard",
  },
  "arena-hard": {
    id: "arena-hard",
    name: "Arena-Hard-Auto",
    shortName: "Arena-Hard",
    description:
      "Hard-prompt preference win rate evaluated automatically against a strong baseline (Arena-Hard-Auto v2).",
    higherIsBetter: true,
    unit: "percent",
    category: "arena",
    sourceUrl: "https://github.com/lmarena/arena-hard-auto",
  },
};

export const BENCHMARK_IDS = Object.keys(BENCHMARKS) as BenchmarkId[];

export const BENCHMARK_CATEGORIES = [
  {
    id: "reasoning" as const,
    label: "Reasoning & knowledge",
    ids: [
      "mmlu-pro",
      "gpqa-diamond",
      "hle",
      "aime-2025",
      "math-500",
      "simpleqa",
    ] as BenchmarkId[],
  },
  {
    id: "coding" as const,
    label: "Coding",
    ids: [
      "swe-bench-verified",
      "swe-bench-pro",
      "swe-bench-multilingual",
      "livecodebench",
      "terminal-bench-2",
      "aider-polyglot",
      "bfcl-v3",
      "scicode",
      "cursorbench",
      "swe-rebench",
      "nl2repo",
      "vibe-code-bench",
      "webdev-arena",
    ] as BenchmarkId[],
  },
  {
    id: "arena" as const,
    label: "Arena",
    ids: ["lmarena-elo", "arena-hard"] as BenchmarkId[],
  },
];
