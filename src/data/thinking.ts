import type { BenchmarkId, ThinkingFamily } from "./types";

export const THINKING_FAMILIES: Record<string, ThinkingFamily> = {
  "openai-gpt-6-astra": {
    id: "openai-gpt-6-astra",
    param: "reasoning.effort",
    sourceUrl: "https://developers.openai.com/api/docs/models/gpt-6-astra",
    levels: [
      { id: "low", label: "low" },
      { id: "medium", label: "medium" },
      { id: "high", label: "high" },
      { id: "xhigh", label: "xhigh" },
      { id: "max", label: "max" },
    ],
  },
  "openai-gpt-5-6": {
    id: "openai-gpt-5-6",
    param: "reasoning.effort",
    sourceUrl: "https://developers.openai.com/api/docs/models/gpt-5.6-sol",
    levels: [
      { id: "none", label: "none" },
      { id: "low", label: "low" },
      { id: "medium", label: "medium" },
      { id: "high", label: "high" },
      { id: "xhigh", label: "xhigh" },
      { id: "max", label: "max" },
    ],
  },
  "openai-gpt-5-5": {
    id: "openai-gpt-5-5",
    param: "reasoning.effort",
    sourceUrl: "https://developers.openai.com/api/docs/models/gpt-5.5",
    levels: [
      { id: "none", label: "none" },
      { id: "low", label: "low" },
      { id: "medium", label: "medium" },
      { id: "high", label: "high" },
      { id: "xhigh", label: "xhigh" },
    ],
  },
  "openai-gpt-5-4": {
    id: "openai-gpt-5-4",
    param: "reasoning.effort",
    sourceUrl: "https://developers.openai.com/api/docs/models/gpt-5.4",
    levels: [
      { id: "none", label: "none" },
      { id: "low", label: "low" },
      { id: "medium", label: "medium" },
      { id: "high", label: "high" },
      { id: "xhigh", label: "xhigh" },
    ],
  },
  "openai-gpt-5-5-pro": {
    id: "openai-gpt-5-5-pro",
    param: "reasoning.effort",
    sourceUrl: "https://developers.openai.com/api/docs/models/gpt-5.5-pro",
    levels: [
      { id: "medium", label: "medium" },
      { id: "high", label: "high" },
      { id: "xhigh", label: "xhigh" },
    ],
  },
  "openai-gpt-5-4-pro": {
    id: "openai-gpt-5-4-pro",
    param: "reasoning.effort",
    sourceUrl: "https://developers.openai.com/api/docs/models/gpt-5.4-pro",
    levels: [
      { id: "medium", label: "medium" },
      { id: "high", label: "high" },
      { id: "xhigh", label: "xhigh" },
    ],
  },
  "openai-gpt-5": {
    id: "openai-gpt-5",
    param: "reasoning.effort",
    sourceUrl: "https://developers.openai.com/api/docs/models/gpt-5",
    levels: [
      { id: "minimal", label: "minimal" },
      { id: "low", label: "low" },
      { id: "medium", label: "medium" },
      { id: "high", label: "high" },
    ],
  },
  "anthropic-effort-xhigh-max": {
    id: "anthropic-effort-xhigh-max",
    param: "output_config.effort",
    sourceUrl: "https://platform.claude.com/docs/en/build-with-claude/effort",
    levels: [
      { id: "low", label: "low" },
      { id: "medium", label: "medium" },
      { id: "high", label: "high" },
      { id: "xhigh", label: "xhigh" },
      { id: "max", label: "max" },
    ],
  },
  "anthropic-effort-max": {
    id: "anthropic-effort-max",
    param: "output_config.effort",
    sourceUrl: "https://platform.claude.com/docs/en/build-with-claude/effort",
    levels: [
      { id: "low", label: "low" },
      { id: "medium", label: "medium" },
      { id: "high", label: "high" },
      { id: "max", label: "max" },
    ],
  },
  "anthropic-effort-high": {
    id: "anthropic-effort-high",
    param: "output_config.effort",
    sourceUrl: "https://platform.claude.com/docs/en/build-with-claude/effort",
    levels: [
      { id: "low", label: "low" },
      { id: "medium", label: "medium" },
      { id: "high", label: "high" },
    ],
  },
  "xai-grok-4-6": {
    id: "xai-grok-4-6",
    param: "reasoning_effort",
    sourceUrl: "https://docs.x.ai/docs/guides/reasoning",
    levels: [
      { id: "low", label: "low" },
      { id: "medium", label: "medium" },
      { id: "high", label: "high" },
      { id: "xhigh", label: "xhigh" },
    ],
  },
  "xai-grok-4-5": {
    id: "xai-grok-4-5",
    param: "reasoning_effort",
    sourceUrl: "https://docs.x.ai/docs/guides/reasoning",
    levels: [
      { id: "low", label: "low" },
      { id: "medium", label: "medium" },
      { id: "high", label: "high" },
    ],
  },
  "cursor-grok-effort": {
    id: "cursor-grok-effort",
    param: "effort",
    sourceUrl: "https://cursor.com/docs/models",
    levels: [
      { id: "low", label: "low" },
      { id: "medium", label: "medium" },
      { id: "high", label: "high" },
    ],
  },
  "deepseek-v4": {
    id: "deepseek-v4",
    param: "reasoning_effort",
    sourceUrl: "https://api-docs.deepseek.com/guides/thinking_mode",
    levels: [
      { id: "none", label: "none" },
      { id: "low", label: "low" },
      { id: "high", label: "high" },
      { id: "max", label: "max" },
    ],
  },
  "qwen3-thinking": {
    id: "qwen3-thinking",
    param: "thinking mode",
    sourceUrl: "https://arxiv.org/abs/2505.09388",
    levels: [
      { id: "no-thinking", label: "no thinking" },
      { id: "thinking", label: "thinking" },
    ],
  },
  "kimi-k3": {
    id: "kimi-k3",
    param: "reasoning_effort",
    sourceUrl: "https://platform.kimi.ai/docs/guide/use-reasoning-effort",
    levels: [
      { id: "low", label: "low" },
      { id: "high", label: "high" },
      { id: "max", label: "max" },
    ],
  },
  "kimi-k2-toggle": {
    id: "kimi-k2-toggle",
    param: "thinking.type",
    sourceUrl: "https://platform.kimi.ai/docs/guide/use-thinking-models",
    levels: [
      { id: "disabled", label: "disabled" },
      { id: "enabled", label: "enabled" },
    ],
  },
  "kimi-k2-7-code": {
    id: "kimi-k2-7-code",
    param: "thinking.type",
    sourceUrl: "https://platform.kimi.ai/docs/guide/use-thinking-models",
    levels: [{ id: "enabled", label: "enabled" }],
  },
  "mistral-reasoning-effort": {
    id: "mistral-reasoning-effort",
    param: "reasoning_effort",
    sourceUrl: "https://docs.mistral.ai/studio/conversations/reasoning",
    levels: [
      { id: "none", label: "none" },
      { id: "high", label: "high" },
    ],
  },
  "cohere-thinking": {
    id: "cohere-thinking",
    param: "thinking.type",
    sourceUrl: "https://docs.cohere.com/docs/reasoning",
    levels: [
      { id: "disabled", label: "disabled" },
      { id: "enabled", label: "enabled" },
    ],
  },
  "ibm-granite-4-2": {
    id: "ibm-granite-4-2",
    param: "enable_thinking",
    sourceUrl: "https://www.ibm.com/granite/docs/models/granite4-2",
    levels: [
      { id: "non-thinking", label: "non-thinking" },
      { id: "low-effort", label: "low-effort" },
      { id: "thinking", label: "thinking" },
    ],
  },
  hy4: {
    id: "hy4",
    param: "reasoning_effort",
    sourceUrl: "https://huggingface.co/tencent/Hy4-preview",
    levels: [
      { id: "no-think", label: "no_think" },
      { id: "high", label: "high" },
    ],
  },
  "ling-3-0": {
    id: "ling-3-0",
    param: "enable_thinking",
    sourceUrl: "https://huggingface.co/inclusionAI/Ling-3.0-flash",
    levels: [
      { id: "disabled", label: "disabled" },
      { id: "enabled", label: "enabled" },
    ],
  },
  "glm-5-3": {
    id: "glm-5-3",
    param: "reasoning_effort",
    sourceUrl: "https://huggingface.co/zai-org/GLM-5.3",
    levels: [
      { id: "low", label: "low" },
      { id: "high", label: "high" },
      { id: "max", label: "max" },
    ],
  },
};

