import type { BenchmarkId, BenchmarkMeta } from "./types";

export const BENCHMARKS: Record<BenchmarkId, BenchmarkMeta> = {
  "mmlu-pro": {
    id: "mmlu-pro",
    name: "MMLU-Pro",
    shortName: "MMLU-Pro",
    description:
      "Harder multi-task language understanding across STEM and professional domains; reported results depend on prompt, shot count, and reasoning/tool settings.",
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
      "Graduate-level Google-proof Q&A in biology, physics, and chemistry (diamond subset); scores are only comparable when evaluation protocol and tool access match.",
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
      "Expert-level closed-ended questions across dozens of academic fields; tool access, modality, and evaluation protocol must match before scores are compared.",
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
      "American Invitational Mathematics Examination 2025 — contest math problems testing multi-step reasoning; model reports may differ by answer format and sampling setup.",
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
      "500-problem subset of the MATH competition dataset covering algebra, geometry, and number theory; scores are protocol-sensitive and not interchangeable with AIME results.",
    higherIsBetter: true,
    unit: "percent",
    category: "reasoning",
    sourceUrl: "https://huggingface.co/datasets/HuggingFaceH4/MATH-500",
  },
  "swe-bench-verified": {
    id: "swe-bench-verified",
    name: "SWE-bench Verified",
    shortName: "SWE-bench",
    description:
      "Resolves real GitHub issues in popular Python repositories (500-task human-verified subset); agent scaffold, patch budget, and test policy materially affect the result.",
    higherIsBetter: true,
    unit: "percent",
    category: "coding",
    sourceUrl: "https://www.swebench.com/verified.html",
  },
  "swe-bench-pro": {
    id: "swe-bench-pro",
    name: "SWE-bench Pro",
    shortName: "SWE-Pro",
    description:
      "Long-horizon repository engineering across 1,865 tasks from 41 professional codebases; leaderboard results are agent-system scores, not model-only capability scores.",
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
      "Real-world GitHub issue resolution across 300 tasks, 42 repositories, and 9 programming languages; agent scaffold and language mix matter.",
    higherIsBetter: true,
    unit: "percent",
    category: "coding",
    sourceUrl: "https://www.swebench.com/multilingual.html",
  },
  livecodebench: {
    id: "livecodebench",
    name: "LiveCodeBench",
    shortName: "LiveCode",
    description:
      "Contamination-resistant coding problems collected after model training cutoffs; score depends on the LiveCodeBench release and pass@k protocol.",
    higherIsBetter: true,
    unit: "percent",
    category: "coding",
    sourceUrl: "https://livecodebench.github.io/",
  },
  "terminal-bench-2-1": {
    id: "terminal-bench-2-1",
    name: "Terminal-Bench 2.1",
    shortName: "TermBench",
    description:
      "Terminal-Bench 2.1 contains 89 agentic terminal tasks. Scores are agent-system results and vary with harness, effort level, timeout, resource allocation, task revision, and evaluation date; they are not model-only measurements.",
    higherIsBetter: true,
    unit: "percent",
    category: "coding",
    sourceUrl: "https://www.tbench.ai/leaderboard/terminal-bench/2.1",
  },
  "aider-polyglot": {
    id: "aider-polyglot",
    name: "Aider Polyglot",
    shortName: "Aider",
    description:
      "Multi-language coding agent benchmark: edit existing codebases to pass unit tests across languages; score depends on the Aider model prompt and edit strategy.",
    higherIsBetter: true,
    unit: "percent",
    category: "coding",
    sourceUrl: "https://aider.chat/docs/leaderboards/",
  },

  "terminal-bench-3": {
    id: "terminal-bench-3",
    name: "Terminal-Bench 3",
    shortName: "TermBench 3",
    description:
      "Next-generation agentic terminal benchmark (Frontier-Bench); scores are agent-system results that vary with harness, effort, and evaluation date.",
    higherIsBetter: true,
    unit: "percent",
    category: "coding",
    sourceUrl: "https://www.frontierbench.ai/",
  },

  bigcodebench: {
    id: "bigcodebench",
    name: "BigCodeBench",
    shortName: "BigCodeBench",
    description:
      "Realistic function-level coding benchmark with 1,140 tasks across 7 languages; pass@1 depends on the release and prompting.",
    higherIsBetter: true,
    unit: "percent",
    category: "coding",
    sourceUrl: "https://bigcode-bench.github.io/",
  },

  "tau-bench": {
    id: "tau-bench",
    name: "Tau-bench",
    shortName: "Tau-bench",
    description:
      "Realistic tool-agent user interactions in airline, retail, and banking domains; scores are agent-system results, not model-only capability.",
    higherIsBetter: true,
    unit: "percent",
    category: "tool",
    sourceUrl: "https://github.com/sierra-research/tau-bench",
  },











  matharena: {
    id: "matharena",
    name: "MathArena",
    shortName: "MathArena",
    description:
      "MathArena contest-math leaderboard (AIME, AMC, olympiad-style); results depend on answer-format extraction and evaluation date.",
    higherIsBetter: true,
    unit: "percent",
    category: "math",
    sourceUrl: "https://matharena.ai/",
  },
  scicode: {
    id: "scicode",
    name: "SciCode",
    shortName: "SciCode",
    description:
      "Scientific research coding across physics, math, chemistry, biology, and materials — domain knowledge plus precise code synthesis; benchmark version and harness must match.",
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
      "Cursor's IDE-native agent eval on ambiguous, multi-file tasks from real Cursor sessions — correctness under Cursor's agent scaffolding (v3.2), not a model-only test.",
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
      "Contamination-resistant software engineering: rolling window of fresh GitHub issues under a fixed ReAct agent scaffold; scores are tied to the published task window.",
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
      "Long-horizon repository generation: build a full installable Python library from a natural-language spec, graded by upstream pytest; harness and task release are part of the result.",
    higherIsBetter: true,
    unit: "percent",
    category: "coding",
    sourceUrl: "https://github.com/multimodal-art-projection/NL2RepoBench",
  },
  cybergym: {
    id: "cybergym",
    name: "CyberGym",
    shortName: "CyberGym",
    description:
      "Cybersecurity benchmark (UC Berkeley Sunblaze) evaluating AI agents on real-world vulnerability discovery and exploitation tasks; scores are agent-system results that vary with harness and environment.",
    higherIsBetter: true,
    unit: "percent",
    category: "agent",
    sourceUrl: "https://github.com/sunblaze-ucb/cybergym",
  },
  deepswe: {
    id: "deepswe",
    name: "DeepSWE",
    shortName: "DeepSWE",
    description:
      "DataCurve's long-horizon software-engineering benchmark of 113 original tasks across TypeScript, Go, Python, JavaScript, and Rust with program-based verifiers; scores are agent-system results under the eval harness.",
    higherIsBetter: true,
    unit: "percent",
    category: "coding",
    sourceUrl: "https://github.com/datacurve-ai/deep-swe",
  },
  "toolathlon-verified": {
    id: "toolathlon-verified",
    name: "Toolathlon-Verified",
    shortName: "Toolathlon V.",
    description:
      "Verified subset of Toolathlon, a tool-use benchmark measuring selecting, sequencing, and completing multi-step tasks with external tools; keep distinct from unverified Toolathlon runs.",
    higherIsBetter: true,
    unit: "percent",
    category: "tool",
    sourceUrl: "https://toolathlon.xyz/docs/leaderboard",
  },
  "agents-last-exam": {
    id: "agents-last-exam",
    name: "Agents' Last Exam",
    shortName: "ALE",
    description:
      "Agent benchmark of long-horizon, real-world tasks requiring tool use and multi-step execution; results are agent-system measurements published by the evaluating provider.",
    higherIsBetter: true,
    unit: "percent",
    category: "agent",
    sourceUrl: "https://agents-last-exam.org/",
  },
  "automation-bench": {
    id: "automation-bench",
    name: "AutomationBench (Public)",
    shortName: "AutoBench",
    description:
      "Zapier benchmark evaluating how reliably agents complete realistic business workflows across 47 simulated SaaS tools; scores are agent-system results and depend on the scaffold.",
    higherIsBetter: true,
    unit: "percent",
    category: "agent",
    sourceUrl: "https://github.com/zapier/AutomationBench",
  },
  "webdev-arena": {
    id: "webdev-arena",
    name: "WebDev Arena",
    shortName: "WebDev Elo",
    description:
      "LMArena Code / WebDev human-preference Elo for front-end and agentic web development tasks; this is a time-varying leaderboard snapshot, not a fixed model property.",
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
      "Blind pairwise human preference rating from the LMArena (Chatbot Arena) leaderboard; ratings drift with traffic, model aliases, sampling, and leaderboard methodology.",
    higherIsBetter: true,
    unit: "elo",
    category: "arena",
    sourceUrl: "https://arena.ai/leaderboard",
  },
  "terminal-bench-4": {
    id: "terminal-bench-4",
    name: "Terminal-Bench 4.0",
    shortName: "TermBench 4",
    description:
      "Semantically-versioned continuation of Terminal-Bench with recalibrated task resources and a refreshed, less-saturated task set; scores are agent-system results that vary with harness, effort level, and evaluation date, and are not directly comparable to Terminal-Bench 2.x or 3 results.",
    higherIsBetter: true,
    unit: "percent",
    category: "coding",
    sourceUrl: "https://www.tbench.ai/leaderboard/terminal-bench/4.0",
  },
  "terminal-bench-science": {
    id: "terminal-bench-science",
    name: "Terminal-Bench-Science 0.1",
    shortName: "TB-Science",
    description:
      "Agentic scientific-research workflows across the life, physical, Earth, mathematical, and engineering sciences, built on the Terminal-Bench harness with tasks authored by domain experts and verified programmatically. Scores are agent-system results with a wide per-model standard error (roughly ±3.5-4.5 pts) and are not comparable across benchmark releases.",
    higherIsBetter: true,
    unit: "percent",
    category: "agent",
    sourceUrl: "https://www.tbench.ai/news/terminal-bench-science-0-1",
  },
  "gdpval-aa": {
    id: "gdpval-aa",
    name: "GDPval-AA v2",
    shortName: "GDPval-AA",
    description:
      "Artificial Analysis's agentic evaluation of OpenAI's GDPval task set, covering real-world knowledge work across dozens of occupations and industries. Scored via blind pairwise comparison fit to a Bradley-Terry Elo model anchored at 1000 for human-expert deliverables; requires shell and browser access through an agent harness (Stirrup), so it is not a raw model-only capability score.",
    higherIsBetter: true,
    unit: "elo",
    category: "agent",
    sourceUrl: "https://artificialanalysis.ai/evaluations/gdpval-aa",
  },
  "osworld-2-partial": {
    id: "osworld-2-partial",
    name: "OSWorld 2.0 (Partial Credit)",
    shortName: "OSWorld Partial",
    description:
      "OSWorld 2.0 long-horizon computer-use benchmark under partial-credit scoring, which awards credit for subtasks completed within a long real-world desktop workflow. Agent-system result tied to harness, tool access, and the specific task release used; not comparable to pre-2.0 OSWorld results.",
    higherIsBetter: true,
    unit: "percent",
    category: "agent",
    sourceUrl: "https://os-world.github.io/",
  },
  "osworld-2-strict": {
    id: "osworld-2-strict",
    name: "OSWorld 2.0 (Strict)",
    shortName: "OSWorld Strict",
    description:
      "OSWorld 2.0 long-horizon computer-use benchmark under strict scoring, which requires the full task to complete for credit. Agent-system result tied to harness, tool access, and the specific task release used; not comparable to partial-credit OSWorld 2.0 scores or to pre-2.0 OSWorld results.",
    higherIsBetter: true,
    unit: "percent",
    category: "agent",
    sourceUrl: "https://os-world.github.io/",
  },
  "frontiermath-tier-4-v2": {
    id: "frontiermath-tier-4-v2",
    name: "FrontierMath Tier 4 (v2)",
    shortName: "FrontierMath T4",
    description:
      "Epoch AI's FrontierMath benchmark, Tier 4 (v2 problem set): exceptionally difficult, original research-level mathematics problems vetted by expert mathematicians. Tier 4 is not comparable to FrontierMath Tiers 1-3, and v2 problem sets are not comparable to v1 results.",
    higherIsBetter: true,
    unit: "percent",
    category: "math",
    sourceUrl: "https://epoch.ai/benchmarks/frontiermath-tier-4-v2",
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
    ] as BenchmarkId[],
  },
  {
    id: "math" as const,
    label: "Math",
    ids: ["matharena"] as BenchmarkId[],
  },
  {
    id: "coding" as const,
    label: "Coding",
    ids: [
      "swe-bench-verified",
      "swe-bench-pro",
      "swe-bench-multilingual",
      "livecodebench",
      "terminal-bench-2-1",
      "terminal-bench-3",
      "terminal-bench-4",
      "aider-polyglot",
      "scicode",
      "cursorbench",
      "swe-rebench",
      "nl2repo",
      "deepswe",
      "webdev-arena",
      "bigcodebench",
    ] as BenchmarkId[],
  },
  {
    id: "tool" as const,
    label: "Tool use & function calling",
    ids: [
      "tau-bench",
      "toolathlon-verified",
    ] as BenchmarkId[],
  },
  {
    id: "agent" as const,
    label: "Agents & computer use",
    ids: [
      "cybergym",
      "agents-last-exam",
      "automation-bench",
      "terminal-bench-science",
      "gdpval-aa",
      "osworld-2-partial",
      "osworld-2-strict",
    ] as BenchmarkId[],
  },
  {
    id: "arena" as const,
    label: "Arena",
    ids: ["lmarena-elo"] as BenchmarkId[],
  },
];
