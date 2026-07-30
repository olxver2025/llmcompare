import type { Model } from "@/data/types";

export type ModelFamily = {
  id: string;
  label: string;
};

/** Product-line families for catalog / chart filters. */
export const MODEL_FAMILIES: ModelFamily[] = [
  { id: "gpt-5", label: "GPT-5.x" },
  { id: "gpt-4-o", label: "GPT-4 / o-series" },
  { id: "gpt-oss", label: "gpt-oss" },
  { id: "claude-opus", label: "Claude Opus" },
  { id: "claude-sonnet", label: "Claude Sonnet / Haiku" },
  { id: "claude-mythos", label: "Claude Fable / Mythos" },
  { id: "gemini", label: "Gemini" },
  { id: "gemma", label: "Gemma" },
  { id: "grok", label: "Grok" },
  { id: "composer", label: "Composer" },
  { id: "llama", label: "Llama / Muse" },
  { id: "deepseek", label: "DeepSeek" },
  { id: "qwen", label: "Qwen" },
  { id: "mistral", label: "Mistral" },
  { id: "kimi", label: "Kimi" },
  { id: "glm", label: "GLM" },
  { id: "phi", label: "Phi" },
  { id: "command", label: "Command" },
  { id: "sonar", label: "Sonar" },
  { id: "jamba", label: "Jamba" },
  { id: "granite", label: "Granite" },
  { id: "amazon", label: "Amazon" },
  { id: "nemotron", label: "Nemotron" },
  { id: "yi", label: "Yi" },
  { id: "solar", label: "Solar" },
  { id: "falcon", label: "Falcon" },
  { id: "other", label: "Other" },
];

export function modelFamilyId(m: Model): string {
  const s = m.slug;
  const n = m.name.toLowerCase();

  if (s.startsWith("composer")) return "composer";
  if (s.startsWith("cursor-grok") || s.startsWith("grok-")) return "grok";
  if (s.startsWith("gpt-oss")) return "gpt-oss";
  if (
    s.startsWith("gpt-5") ||
    s.startsWith("gpt-4") ||
    s.startsWith("o1") ||
    s.startsWith("o3") ||
    s.startsWith("o4")
  ) {
    if (s.startsWith("gpt-5")) return "gpt-5";
    return "gpt-4-o";
  }
  if (s.includes("fable") || s.includes("mythos")) return "claude-mythos";
  if (s.includes("opus")) return "claude-opus";
  if (s.includes("sonnet") || s.includes("haiku")) return "claude-sonnet";
  if (s.startsWith("gemini")) return "gemini";
  if (s.startsWith("gemma")) return "gemma";
  if (
    s.startsWith("llama") ||
    s.startsWith("muse") ||
    s.startsWith("codellama")
  )
    return "llama";
  if (s.startsWith("deepseek")) return "deepseek";
  if (s.startsWith("qwen")) return "qwen";
  if (
    s.startsWith("mistral") ||
    s.startsWith("codestral") ||
    s.startsWith("ministral") ||
    s.startsWith("magistral") ||
    s.startsWith("devstral") ||
    s.startsWith("pixtral") ||
    s.startsWith("voxtral") ||
    s.startsWith("mixtral")
  )
    return "mistral";
  if (s.startsWith("kimi")) return "kimi";
  if (s.startsWith("glm")) return "glm";
  if (s.startsWith("phi")) return "phi";
  if (s.startsWith("command")) return "command";
  if (s.startsWith("sonar")) return "sonar";
  if (s.startsWith("jamba")) return "jamba";
  if (s.startsWith("granite")) return "granite";
  if (s.startsWith("amazon-")) return "amazon";
  if (s.startsWith("nemotron")) return "nemotron";
  if (s.startsWith("yi")) return "yi";
  if (s.startsWith("solar")) return "solar";
  if (s.startsWith("falcon")) return "falcon";
  if (n.includes("claude")) return "claude-opus";
  return "other";
}

export function modelFamilyLabel(m: Model): string {
  const id = modelFamilyId(m);
  return MODEL_FAMILIES.find((f) => f.id === id)?.label ?? "Other";
}
