/** Maps catalog organization names → `/public/org-icons/{slug}.svg`. */
export const ORG_ICON_SLUG: Record<string, string> = {
  OpenAI: "openai",
  Anthropic: "anthropic",
  Google: "google",
  xAI: "xai",
  Meta: "meta",
  DeepSeek: "deepseek",
  Alibaba: "alibaba",
  Mistral: "mistral",
  Moonshot: "moonshot",
  "Zhipu AI": "zhipu",
  Microsoft: "microsoft",
  MiniMax: "minimax",
  Meituan: "meituan",
  NVIDIA: "nvidia",
  Amazon: "amazon",
  Baidu: "baidu",
  ByteDance: "bytedance",
  Cohere: "cohere",
  "01.AI": "yi",
  Ai2: "ai2",
  Cursor: "cursor",
};

/** Mono SVGs that use currentColor — render via CSS mask so they track theme. */
export const MONO_ORG_ICONS = new Set([
  "openai",
  "anthropic",
  "xai",
  "cursor",
]);

export function orgIconSlug(organization: string): string | undefined {
  return ORG_ICON_SLUG[organization];
}
