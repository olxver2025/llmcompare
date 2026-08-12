import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const asOf = "2026-08-12";
const checkOnly = process.argv.includes("--check");

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value &&
    value <= asOf
  );
}

function load(path, exportName) {
  const source = fs.readFileSync(path, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const compiledModule = { exports: {} };
  vm.runInNewContext(compiled, {
    exports: compiledModule.exports,
    module: compiledModule,
    require,
  });
  return compiledModule.exports[exportName];
}

const models = load("src/data/models.ts", "models");
const auditedValues = JSON.parse(
  fs.readFileSync("scripts/benchmark-retained-values.json", "utf8")
);
if (auditedValues.asOf !== asOf) {
  throw new Error(
    `Retained-value manifest is dated ${auditedValues.asOf}; expected ${asOf}`
  );
}
const auditedCells = auditedValues.cells ?? {};

const sourceOverrides = {
  "gpt-5-6-sol": {
    "swe-bench-pro": {
      sourceUrl: "https://openai.com/index/previewing-gpt-5-6-sol/",
      evaluationDate: "2026-07-09",
      protocol: "GPT-5.6 Sol SWE-bench Pro, OpenAI-reported agent evaluation.",
    },
    "terminal-bench-2-1": {
      sourceUrl: "https://openai.com/index/previewing-gpt-5-6-sol/",
      evaluationDate: "2026-07-09",
      protocol: "GPT-5.6 Sol Terminal-Bench 2.1, OpenAI-reported terminal-agent evaluation.",
    },
  },
  "gpt-5-6-terra": {
    "swe-bench-pro": {
      sourceUrl: "https://openai.com/index/previewing-gpt-5-6-sol/",
      evaluationDate: "2026-07-09",
      protocol: "GPT-5.6 Terra SWE-bench Pro, OpenAI-reported agent evaluation.",
    },
    "terminal-bench-2-1": {
      sourceUrl: "https://openai.com/index/previewing-gpt-5-6-sol/",
      evaluationDate: "2026-07-09",
      protocol: "GPT-5.6 Terra Terminal-Bench 2.1, OpenAI-reported terminal-agent evaluation.",
    },
  },
  "gpt-5-6-luna": {
    "swe-bench-pro": {
      sourceUrl: "https://openai.com/index/previewing-gpt-5-6-sol/",
      evaluationDate: "2026-07-09",
      protocol: "GPT-5.6 Luna SWE-bench Pro, OpenAI-reported agent evaluation.",
    },
    "terminal-bench-2-1": {
      sourceUrl: "https://openai.com/index/previewing-gpt-5-6-sol/",
      evaluationDate: "2026-07-09",
      protocol: "GPT-5.6 Luna Terminal-Bench 2.1, OpenAI-reported terminal-agent evaluation.",
    },
  },
  "gpt-5-5": {
    "gpqa-diamond": {
      sourceUrl: "https://openai.com/index/introducing-gpt-5-5/",
      evaluationDate: "2026-04-23",
      protocol: "GPQA Diamond, no tools.",
    },
    hle: {
      sourceUrl: "https://openai.com/index/introducing-gpt-5-5/",
      evaluationDate: "2026-04-23",
      protocol: "Humanity's Last Exam, no tools.",
    },
    "swe-bench-pro": {
      sourceUrl: "https://openai.com/index/introducing-gpt-5-5/",
      evaluationDate: "2026-04-23",
      protocol: "Public SWE-bench Pro, single-pass agent evaluation.",
    },
  },
  "gpt-5-4": {
    "gpqa-diamond": {
      sourceUrl: "https://openai.com/index/introducing-gpt-5-4/",
      evaluationDate: "2026-03-05",
      protocol: "GPQA Diamond, no tools.",
    },
    hle: {
      sourceUrl: "https://openai.com/index/introducing-gpt-5-4/",
      evaluationDate: "2026-03-05",
      protocol: "Humanity's Last Exam, no tools.",
    },
    "swe-bench-pro": {
      sourceUrl: "https://openai.com/index/introducing-gpt-5-4/",
      evaluationDate: "2026-03-05",
      protocol: "Public SWE-bench Pro, single-pass agent evaluation.",
    },
  },
  "gpt-5-4-mini": {
    "gpqa-diamond": {
      sourceUrl: "https://openai.com/index/introducing-gpt-5-4-mini-and-nano/",
      evaluationDate: "2026-03-17",
      protocol: "GPQA Diamond, xhigh reasoning effort, no tools.",
    },
    hle: {
      sourceUrl: "https://openai.com/index/introducing-gpt-5-4-mini-and-nano/",
      evaluationDate: "2026-03-17",
      protocol: "Humanity's Last Exam without tools, xhigh reasoning effort.",
    },
    "swe-bench-pro": {
      sourceUrl: "https://openai.com/index/introducing-gpt-5-4-mini-and-nano/",
      evaluationDate: "2026-03-17",
      protocol: "Public SWE-bench Pro, single-pass agent evaluation.",
    },
  },
  "gpt-5-4-nano": {
    "gpqa-diamond": {
      sourceUrl: "https://openai.com/index/introducing-gpt-5-4-mini-and-nano/",
      evaluationDate: "2026-03-17",
      protocol: "GPQA Diamond, xhigh reasoning effort, no tools.",
    },
    hle: {
      sourceUrl: "https://openai.com/index/introducing-gpt-5-4-mini-and-nano/",
      evaluationDate: "2026-03-17",
      protocol: "Humanity's Last Exam without tools, xhigh reasoning effort.",
    },
    "swe-bench-pro": {
      sourceUrl: "https://openai.com/index/introducing-gpt-5-4-mini-and-nano/",
      evaluationDate: "2026-03-17",
      protocol: "Public SWE-bench Pro, single-pass agent evaluation.",
    },
  },
  "claude-haiku-4-5": {
    "swe-bench-verified": {
      sourceUrl: "https://www.anthropic.com/news/claude-haiku-4-5",
      evaluationDate: "2025-10-15",
      protocol:
        "SWE-bench Verified, full 500 tasks; bash and string-edit scaffold; 50-trial average; 128K thinking budget; no test-time compute.",
    },
  },
  "claude-opus-4-1": {
    "swe-bench-verified": {
      sourceUrl: "https://www.anthropic.com/news/claude-opus-4-1",
      evaluationDate: "2025-08-05",
      protocol:
        "SWE-bench Verified, full 500-task report using Anthropic's two-tool bash and string-edit scaffold; no extended thinking.",
    },
  },
  "deepseek-v3": {
    "mmlu-pro": {
      sourceUrl: "https://arxiv.org/html/2412.19437",
      evaluationDate: "2024-12-26",
      protocol: "DeepSeek-V3 technical report; MMLU-Pro exact match.",
    },
    "math-500": {
      sourceUrl: "https://arxiv.org/html/2412.19437",
      evaluationDate: "2024-12-26",
      protocol: "DeepSeek-V3 technical report; MATH-500 greedy evaluation.",
    },
    simpleqa: {
      sourceUrl: "https://arxiv.org/html/2412.19437",
      evaluationDate: "2024-12-26",
      protocol: "DeepSeek-V3 technical report; SimpleQA Correct metric.",
    },
  },
  "deepseek-r1": {
    "mmlu-pro": {
      sourceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-R1/raw/main/README.md",
      evaluationDate: "2025-01-20",
      protocol: "MMLU-Pro EM; official DeepSeek-R1 evaluation table.",
    },
    "gpqa-diamond": {
      sourceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-R1/raw/main/README.md",
      evaluationDate: "2025-01-20",
      protocol: "GPQA Diamond pass@1; official DeepSeek-R1 evaluation table.",
    },
    "aime-2025": {
      sourceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-R1/raw/main/README.md",
      evaluationDate: "2025-01-20",
      protocol: "AIME 2025 pass@1; sampled evaluation with temperature 0.6 and top-p 0.95.",
    },
    "math-500": {
      sourceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-R1/raw/main/README.md",
      evaluationDate: "2025-01-20",
      protocol: "MATH-500 pass@1; official DeepSeek-R1 evaluation table.",
    },
    simpleqa: {
      sourceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-R1/raw/main/README.md",
      evaluationDate: "2025-01-20",
      protocol: "SimpleQA Correct; official DeepSeek-R1 evaluation table.",
    },
    "swe-bench-verified": {
      sourceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-R1/raw/main/README.md",
      evaluationDate: "2025-01-20",
      protocol: "SWE-bench Verified resolved rate; official Agentless evaluation.",
    },
    "aider-polyglot": {
      sourceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-R1/raw/main/README.md",
      evaluationDate: "2025-01-20",
      protocol: "Aider-Polyglot accuracy; official DeepSeek-R1 evaluation table.",
    },
  },
  "deepseek-r1-0528": {
    "mmlu-pro": {
      sourceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-R1-0528/raw/main/README.md",
      evaluationDate: "2025-05-28",
      protocol: "MMLU-Pro EM; official R1-0528 evaluation table.",
    },
    "gpqa-diamond": {
      sourceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-R1-0528/raw/main/README.md",
      evaluationDate: "2025-05-28",
      protocol: "GPQA Diamond pass@1; official R1-0528 evaluation table.",
    },
    hle: {
      sourceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-R1-0528/raw/main/README.md",
      evaluationDate: "2025-05-28",
      protocol: "Humanity's Last Exam pass@1 on text-only prompts.",
    },
    "aime-2025": {
      sourceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-R1-0528/raw/main/README.md",
      evaluationDate: "2025-05-28",
      protocol: "AIME 2025 pass@1; 16 samples per question with temperature 0.6 and top-p 0.95.",
    },
    simpleqa: {
      sourceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-R1-0528/raw/main/README.md",
      evaluationDate: "2025-05-28",
      protocol: "SimpleQA Correct; official R1-0528 evaluation table.",
    },
    "swe-bench-verified": {
      sourceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-R1-0528/raw/main/README.md",
      evaluationDate: "2025-05-28",
      protocol: "SWE-bench Verified resolved rate using the Agentless framework.",
    },
    livecodebench: {
      sourceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-R1-0528/raw/main/README.md",
      evaluationDate: "2025-05-28",
      protocol: "LiveCodeBench 2408-2505 pass@1.",
    },
    "aider-polyglot": {
      sourceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-R1-0528/raw/main/README.md",
      evaluationDate: "2025-05-28",
      protocol: "Aider-Polyglot accuracy; official R1-0528 evaluation table.",
    },
  },
  "deepseek-v3-1": {
    "mmlu-pro": {
      sourceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-V3.1/raw/main/README.md",
      evaluationDate: "2025-08-21",
      protocol: "V3.1 Thinking MMLU-Pro EM.",
    },
    "gpqa-diamond": {
      sourceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-V3.1/raw/main/README.md",
      evaluationDate: "2025-08-21",
      protocol: "V3.1 Thinking GPQA Diamond pass@1.",
    },
    hle: {
      sourceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-V3.1/raw/main/README.md",
      evaluationDate: "2025-08-21",
      protocol: "V3.1 Thinking Humanity's Last Exam pass@1.",
    },
    "aime-2025": {
      sourceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-V3.1/raw/main/README.md",
      evaluationDate: "2025-08-21",
      protocol: "V3.1 Thinking AIME 2025 pass@1.",
    },
    livecodebench: {
      sourceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-V3.1/raw/main/README.md",
      evaluationDate: "2025-08-21",
      protocol: "V3.1 Thinking LiveCodeBench 2408-2505 pass@1.",
    },
    "aider-polyglot": {
      sourceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-V3.1/raw/main/README.md",
      evaluationDate: "2025-08-21",
      protocol: "V3.1 Thinking Aider-Polyglot accuracy.",
    },
  },
  "deepseek-v4-flash": {
    "terminal-bench-2-1": {
      sourceUrl: "https://api-docs.deepseek.com/updates/",
      evaluationDate: "2026-07-31",
      protocol:
        "DeepSeek-V4-Flash-0731 public beta; Terminal-Bench 2.1 with DeepSeek Harness minimal mode, max effort, top_p=0.95, temperature=1.0.",
    },
    nl2repo: {
      sourceUrl: "https://api-docs.deepseek.com/updates/",
      evaluationDate: "2026-07-31",
      protocol:
        "DeepSeek-V4-Flash-0731 public beta; NL2Repo with DeepSeek Harness minimal mode, max effort, top_p=0.95, temperature=1.0.",
    },
  },
  "gemini-3-pro": {
    "gpqa-diamond": {
      sourceUrl: "https://blog.google/products-and-platforms/products/gemini/gemini-3/",
      evaluationDate: "2025-11-18",
      protocol: "GPQA Diamond, no tools.",
    },
    hle: {
      sourceUrl: "https://blog.google/products-and-platforms/products/gemini/gemini-3/",
      evaluationDate: "2025-11-18",
      protocol: "Humanity's Last Exam, no tools.",
    },
    "lmarena-elo": {
      sourceUrl: "https://blog.google/products-and-platforms/products/gemini/gemini-3/",
      evaluationDate: "2025-11-18",
      protocol: "LMArena launch snapshot; volatile Elo, not a timeless model property.",
    },
  },
  "gemini-3-1-pro": {
    "gpqa-diamond": {
      sourceUrl: "https://deepmind.google/models/model-cards/gemini-3-1-pro/",
      evaluationDate: "2026-02-19",
      protocol: "GPQA Diamond, Thinking High, no tools.",
    },
    hle: {
      sourceUrl: "https://deepmind.google/models/model-cards/gemini-3-1-pro/",
      evaluationDate: "2026-02-19",
      protocol: "Humanity's Last Exam, no tools.",
    },
    "swe-bench-verified": {
      sourceUrl: "https://deepmind.google/models/model-cards/gemini-3-1-pro/",
      evaluationDate: "2026-02-19",
      protocol: "SWE-bench Verified, Google single-attempt agent scaffold.",
    },
  },
  "gemma-4-31b": {
    "mmlu-pro": {
      sourceUrl: "https://huggingface.co/google/gemma-4-31b-it",
      evaluationDate: "2026-04-08",
      protocol: "Gemma 4 instruction-tuned MMLU Pro result.",
    },
    "gpqa-diamond": {
      sourceUrl: "https://huggingface.co/google/gemma-4-31b-it",
      evaluationDate: "2026-04-08",
      protocol: "Gemma 4 instruction-tuned GPQA Diamond, no tools.",
    },
    hle: {
      sourceUrl: "https://huggingface.co/google/gemma-4-31b-it",
      evaluationDate: "2026-04-08",
      protocol: "Humanity's Last Exam, no tools.",
    },
    livecodebench: {
      sourceUrl: "https://huggingface.co/google/gemma-4-31b-it",
      evaluationDate: "2026-04-08",
      protocol: "LiveCodeBench v6.",
    },
  },
  "gemma-4-26b": {
    "mmlu-pro": {
      sourceUrl: "https://huggingface.co/google/gemma-4-26B-A4B-it",
      evaluationDate: "2026-04-08",
      protocol: "Gemma 4 instruction-tuned MMLU Pro result.",
    },
    "gpqa-diamond": {
      sourceUrl: "https://huggingface.co/google/gemma-4-26B-A4B-it",
      evaluationDate: "2026-04-08",
      protocol: "Gemma 4 instruction-tuned GPQA Diamond, no tools.",
    },
    hle: {
      sourceUrl: "https://huggingface.co/google/gemma-4-26B-A4B-it",
      evaluationDate: "2026-04-08",
      protocol: "Humanity's Last Exam, no tools.",
    },
    livecodebench: {
      sourceUrl: "https://huggingface.co/google/gemma-4-26B-A4B-it",
      evaluationDate: "2026-04-08",
      protocol: "LiveCodeBench v6.",
    },
  },
  "gemma-3-12b": {
    "mmlu-pro": {
      sourceUrl: "https://ai.google.dev/gemma/docs/core/model_card_3",
      evaluationDate: "2025-03-12",
      protocol: "Gemma 3 IT, 0-shot MMLU (Pro).",
    },
    "gpqa-diamond": {
      sourceUrl: "https://ai.google.dev/gemma/docs/core/model_card_3",
      evaluationDate: "2025-03-12",
      protocol: "Gemma 3 IT, 0-shot GPQA Diamond.",
    },
    simpleqa: {
      sourceUrl: "https://ai.google.dev/gemma/docs/core/model_card_3",
      evaluationDate: "2025-03-12",
      protocol: "Gemma 3 IT, 0-shot SimpleQA.",
    },
    livecodebench: {
      sourceUrl: "https://ai.google.dev/gemma/docs/core/model_card_3",
      evaluationDate: "2025-03-12",
      protocol: "Gemma 3 IT, 0-shot LiveCodeBench.",
    },
  },
  "gemma-3-4b": {
    "mmlu-pro": {
      sourceUrl: "https://ai.google.dev/gemma/docs/core/model_card_3",
      evaluationDate: "2025-03-12",
      protocol: "Gemma 3 IT, 0-shot MMLU (Pro).",
    },
    "gpqa-diamond": {
      sourceUrl: "https://ai.google.dev/gemma/docs/core/model_card_3",
      evaluationDate: "2025-03-12",
      protocol: "Gemma 3 IT, 0-shot GPQA Diamond.",
    },
    simpleqa: {
      sourceUrl: "https://ai.google.dev/gemma/docs/core/model_card_3",
      evaluationDate: "2025-03-12",
      protocol: "Gemma 3 IT, 0-shot SimpleQA.",
    },
    livecodebench: {
      sourceUrl: "https://ai.google.dev/gemma/docs/core/model_card_3",
      evaluationDate: "2025-03-12",
      protocol: "Gemma 3 IT, 0-shot LiveCodeBench.",
    },
  },
  "llama-4-maverick": {
    "mmlu-pro": {
      sourceUrl: "https://huggingface.co/meta-llama/Llama-4-Maverick-17B-128E-Instruct",
      evaluationDate: "2025-04-05",
      protocol: "Meta Llama 4 Instruct MMLU-Pro result.",
    },
    livecodebench: {
      sourceUrl: "https://huggingface.co/meta-llama/Llama-4-Maverick-17B-128E-Instruct",
      evaluationDate: "2025-04-05",
      protocol: "Meta Llama 4 Instruct LiveCodeBench, published collection window.",
    },
    "aider-polyglot": {
      sourceUrl: "https://aider.chat/docs/leaderboards/",
      evaluationDate: "2025-04-06",
      protocol: "Aider Polyglot whole benchmark leaderboard snapshot.",
    },
  },
  "llama-4-scout": {
    "mmlu-pro": {
      sourceUrl: "https://huggingface.co/meta-llama/Llama-4-Scout-17B-16E-Instruct",
      evaluationDate: "2025-04-05",
      protocol: "Meta Llama 4 Instruct MMLU-Pro result.",
    },
    livecodebench: {
      sourceUrl: "https://huggingface.co/meta-llama/Llama-4-Scout-17B-16E-Instruct",
      evaluationDate: "2025-04-05",
      protocol: "Meta Llama 4 Instruct LiveCodeBench, published collection window.",
    },
  },
  "llama-3-3-70b": {
    "mmlu-pro": {
      sourceUrl: "https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct",
      evaluationDate: "2024-12-06",
      protocol: "Meta Llama 3.3 Instruct MMLU-Pro result.",
    },
    "gpqa-diamond": {
      sourceUrl: "https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct",
      evaluationDate: "2024-12-06",
      protocol: "Meta Llama 3.3 Instruct GPQA result, retained under the catalog's GPQA field.",
    },
  },
  "llama-3-1-70b": {
    "mmlu-pro": {
      sourceUrl: "https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/MODEL_CARD.md",
      evaluationDate: "2024-07-23",
      protocol: "Meta Llama 3.1 Instruct MMLU-Pro, 5-shot CoT.",
    },
  },
  "llama-3-1-8b": {
    "mmlu-pro": {
      sourceUrl: "https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/MODEL_CARD.md",
      evaluationDate: "2024-07-23",
      protocol: "Meta Llama 3.1 Instruct MMLU-Pro, 5-shot CoT.",
    },
  },
  "llama-3-1-405b": {
    "mmlu-pro": {
      sourceUrl: "https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/MODEL_CARD.md",
      evaluationDate: "2024-07-23",
      protocol: "Meta Llama 3.1 Instruct MMLU-Pro, 5-shot CoT.",
    },
  },
  "nemotron-3-ultra": {
    "mmlu-pro": {
      sourceUrl: "https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16",
      evaluationDate: "2026-06-03",
      protocol: "NVIDIA model card MMLU-Pro evaluation.",
    },
    "swe-bench-verified": {
      sourceUrl: "https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16",
      evaluationDate: "2026-06-03",
      protocol: "NVIDIA model card SWE-bench Verified agent evaluation.",
    },
    "swe-bench-multilingual": {
      sourceUrl: "https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16",
      evaluationDate: "2026-06-03",
      protocol: "NVIDIA model card SWE-bench Multilingual agent evaluation.",
    },
    hle: {
      sourceUrl: "https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16",
      evaluationDate: "2026-06-03",
      protocol: "Humanity's Last Exam, no tools.",
    },
    livecodebench: {
      sourceUrl: "https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16",
      evaluationDate: "2026-06-03",
      protocol: "LiveCodeBench v6.",
    },
    "terminal-bench-2-1": {
      sourceUrl: "https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16",
      evaluationDate: "2026-06-03",
      protocol: "Terminal-Bench 2.1.",
    },
  },
  "nemotron-nano-3-30b": {
    "mmlu-pro": {
      sourceUrl: "https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16",
      evaluationDate: "2025-12-15",
      protocol: "NVIDIA model card MMLU-Pro evaluation.",
    },
    hle: {
      sourceUrl: "https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16",
      evaluationDate: "2025-12-15",
      protocol: "Humanity's Last Exam, no tools.",
    },
    "aime-2025": {
      sourceUrl: "https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16",
      evaluationDate: "2025-12-15",
      protocol: "AIME 2025, no tools.",
    },
    livecodebench: {
      sourceUrl: "https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16",
      evaluationDate: "2025-12-15",
      protocol: "LiveCodeBench v6.",
    },
  },
  "nemotron-nano-9b": {
    hle: {
      sourceUrl: "https://huggingface.co/nvidia/NVIDIA-Nemotron-Nano-9B-v2",
      evaluationDate: "2025-08-18",
      protocol: "NVIDIA NeMo-Skills reasoning-on HLE evaluation.",
    },
    "aime-2025": {
      sourceUrl: "https://huggingface.co/nvidia/NVIDIA-Nemotron-Nano-9B-v2",
      evaluationDate: "2025-08-18",
      protocol: "NVIDIA NeMo-Skills reasoning-on AIME 2025 evaluation.",
    },
    "math-500": {
      sourceUrl: "https://huggingface.co/nvidia/NVIDIA-Nemotron-Nano-9B-v2",
      evaluationDate: "2025-08-18",
      protocol: "NVIDIA NeMo-Skills reasoning-on MATH-500 evaluation.",
    },
    livecodebench: {
      sourceUrl: "https://huggingface.co/nvidia/NVIDIA-Nemotron-Nano-9B-v2",
      evaluationDate: "2025-08-18",
      protocol: "NVIDIA NeMo-Skills reasoning-on LiveCodeBench evaluation.",
    },
    "bfcl-v3": {
      sourceUrl: "https://huggingface.co/nvidia/NVIDIA-Nemotron-Nano-9B-v2",
      evaluationDate: "2025-08-18",
      protocol: "NVIDIA NeMo-Skills BFCL v3 evaluation.",
    },
  },
  "kimi-k2-5": {
    "mmlu-pro": {
      sourceUrl: "https://huggingface.co/moonshotai/Kimi-K2.5",
      evaluationDate: "2026-01-27",
      protocol: "Kimi K2.5 Thinking MMLU-Pro.",
    },
    "gpqa-diamond": {
      sourceUrl: "https://huggingface.co/moonshotai/Kimi-K2.5",
      evaluationDate: "2026-01-27",
      protocol: "Kimi K2.5 Thinking GPQA Diamond; 96K maximum completion budget.",
    },
    hle: {
      sourceUrl: "https://huggingface.co/moonshotai/Kimi-K2.5",
      evaluationDate: "2026-01-27",
      protocol: "Kimi K2.5 Thinking HLE-Full without tools; 96K maximum completion budget.",
    },
    "aime-2025": {
      sourceUrl: "https://huggingface.co/moonshotai/Kimi-K2.5",
      evaluationDate: "2026-01-27",
      protocol: "Kimi K2.5 Thinking AIME 2025; 96K maximum completion budget.",
    },
    "swe-bench-verified": {
      sourceUrl: "https://huggingface.co/moonshotai/Kimi-K2.5",
      evaluationDate: "2026-01-27",
      protocol: "Kimi K2.5 SWE-bench Verified agent evaluation.",
    },
    "swe-bench-pro": {
      sourceUrl: "https://huggingface.co/moonshotai/Kimi-K2.5",
      evaluationDate: "2026-01-27",
      protocol: "Kimi K2.5 SWE-bench Pro agent evaluation.",
    },
    "swe-bench-multilingual": {
      sourceUrl: "https://huggingface.co/moonshotai/Kimi-K2.5",
      evaluationDate: "2026-01-27",
      protocol: "Kimi K2.5 SWE-bench Multilingual agent evaluation.",
    },
    livecodebench: {
      sourceUrl: "https://huggingface.co/moonshotai/Kimi-K2.5",
      evaluationDate: "2026-01-27",
      protocol: "Kimi K2.5 LiveCodeBench v6.",
    },
    scicode: {
      sourceUrl: "https://huggingface.co/moonshotai/Kimi-K2.5",
      evaluationDate: "2026-01-27",
      protocol: "Kimi K2.5 SciCode evaluation.",
    },
  },
  "kimi-k3": {
    "gpqa-diamond": {
      sourceUrl: "https://huggingface.co/moonshotai/Kimi-K3/raw/main/README.md",
      evaluationDate: "2026-07-16",
      protocol: "Kimi K3 max GPQA Diamond, no tools; reasoning effort max.",
    },
    hle: {
      sourceUrl: "https://huggingface.co/moonshotai/Kimi-K3/raw/main/README.md",
      evaluationDate: "2026-07-16",
      protocol: "Kimi K3 max HLE-Full without tools; the card reports 43.5 without tools and 56.0 with tools.",
    },
    scicode: {
      sourceUrl: "https://huggingface.co/moonshotai/Kimi-K3/raw/main/README.md",
      evaluationDate: "2026-07-16",
      protocol: "Kimi K3 max SciCode evaluation.",
    },
    "terminal-bench-2-1": {
      sourceUrl: "https://huggingface.co/moonshotai/Kimi-K3/raw/main/README.md",
      evaluationDate: "2026-07-16",
      protocol: "Kimi K3 max Terminal-Bench 2.1 using the Kimi Code harness.",
    },
  },
  "qwen3-7-max": {
    "gpqa-diamond": {
      sourceUrl: "https://www.alibabacloud.com/blog/qwen3-7-the-agent-frontier_603154",
      evaluationDate: "2026-05-21",
      protocol: "Qwen3.7-Max GPQA Diamond, reasoning high.",
    },
    hle: {
      sourceUrl: "https://www.alibabacloud.com/blog/qwen3-7-the-agent-frontier_603154",
      evaluationDate: "2026-05-21",
      protocol: "Qwen3.7-Max Humanity's Last Exam, reasoning high.",
    },
    "swe-bench-verified": {
      sourceUrl: "https://www.alibabacloud.com/blog/qwen3-7-the-agent-frontier_603154",
      evaluationDate: "2026-05-21",
      protocol: "Qwen3.7-Max SWE-bench Verified using Alibaba's internal agent scaffold.",
    },
    "swe-bench-multilingual": {
      sourceUrl: "https://www.alibabacloud.com/blog/qwen3-7-the-agent-frontier_603154",
      evaluationDate: "2026-05-21",
      protocol: "Qwen3.7-Max SWE-bench Multilingual using Alibaba's internal agent scaffold.",
    },
    scicode: {
      sourceUrl: "https://www.alibabacloud.com/blog/qwen3-7-the-agent-frontier_603154",
      evaluationDate: "2026-05-21",
      protocol: "Qwen3.7-Max SciCode evaluation.",
    },
  },
  "qwq-32b": {
    "aime-2025": {
      sourceUrl: "https://raw.githubusercontent.com/QwenLM/QwQ/main/eval/README.md",
      evaluationDate: "2025-03-06",
      protocol: "QwQ-32B AIME25, 64 samples; temperature 0.6, top-p 0.95, top-k 40, max tokens 32768.",
    },
    livecodebench: {
      sourceUrl: "https://raw.githubusercontent.com/QwenLM/QwQ/main/eval/README.md",
      evaluationDate: "2025-03-06",
      protocol: "QwQ-32B LiveCodeBench 2408-2502.",
    },
  },
  "seed-2-pro": {
    "gpqa-diamond": {
      sourceUrl: "https://seed.bytedance.com/en/seed2",
      evaluationDate: "2026-02-15",
      protocol: "Seed2.0 Pro 0215 pre-release GPQA Diamond.",
    },
    hle: {
      sourceUrl: "https://seed.bytedance.com/en/seed2",
      evaluationDate: "2026-02-15",
      protocol: "Seed2.0 Pro 0215 pre-release HLE, no tool and text only.",
    },
    "swe-bench-pro": {
      sourceUrl: "https://seed.bytedance.com/en/seed2",
      evaluationDate: "2026-02-15",
      protocol: "Seed2.0 Pro 0215 pre-release SWE-bench Pro.",
    },
    "swe-bench-multilingual": {
      sourceUrl: "https://seed.bytedance.com/en/seed2",
      evaluationDate: "2026-02-15",
      protocol: "Seed2.0 Pro 0215 pre-release SWE Multilingual.",
    },
    nl2repo: {
      sourceUrl: "https://seed.bytedance.com/en/seed2",
      evaluationDate: "2026-02-15",
      protocol: "Seed2.0 Pro 0215 pre-release NL2Repo-Bench.",
    },
  },
  inkling: {
    "gpqa-diamond": {
      sourceUrl: "https://thinkingmachines.ai/news/introducing-inkling/",
      evaluationDate: "2026-07-15",
      protocol: "Inkling GPQA Diamond; score reported in the launch comparison table.",
    },
    "swe-bench-verified": {
      sourceUrl: "https://thinkingmachines.ai/news/introducing-inkling/",
      evaluationDate: "2026-07-15",
      protocol: "Inkling SWE-bench Verified; bash-only agent setup.",
    },
    "swe-bench-pro": {
      sourceUrl: "https://thinkingmachines.ai/news/introducing-inkling/",
      evaluationDate: "2026-07-15",
      protocol: "Inkling SWE-bench Pro; provider/leaderboard comparison table.",
    },
    scicode: {
      sourceUrl: "https://huggingface.co/thinkingmachines/Inkling-Small/raw/main/README.md",
      evaluationDate: "2026-07-14",
      protocol:
        "Inkling model-card comparison table, SciCode row, Inkling column; score reported as 46.1%.",
    },
    "terminal-bench-2-1": {
      sourceUrl: "https://thinkingmachines.ai/news/introducing-inkling/",
      evaluationDate: "2026-07-15",
      protocol: "Inkling Terminal-Bench 2.1 comparison table.",
    },
  },
  "inkling-small": {
    "gpqa-diamond": {
      sourceUrl: "https://thinkingmachines.ai/news/inkling-small/",
      evaluationDate: "2026-07-30",
      protocol: "Inkling-Small GPQA Diamond; score reported in the launch comparison table.",
    },
    "swe-bench-verified": {
      sourceUrl: "https://thinkingmachines.ai/news/inkling-small/",
      evaluationDate: "2026-07-30",
      protocol: "Inkling-Small SWE-bench Verified; bash-only agent setup.",
    },
    "swe-bench-pro": {
      sourceUrl: "https://thinkingmachines.ai/news/inkling-small/",
      evaluationDate: "2026-07-30",
      protocol: "Inkling-Small SWE-bench Pro; provider/leaderboard comparison table.",
    },
    scicode: {
      sourceUrl: "https://thinkingmachines.ai/news/inkling-small/",
      evaluationDate: "2026-07-30",
      protocol: "Inkling-Small SciCode evaluation.",
    },
    "terminal-bench-2-1": {
      sourceUrl: "https://thinkingmachines.ai/news/inkling-small/",
      evaluationDate: "2026-07-30",
      protocol: "Inkling-Small Terminal-Bench 2.1 comparison table.",
    },
  },
  "composer-2-5": {
    "swe-bench-multilingual": {
      sourceUrl: "https://cursor.com/composer",
      evaluationDate: "2026-05-18",
      protocol: "Cursor Composer 2.5 SWE-bench Multilingual result.",
    },
    cursorbench: {
      sourceUrl: "https://cursor.com/cursorbench",
      evaluationDate: "2026-07-08",
      protocol: "CursorBench 3.2.",
    },
    "vibe-code-bench": {
      sourceUrl: "https://www.vals.ai/benchmarks/vibe-code",
      evaluationDate: "2026-07-13",
      protocol: "Vibe Code Bench v1.1 snapshot.",
    },
  },
  "composer-2-5-fast": {
    "swe-bench-multilingual": {
      sourceUrl: "https://cursor.com/composer",
      evaluationDate: "2026-05-18",
      protocol:
        "Cursor Composer 2.5 SWE-bench Multilingual result; Fast is the same underlying Composer 2.5 intelligence SKU.",
    },
    cursorbench: {
      sourceUrl: "https://cursor.com/cursorbench",
      evaluationDate: "2026-07-08",
      protocol: "CursorBench 3.2; same underlying Composer 2.5 intelligence SKU.",
    },
    "vibe-code-bench": {
      sourceUrl: "https://www.vals.ai/benchmarks/vibe-code",
      evaluationDate: "2026-07-13",
      protocol: "Vibe Code Bench v1.1 snapshot; same underlying Composer 2.5 intelligence SKU.",
    },
  },
  "grok-4-6": {
    cursorbench: {
      sourceUrl: "https://x.ai/news/grok-4-6",
      evaluationDate: "2026-08-12",
      protocol:
        "Grok 4.6 CursorBench v3.2, SpaceXAI-reported agent evaluation at launch.",
    },
  },
  "muse-glimmer": {
    "swe-bench-verified": {
      sourceUrl: "https://huggingface.co/meta-models/Muse-Glimmer-30B",
      evaluationDate: "2026-08-10",
      protocol: "Muse Glimmer SWE-bench Verified, Meta model-card high reasoning result.",
    },
    "swe-bench-pro": {
      sourceUrl: "https://huggingface.co/meta-models/Muse-Glimmer-30B",
      evaluationDate: "2026-08-10",
      protocol: "Muse Glimmer SWE-bench Pro, Meta model-card agent evaluation.",
    },
    "terminal-bench-2-1": {
      sourceUrl: "https://huggingface.co/meta-models/Muse-Glimmer-30B",
      evaluationDate: "2026-08-10",
      protocol: "Muse Glimmer Terminal-Bench 2.1 with terminus2, Meta model-card result.",
    },
    "gpqa-diamond": {
      sourceUrl: "https://huggingface.co/meta-models/Muse-Glimmer-30B",
      evaluationDate: "2026-08-10",
      protocol: "Muse Glimmer GPQA Diamond (AA), Meta model-card result.",
    },
    hle: {
      sourceUrl: "https://huggingface.co/meta-models/Muse-Glimmer-30B",
      evaluationDate: "2026-08-10",
      protocol: "Muse Glimmer HLE Text (AA), Meta model-card result.",
    },
    scicode: {
      sourceUrl: "https://huggingface.co/meta-models/Muse-Glimmer-30B",
      evaluationDate: "2026-08-10",
      protocol: "Muse Glimmer SciCode, Meta model-card result.",
    },
  },
};

const cells = {};
for (const model of models) {
  cells[model.slug] = {};
  for (const [id, value] of Object.entries(model.benchmarks ?? {})) {
    const auditedValue = auditedCells[model.slug]?.[id];
    if (!Number.isFinite(auditedValue)) {
      throw new Error(
        `Missing independently reviewed value for retained cell ${model.slug}/${id}`
      );
    }
    if (auditedValue !== value) {
      throw new Error(
        `Catalog value differs from independently reviewed value for ${model.slug}/${id}`
      );
    }
    const override = sourceOverrides[model.slug]?.[id];
    if (
      !override?.sourceUrl ||
      !override?.evaluationDate ||
      !override?.protocol
    ) {
      throw new Error(
        `Missing explicit evidence override for retained cell ${model.slug}/${id}`
      );
    }
    if (!isIsoDate(override.evaluationDate)) {
      throw new Error(
        `Invalid evaluation date for retained cell ${model.slug}/${id}`
      );
    }
    if (/\bsubtask\b|not the full benchmark/i.test(override.protocol)) {
      throw new Error(
        `Non-comparable protocol note for retained cell ${model.slug}/${id}`
      );
    }
    cells[model.slug][id] = {
      value: auditedValue,
      sourceUrl: override.sourceUrl,
      checkedOn: asOf,
      protocol: override.protocol,
      evaluationDate: override.evaluationDate,
    };
  }
}

for (const [slug, values] of Object.entries(auditedCells)) {
  if (!cells[slug]) {
    throw new Error(`Retained-value manifest references unknown model ${slug}`);
  }
  for (const [id, value] of Object.entries(values)) {
    if (cells[slug][id]?.value !== value) {
      throw new Error(
        `Retained-value manifest references unretained cell ${slug}/${id}`
      );
    }
  }
}

for (const [slug, overrides] of Object.entries(sourceOverrides)) {
  if (!cells[slug]) {
    throw new Error(`Evidence override references unknown model ${slug}`);
  }
  for (const id of Object.keys(overrides)) {
    if (!cells[slug][id]) {
      throw new Error(`Evidence override references unretained cell ${slug}/${id}`);
    }
  }
}

const output = `${JSON.stringify(
  {
    asOf,
    policy:
      "Every retained numeric cell requires an independently reviewed value plus an explicit source URL, evaluation date, and protocol note. The ledger does not make cross-harness results comparable.",
    cells,
  },
  null,
  2
)}\n`;
const ledgerPath = "scripts/benchmark-evidence.json";

if (checkOnly) {
  const existing = fs.readFileSync(ledgerPath, "utf8");
  if (existing !== output) {
    console.error(`${ledgerPath} is stale; run npm run generate:evidence`);
    process.exitCode = 1;
  }
} else {
  fs.writeFileSync(ledgerPath, output);
}