export type ModelThinkingAssignment = {
  familyId: string;
  levelIds: string[];
};

export const MODEL_THINKING: Record<string, ModelThinkingAssignment> = {
  "gpt-6-astra": {
    familyId: "openai-gpt-6-astra",
    levelIds: ["low", "medium", "high", "xhigh", "max"],
  },
  "gpt-5-6-sol": {
    familyId: "openai-gpt-5-6",
    levelIds: ["none", "low", "medium", "high", "xhigh", "max"],
  },
  "gpt-5-6-terra": {
    familyId: "openai-gpt-5-6",
    levelIds: ["none", "low", "medium", "high", "xhigh", "max"],
  },
  "gpt-5-6-luna": {
    familyId: "openai-gpt-5-6",
    levelIds: ["none", "low", "medium", "high", "xhigh", "max"],
  },
  "gpt-5-5": {
    familyId: "openai-gpt-5-5",
    levelIds: ["none", "low", "medium", "high", "xhigh"],
  },
  "gpt-5-4": {
    familyId: "openai-gpt-5-4",
    levelIds: ["none", "low", "medium", "high", "xhigh"],
  },
  "gpt-5-4-mini": {
    familyId: "openai-gpt-5-4",
    levelIds: ["none", "low", "medium", "high", "xhigh"],
  },
  "gpt-5-4-nano": {
    familyId: "openai-gpt-5-4",
    levelIds: ["none", "low", "medium", "high", "xhigh"],
  },
  "gpt-5-5-pro": {
    familyId: "openai-gpt-5-5-pro",
    levelIds: ["medium", "high", "xhigh"],
  },
  "gpt-5-4-pro": {
    familyId: "openai-gpt-5-4-pro",
    levelIds: ["medium", "high", "xhigh"],
  },
  "gpt-5": {
    familyId: "openai-gpt-5",
    levelIds: ["minimal", "low", "medium", "high"],
  },
  "claude-opus-5": {
    familyId: "anthropic-effort-xhigh-max",
    levelIds: ["low", "medium", "high", "xhigh", "max"],
  },
  "claude-fable-5": {
    familyId: "anthropic-effort-xhigh-max",
    levelIds: ["low", "medium", "high", "xhigh", "max"],
  },
  "claude-fable-5-1": {
    familyId: "anthropic-effort-xhigh-max",
    levelIds: ["low", "medium", "high", "xhigh", "max"],
  },
  "claude-mythos-5": {
    familyId: "anthropic-effort-xhigh-max",
    levelIds: ["low", "medium", "high", "xhigh", "max"],
  },
  "claude-opus-4-8": {
    familyId: "anthropic-effort-xhigh-max",
    levelIds: ["low", "medium", "high", "xhigh", "max"],
  },
  "claude-opus-4-7": {
    familyId: "anthropic-effort-xhigh-max",
    levelIds: ["low", "medium", "high", "xhigh", "max"],
  },
  "claude-sonnet-5": {
    familyId: "anthropic-effort-xhigh-max",
    levelIds: ["low", "medium", "high", "xhigh", "max"],
  },
  "claude-opus-4-6": {
    familyId: "anthropic-effort-max",
    levelIds: ["low", "medium", "high", "max"],
  },
  "claude-sonnet-4-6": {
    familyId: "anthropic-effort-max",
    levelIds: ["low", "medium", "high", "max"],
  },
  "claude-opus-4-5": {
    familyId: "anthropic-effort-high",
    levelIds: ["low", "medium", "high"],
  },
  "grok-4-6": {
    familyId: "xai-grok-4-6",
    levelIds: ["low", "medium", "high", "xhigh"],
  },
  "grok-4-5": {
    familyId: "xai-grok-4-5",
    levelIds: ["low", "medium", "high"],
  },
  "cursor-grok-4-5": {
    familyId: "cursor-grok-effort",
    levelIds: ["low", "medium", "high"],
  },
  "deepseek-v4-pro": {
    familyId: "deepseek-v4",
    levelIds: ["none", "low", "high", "max"],
  },
  "deepseek-v4-flash": {
    familyId: "deepseek-v4",
    levelIds: ["none", "low", "high", "max"],
  },
  "deepseek-v4-pro-0813": {
    familyId: "deepseek-v4",
    levelIds: ["none", "low", "high", "max"],
  },
  "deepseek-v4-flash-0731": {
    familyId: "deepseek-v4",
    levelIds: ["none", "low", "high", "max"],
  },
  "qwen3-235b": {
    familyId: "qwen3-thinking",
    levelIds: ["no-thinking", "thinking"],
  },
  "qwen3-32b": {
    familyId: "qwen3-thinking",
    levelIds: ["no-thinking", "thinking"],
  },
  "kimi-k3": {
    familyId: "kimi-k3",
    levelIds: ["low", "high", "max"],
  },
  "kimi-k2-6": {
    familyId: "kimi-k2-toggle",
    levelIds: ["disabled", "enabled"],
  },
  "kimi-k2-5": {
    familyId: "kimi-k2-toggle",
    levelIds: ["disabled", "enabled"],
  },
  "kimi-k2-7-code": {
    familyId: "kimi-k2-7-code",
    levelIds: ["enabled"],
  },
  "mistral-medium-3-5": {
    familyId: "mistral-reasoning-effort",
    levelIds: ["none", "high"],
  },
  "mistral-small-4": {
    familyId: "mistral-reasoning-effort",
    levelIds: ["none", "high"],
  },
  "command-a-reasoning": {
    familyId: "cohere-thinking",
    levelIds: ["disabled", "enabled"],
  },
  "granite-4-2-30b": {
    familyId: "ibm-granite-4-2",
    levelIds: ["non-thinking", "low-effort", "thinking"],
  },
  "granite-4-2-8b": {
    familyId: "ibm-granite-4-2",
    levelIds: ["non-thinking", "low-effort", "thinking"],
  },
  "hy4-preview": {
    familyId: "hy4",
    levelIds: ["no-think", "high"],
  },
  "ling-3-0-flash": {
    familyId: "ling-3-0",
    levelIds: ["disabled", "enabled"],
  },
  "glm-5-3": {
    familyId: "glm-5-3",
    levelIds: ["low", "high", "max"],
  },
};

