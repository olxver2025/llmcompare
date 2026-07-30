/** Stable org → chart color mapping for scatter / legends. */
const ORG_COLORS: Record<string, string> = {
  OpenAI: "#10a37f",
  Anthropic: "#d97706",
  Google: "#4285f4",
  xAI: "#a3a3a3",
  Meta: "#0668e1",
  DeepSeek: "#4d6bfe",
  Alibaba: "#ff6a00",
  Mistral: "#ff7000",
  Moonshot: "#7c3aed",
  "Zhipu AI": "#0ea5e9",
  Microsoft: "#737373",
  MiniMax: "#ec4899",
  Meituan: "#fbbf24",
  NVIDIA: "#76b900",
  Amazon: "#ff9900",
  Cohere: "#39594d",
  Baidu: "#2932e1",
  ByteDance: "#fe2c55",
  "01.AI": "#6366f1",
  Ai2: "#0d9488",
  StepFun: "#f43f5e",
  Tencent: "#00a4ff",
  Cursor: "#f54e00",
};

const FALLBACK = [
  "#0f766e",
  "#c2410c",
  "#1d4ed8",
  "#a16207",
  "#7c3aed",
  "#be123c",
  "#0891b2",
  "#4d7c0f",
];

export function orgColor(organization: string): string {
  if (ORG_COLORS[organization]) return ORG_COLORS[organization];
  let hash = 0;
  for (let i = 0; i < organization.length; i++) {
    hash = (hash * 31 + organization.charCodeAt(i)) >>> 0;
  }
  return FALLBACK[hash % FALLBACK.length];
}