export const BENCHMARK_THINKING_LEVELS: Record<
  string,
  Partial<Record<BenchmarkId, string>>
> = {
  "gpt-5-6-sol": {
    cursorbench: "max",
    "lmarena-elo": "xhigh",
  },
  "gpt-5-6-terra": {
    cursorbench: "max",
    "lmarena-elo": "xhigh",
  },
  "gpt-5-6-luna": {
    cursorbench: "max",
    "lmarena-elo": "xhigh",
  },
  "gpt-5-5": {
    "terminal-bench-2-1": "xhigh",
    cursorbench: "xhigh",
  },
  "gpt-5": {
    "aider-polyglot": "high",
  },
  "gpt-5-4-mini": {
    "gpqa-diamond": "xhigh",
    hle: "xhigh",
  },
  "gpt-5-4-nano": {
    "gpqa-diamond": "xhigh",
    hle: "xhigh",
  },
  "claude-opus-5": {
    cursorbench: "max",
    "lmarena-elo": "high",
  },
  "claude-fable-5": {
    cursorbench: "max",
    "terminal-bench-2-1": "xhigh",
  },
  "claude-fable-5-1": {
    cursorbench: "max",
    "terminal-bench-2-1": "max",
    "gpqa-diamond": "max",
    scicode: "max",
  },
  "claude-mythos-5": {
    cursorbench: "max",
    "terminal-bench-2-1": "xhigh",
    cybergym: "max",
  },
  "claude-opus-4-8": {
    cursorbench: "max",
    "terminal-bench-2-1": "high",
  },
  "claude-sonnet-5": {
    cursorbench: "max",
    "terminal-bench-2-1": "high",
    "lmarena-elo": "high",
  },
  "claude-opus-4-7": {
    "terminal-bench-2-1": "max",
  },
  "grok-4-5": {
    "terminal-bench-2-1": "high",
  },
  "deepseek-v4-flash-0731": {
    "terminal-bench-2-1": "max",
    nl2repo: "max",
    cybergym: "max",
    deepswe: "max",
    "toolathlon-verified": "max",
    "agents-last-exam": "max",
    "automation-bench": "max",
  },
  "qwen3-235b": {
    "gpqa-diamond": "thinking",
    "math-500": "thinking",
    "aime-2025": "thinking",
  },
  "qwen3-32b": {
    "gpqa-diamond": "thinking",
    "math-500": "thinking",
    "aime-2025": "thinking",
    livecodebench: "thinking",
  },
  "kimi-k3": {
    "gpqa-diamond": "max",
    cursorbench: "max",
  },
};

export const BENCHMARKS_BY_THINKING_LEVEL: Record<
  string,
  Partial<Record<string, Partial<Record<BenchmarkId, number>>>>
> = {
  "claude-opus-5": {
    max: { "lmarena-elo": 1489 },
  },
};
