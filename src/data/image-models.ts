import type { ImageBenchmarkId, ImageModel, MediaBenchmarkMeta } from "./types";

/**
 * Curated static dataset for image-generation models on LLMcompare.
 * Elo: Artificial Analysis Text-to-Image Arena (blind preference) as of ~2026-07-31.
 * Pricing / specs: official primary-provider docs or Arena API rate cards where
 * available; omitted when unverifiable or subscription-only. Re-audit scores and
 * prices before publishing.
 */

export const IMAGE_BENCHMARKS: MediaBenchmarkMeta[] = [
  {
    id: "image-arena-elo",
    name: "Image Arena Elo",
    shortName: "Image Arena",
    description:
      "Blind pairwise preference Elo for text-to-image models from the Artificial Analysis Image Arena; only compare scores from the same leaderboard snapshot.",
    higherIsBetter: true,
    unit: "elo",
    sourceUrl: "https://artificialanalysis.ai/image/leaderboard/text-to-image",
  },
];

export const IMAGE_BENCHMARK_IDS = IMAGE_BENCHMARKS.map(
  (b) => b.id
) as ImageBenchmarkId[];

export const imageModels: ImageModel[] = [
  // ─── OpenAI ───────────────────────────────────────────────
  {
    slug: "gpt-image-2",
    name: "GPT Image 2",
    organization: "OpenAI",
    releaseDate: "2026-04-21",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 3840, height: 2160 },
    },
    pricing: { provider: "OpenAI", perImage: 0.211 },
    benchmarks: { "image-arena-elo": 1339 },
    links: {
      docs: "https://developers.openai.com/api/docs/guides/image-generation",
      announcement: "https://openai.com/index/introducing-chatgpt-images-2-0/",
    },
    summary:
      "OpenAI's April 2026 flagship image model (ChatGPT Images 2.0 / gpt-image-2). Leads public text-to-image preference arenas; API supports flexible sizes up to ~4K with low/medium/high quality tiers.",
  },
  {
    slug: "gpt-image-1-5",
    name: "GPT Image 1.5",
    organization: "OpenAI",
    releaseDate: "2025-12-16",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 1536, height: 1024 },
    },
    pricing: { provider: "OpenAI", perImage: 0.133 },
    benchmarks: { "image-arena-elo": 1263 },
    links: {
      docs: "https://developers.openai.com/api/docs/models/gpt-image-1.5",
      announcement:
        "https://openai.com/index/new-chatgpt-images-is-here/",
    },
    summary:
      "Prior OpenAI image flagship with stronger instruction-following and editing than GPT Image 1; API sizes 1024×1024 / 1024×1536 / 1536×1024. High-quality 1024² is ~$0.133 per image.",
  },
  {
    slug: "gpt-image-1",
    name: "GPT Image 1",
    organization: "OpenAI",
    releaseDate: "2025-04-23",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 1536, height: 1024 },
    },
    pricing: { provider: "OpenAI", perImage: 0.167 },
    benchmarks: { "image-arena-elo": 1137 },
    links: {
      docs: "https://developers.openai.com/api/docs/models/gpt-image-1",
      announcement:
        "https://openai.com/index/introducing-4o-image-generation/",
    },
    summary:
      "OpenAI's first natively multimodal GPT Image API model (gpt-image-1), succeeding DALL·E 3 for generation and editing. High-quality 1024² is about $0.167 per image.",
  },
  {
    slug: "dall-e-3",
    name: "DALL·E 3",
    organization: "OpenAI",
    releaseDate: "2023-09-20",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 1792, height: 1024 },
    },
    pricing: { provider: "OpenAI", perImage: 0.04 },
    benchmarks: { "image-arena-elo": 950 },
    links: {
      docs: "https://platform.openai.com/docs/guides/images",
      announcement: "https://openai.com/index/dall-e-3/",
    },
    summary:
      "OpenAI's 2023 text-to-image model with strong prompt following for its era. Standard 1024² is $0.040/image; HD tiers are higher. Largely superseded by GPT Image models in the API.",
  },

  // ─── Google ───────────────────────────────────────────────
  {
    slug: "nano-banana-2",
    name: "Nano Banana 2",
    organization: "Google",
    releaseDate: "2026-02-26",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 4096, height: 4096 },
    },
    pricing: { provider: "Google", perImage: 0.067 },
    benchmarks: { "image-arena-elo": 1262 },
    links: {
      docs: "https://ai.google.dev/gemini-api/docs/image-generation",
      announcement:
        "https://blog.google/innovation-and-ai/technology/ai/nano-banana-2/",
    },
    summary:
      "Gemini 3.1 Flash Image (Nano Banana 2): Google's high-volume native image model with 0.5K–4K output, reference images, and web/image grounding. Default 1K API price is about $0.067 per image.",
  },
  {
    slug: "nano-banana-2-lite",
    name: "Nano Banana 2 Lite",
    organization: "Google",
    releaseDate: "2026-06-01",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 4096, height: 4096 },
    },
    pricing: { provider: "Google", perImage: 0.0336 },
    benchmarks: { "image-arena-elo": 1263 },
    links: {
      docs: "https://ai.google.dev/gemini-api/docs/image-generation",
      announcement:
        "https://blog.google/innovation-and-ai/technology/ai/nano-banana-2/",
    },
    summary:
      "Gemini 3.1 Flash Lite Image (Nano Banana 2 Lite): cost-efficient sibling of Nano Banana 2 with near-parity Arena Elo. Default API pricing is about $0.034 per image.",
  },
  {
    slug: "nano-banana-pro",
    name: "Nano Banana Pro",
    organization: "Google",
    releaseDate: "2025-11-20",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 4096, height: 4096 },
    },
    pricing: { provider: "Google", perImage: 0.134 },
    benchmarks: { "image-arena-elo": 1226 },
    links: {
      docs: "https://ai.google.dev/gemini-api/docs/image-generation",
      modelCard: "https://deepmind.google/models/gemini-image/pro/",
      announcement:
        "https://blog.google/innovation-and-ai/products/nano-banana-pro/",
    },
    summary:
      "Gemini 3 Pro Image (Nano Banana Pro): studio-oriented generation and editing with strong text rendering and world knowledge. 1K/2K API output is about $0.134 per image; 4K is higher.",
  },
  {
    slug: "imagen-4-ultra",
    name: "Imagen 4 Ultra",
    organization: "Google",
    releaseDate: "2025-06-24",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 2048, height: 2048 },
    },
    pricing: { provider: "Google", perImage: 0.06 },
    benchmarks: { "image-arena-elo": 1172 },
    links: {
      docs: "https://ai.google.dev/gemini-api/docs/imagen",
      announcement:
        "https://developers.googleblog.com/en/imagen-4-now-available-in-the-gemini-api-and-google-ai-studio/",
    },
    summary:
      "Google's highest-fidelity Imagen 4 tier for prompt-precise text-to-image in the Gemini API. $0.06 per image; SynthID-watermarked. Scheduled for deprecation in favor of Nano Banana models.",
  },
  {
    slug: "imagen-4",
    name: "Imagen 4",
    organization: "Google",
    releaseDate: "2025-06-24",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 2048, height: 2048 },
    },
    pricing: { provider: "Google", perImage: 0.04 },
    benchmarks: { "image-arena-elo": 1102 },
    links: {
      docs: "https://ai.google.dev/gemini-api/docs/imagen",
      announcement:
        "https://developers.googleblog.com/en/imagen-4-now-available-in-the-gemini-api-and-google-ai-studio/",
    },
    summary:
      "Imagen 4 Standard in the Gemini API: improved text rendering over Imagen 3 at $0.04 per image. Fast tier is cheaper; Ultra is higher quality. Deprecated path relative to Gemini native image models.",
  },

  // ─── Microsoft ────────────────────────────────────────────
  {
    slug: "mai-image-2-5",
    name: "MAI-Image-2.5",
    organization: "Microsoft",
    releaseDate: "2026-06-02",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 1024, height: 1024 },
    },
    pricing: { provider: "Microsoft", perImage: 0.0481 },
    benchmarks: { "image-arena-elo": 1270 },
    links: {
      docs: "https://ai.azure.com/catalog/models/MAI-Image-2.5",
      modelCard: "https://microsoft.ai/models/mai-image-2-5/",
      announcement:
        "https://microsoft.ai/news/introducing-mai-image-2-5-pro-and-mai-voice-2-flash/",
    },
    summary:
      "Microsoft's in-house 20B diffusion image model for text-to-image and precise editing, used in Bing Image Creator and Foundry. Arena Elo ~1270; API pricing about $0.048 per default image.",
  },

  // ─── Reve ─────────────────────────────────────────────────
  {
    slug: "reve-2-1",
    name: "Reve 2.1",
    organization: "Reve",
    releaseDate: "2026-07-09",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 4096, height: 4096 },
    },
    pricing: { provider: "Reve", perImage: 0.024 },
    benchmarks: { "image-arena-elo": 1299 },
    links: {
      docs: "https://www.reve.com/",
      announcement: "https://www.reve.com/",
    },
    summary:
      "Reve's July 2026 layout-first 4K image model (native 4096²). Plans structured editable layouts before rendering; ranks near the top of public text-to-image arenas at roughly $0.024 per image.",
  },

  // ─── Black Forest Labs ────────────────────────────────────
  {
    slug: "flux-2-max",
    name: "FLUX.2 [max]",
    organization: "Black Forest Labs",
    releaseDate: "2025-12-01",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 2048, height: 2048 },
    },
    pricing: { provider: "Black Forest Labs", perImage: 0.07 },
    benchmarks: { "image-arena-elo": 1196 },
    links: {
      docs: "https://docs.bfl.ai/flux_2/flux2_overview",
      announcement: "https://bfl.ai/blog/flux-2",
    },
    summary:
      "Black Forest Labs' highest-quality FLUX.2 API tier with grounding search and multi-reference editing. Outputs up to 4 megapixels; text-to-image starts at $0.07 per megapixel (~$0.07 at 1024²).",
  },
  {
    slug: "flux-2-pro",
    name: "FLUX.2 [pro]",
    organization: "Black Forest Labs",
    releaseDate: "2025-11-25",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 2048, height: 2048 },
    },
    pricing: { provider: "Black Forest Labs", perImage: 0.03 },
    benchmarks: { "image-arena-elo": 1187 },
    links: {
      docs: "https://docs.bfl.ai/flux_2/flux2_overview",
      announcement: "https://bfl.ai/blog/flux-2",
    },
    summary:
      "Production FLUX.2 API tier with multi-reference editing and up to ~4MP output. Default text-to-image is about $0.03 per megapixel; balances quality and cost below Max.",
  },
  {
    slug: "flux-2-dev",
    name: "FLUX.2 [dev]",
    organization: "Black Forest Labs",
    releaseDate: "2025-11-25",
    openSource: true,
    license: "FLUX.2 Non-Commercial",
    specs: {
      maxResolution: { width: 2048, height: 2048 },
    },
    benchmarks: { "image-arena-elo": 1154 },
    links: {
      docs: "https://docs.bfl.ai/flux_2/flux2_overview",
      modelCard: "https://huggingface.co/black-forest-labs/FLUX.2-dev",
      announcement: "https://bfl.ai/blog/flux-2",
    },
    summary:
      "32B open-weights FLUX.2 model for local text-to-image and multi-reference editing under BFL's non-commercial license. No first-party hosted API; third-party hosts vary in price.",
  },
  {
    slug: "flux-2-klein-4b",
    name: "FLUX.2 [klein] 4B",
    organization: "Black Forest Labs",
    releaseDate: "2026-01-15",
    openSource: true,
    license: "Apache 2.0",
    specs: {
      maxResolution: { width: 2048, height: 2048 },
    },
    pricing: { provider: "Black Forest Labs", perImage: 0.014 },
    benchmarks: { "image-arena-elo": 1058 },
    links: {
      docs: "https://docs.bfl.ai/flux_2/flux2_overview",
      modelCard: "https://huggingface.co/black-forest-labs/FLUX.2-klein-4B",
      announcement:
        "https://bfl.ai/blog/flux2-klein-towards-interactive-visual-intelligence",
    },
    summary:
      "Apache 2.0 open FLUX.2 Klein 4B for sub-second, high-volume generation on consumer GPUs. BFL API pricing starts at $0.014 for the first megapixel.",
  },
  {
    slug: "flux-1-1-pro",
    name: "FLUX.1.1 [pro]",
    organization: "Black Forest Labs",
    releaseDate: "2024-10-02",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 1920, height: 1920 },
    },
    pricing: { provider: "Black Forest Labs", perImage: 0.04 },
    benchmarks: { "image-arena-elo": 1088 },
    links: {
      docs: "https://docs.bfl.ai/",
      announcement: "https://bfl.ai/blog/24-10-02-flux",
    },
    summary:
      "Prior-generation BFL production model with faster renders and tighter prompt adherence than FLUX.1 [pro]. Still widely used in production pipelines; about $0.04 per image.",
  },
  {
    slug: "flux-1-dev",
    name: "FLUX.1 [dev]",
    organization: "Black Forest Labs",
    releaseDate: "2024-08-01",
    openSource: true,
    license: "FLUX.1 Non-Commercial",
    specs: {
      maxResolution: { width: 1920, height: 1920 },
    },
    benchmarks: { "image-arena-elo": 1028 },
    links: {
      docs: "https://docs.bfl.ai/",
      modelCard: "https://huggingface.co/black-forest-labs/FLUX.1-dev",
      announcement: "https://bfl.ai/announcements/announcing-black-forest-labs",
    },
    summary:
      "12B open-weights FLUX.1 development model that set the 2024 open image baseline. Non-commercial license; widely fine-tuned and hosted by third parties.",
  },

  // ─── Ideogram ─────────────────────────────────────────────
  {
    slug: "ideogram-4-0",
    name: "Ideogram 4.0",
    organization: "Ideogram",
    releaseDate: "2026-06-03",
    openSource: true,
    license: "Ideogram 4 Non-Commercial",
    specs: {
      maxResolution: { width: 2048, height: 2048 },
    },
    pricing: { provider: "Ideogram", perImage: 0.1 },
    benchmarks: { "image-arena-elo": 1174 },
    links: {
      docs: "https://developer.ideogram.ai/",
      modelCard: "https://github.com/ideogram-oss/ideogram4",
      announcement: "https://ideogram.ai/news/ideogram-4.0/",
    },
    summary:
      "Ideogram's 9.3B open-weight foundation model with native 2K output, strong typography, and JSON layout control. Hosted Quality tier is $0.10/image; Default $0.06 and Turbo $0.03 also listed.",
  },
  {
    slug: "ideogram-3-0",
    name: "Ideogram 3.0",
    organization: "Ideogram",
    releaseDate: "2025-03-26",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 1312, height: 1312 },
    },
    pricing: { provider: "Ideogram", perImage: 0.06 },
    benchmarks: { "image-arena-elo": 1079 },
    links: {
      docs: "https://developer.ideogram.ai/",
      announcement: "https://ideogram.ai/models/3.0/",
    },
    summary:
      "Ideogram's March 2025 generation known for in-image typography and design layouts. Hosted Default tier about $0.06/image; superseded by open Ideogram 4.0 for self-hosting.",
  },

  // ─── Recraft ──────────────────────────────────────────────
  {
    slug: "recraft-v4-1",
    name: "Recraft V4.1",
    organization: "Recraft",
    releaseDate: "2026-05-14",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 2048, height: 1024 },
      secondsPerImage: 6.5,
    },
    pricing: { provider: "Recraft", perImage: 0.035 },
    benchmarks: { "image-arena-elo": 1153 },
    links: {
      docs: "https://www.recraft.ai/docs/recraft-models/recraft-v4-1",
      announcement:
        "https://recraft.canny.io/changelog/meet-recraft-v41-beautiful-by-nature",
    },
    summary:
      "Recraft's May 2026 expressive image model focused on natural photorealism, illustration, and vector-friendly output. Official median latency ~6.5s; API pricing about $0.035 per image.",
  },
  {
    slug: "recraft-v3",
    name: "Recraft V3",
    organization: "Recraft",
    releaseDate: "2024-10-30",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 2048, height: 1024 },
    },
    pricing: { provider: "Recraft", perImage: 0.04 },
    benchmarks: { "image-arena-elo": 1068 },
    links: {
      docs: "https://www.recraft.ai/docs",
      announcement: "https://www.recraft.ai/recraft-v3",
    },
    summary:
      "Recraft's 2024 design-oriented model with strong brand/style control and native SVG/vector workflows. API pricing about $0.04 per image; still used alongside V4.x for design pipelines.",
  },

  // ─── Midjourney ───────────────────────────────────────────
  {
    slug: "midjourney-v7",
    name: "Midjourney v7",
    organization: "Midjourney",
    releaseDate: "2025-04-03",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 2048, height: 2048 },
    },
    benchmarks: { "image-arena-elo": 1071 },
    links: {
      docs: "https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version",
      announcement: "https://updates.midjourney.com/v7-alpha/",
    },
    summary:
      "Midjourney's April 2025 generation with stronger prompt coherence and textures than v6.x. Sold as a subscription product with no public per-image API rate card.",
  },
  {
    slug: "midjourney-v6-1",
    name: "Midjourney v6.1",
    organization: "Midjourney",
    releaseDate: "2024-07-30",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 2048, height: 2048 },
    },
    benchmarks: { "image-arena-elo": 1054 },
    links: {
      docs: "https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version",
      announcement: "https://updates.midjourney.com/version-6-1/",
    },
    summary:
      "July 2024 Midjourney refresh over v6 with sharper details and better coherence. Subscription-only; no public per-image API pricing.",
  },

  // ─── Stability AI ─────────────────────────────────────────
  {
    slug: "stable-diffusion-3-5-large",
    name: "Stable Diffusion 3.5 Large",
    organization: "Stability AI",
    releaseDate: "2024-10-22",
    openSource: true,
    license: "Stability AI Community License",
    specs: {
      maxResolution: { width: 1024, height: 1024 },
    },
    pricing: { provider: "Stability AI", perImage: 0.065 },
    benchmarks: { "image-arena-elo": 1022 },
    links: {
      docs: "https://huggingface.co/stabilityai/stable-diffusion-3.5-large",
      modelCard: "https://huggingface.co/stabilityai/stable-diffusion-3.5-large",
      announcement:
        "https://stability.ai/news/introducing-stable-diffusion-3-5",
    },
    summary:
      "8.1B open MMDiT from Stability AI for self-hosted ~1MP generation under the Community License. Hosted API is about $0.065/image; remains a common open baseline despite lower Arena Elo than frontier closed models.",
  },
  {
    slug: "stable-diffusion-3-5-medium",
    name: "Stable Diffusion 3.5 Medium",
    organization: "Stability AI",
    releaseDate: "2024-10-29",
    openSource: true,
    license: "Stability AI Community License",
    specs: {
      maxResolution: { width: 1440, height: 1440 },
    },
    pricing: { provider: "Stability AI", perImage: 0.035 },
    benchmarks: { "image-arena-elo": 947 },
    links: {
      docs: "https://huggingface.co/stabilityai/stable-diffusion-3.5-medium",
      modelCard:
        "https://huggingface.co/stabilityai/stable-diffusion-3.5-medium",
      announcement:
        "https://stability.ai/news/introducing-stable-diffusion-3-5",
    },
    summary:
      "2.5B open SD 3.5 variant for consumer GPUs and 0.25–2MP outputs. Hosted API about $0.035/image; lighter alternative to SD 3.5 Large for fine-tuning and local workflows.",
  },

  // ─── Adobe ────────────────────────────────────────────────
  {
    slug: "firefly-image-4",
    name: "Firefly Image Model 4",
    organization: "Adobe",
    releaseDate: "2025-04-24",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 2048, height: 2048 },
    },
    benchmarks: {},
    links: {
      docs: "https://helpx.adobe.com/firefly/using/text-to-image.html",
      announcement:
        "https://news.adobe.com/news/2025/04/adobe-revolutionizes-ai-assisted-creativity-firefly",
    },
    summary:
      "Adobe's commercially safe Firefly Image Model 4 for Creative Cloud / Firefly app workflows, with up to 2K output and strong Creative Suite integration. Sold via Firefly/CC subscriptions; no public Arena Elo or per-image API rate card.",
  },
  {
    slug: "firefly-image-4-ultra",
    name: "Firefly Image Model 4 Ultra",
    organization: "Adobe",
    releaseDate: "2025-04-24",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 2048, height: 2048 },
    },
    benchmarks: {},
    links: {
      docs: "https://helpx.adobe.com/firefly/using/text-to-image.html",
      announcement:
        "https://blog.adobe.com/en/publish/2025/04/24/adobe-firefly-next-evolution-creative-ai-is-here",
    },
    summary:
      "Higher-detail Firefly Image Model 4 Ultra for complex scenes and fine structure. Commercially safe training data; subscription-metered in Firefly rather than a public per-image API.",
  },

  // ─── Amazon ───────────────────────────────────────────────
  {
    slug: "amazon-nova-canvas",
    name: "Amazon Nova Canvas",
    organization: "Amazon",
    releaseDate: "2024-12-03",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 2048, height: 2048 },
    },
    pricing: { provider: "Amazon", perImage: 0.04 },
    benchmarks: {},
    links: {
      docs: "https://docs.aws.amazon.com/nova/latest/userguide/image-generation.html",
      modelCard:
        "https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-amazon-nova-canvas.html",
      announcement:
        "https://aws.amazon.com/about-aws/whats-new/2024/12/amazon-nova-foundation-models-bedrock/",
    },
    summary:
      "Amazon's Bedrock image model for studio-quality generation and editing (inpainting, outpainting, background removal) with watermarking. Standard 1024² is about $0.04 per image; not listed on Image Arena Elo.",
  },
  {
    slug: "amazon-titan-image-g1-v2",
    name: "Amazon Titan Image Generator G1 v2",
    organization: "Amazon",
    releaseDate: "2024-08-06",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 1408, height: 1408 },
    },
    pricing: { provider: "Amazon", perImage: 0.01 },
    benchmarks: { "image-arena-elo": 912 },
    links: {
      docs: "https://docs.aws.amazon.com/bedrock/latest/userguide/titan-image-models.html",
      announcement:
        "https://aws.amazon.com/blogs/aws/amazon-titan-image-generator-v2-is-now-available-in-amazon-bedrock/",
    },
    summary:
      "Earlier Amazon Bedrock image generator with conditioning, color palette, and editing tools. Low-cost standard generation (~$0.01/image) with modest Arena Elo versus frontier models.",
  },

  // ─── xAI ──────────────────────────────────────────────────
  {
    slug: "grok-imagine-image",
    name: "Grok Imagine Image",
    organization: "xAI",
    releaseDate: "2026-04-01",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 2048, height: 2048 },
    },
    pricing: { provider: "xAI", perImage: 0.05 },
    benchmarks: { "image-arena-elo": 1204 },
    links: {
      docs: "https://docs.x.ai/developers/model-capabilities/imagine",
      announcement: "https://x.ai/news",
    },
    summary:
      "xAI's Grok Imagine image model (quality tier on Arenas) for text-to-image and multi-reference editing via the Imagine API. Quality mode is about $0.05 per image.",
  },

  // ─── ByteDance ────────────────────────────────────────────
  {
    slug: "seedream-5-0-pro",
    name: "Seedream 5.0 Pro",
    organization: "ByteDance",
    releaseDate: "2026-07-01",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 3072, height: 3072 },
    },
    pricing: { provider: "ByteDance", perImage: 0.09 },
    benchmarks: { "image-arena-elo": 1240 },
    links: {
      docs: "https://seed.bytedance.com/en",
      announcement: "https://seed.bytedance.com/en",
    },
    summary:
      "ByteDance Seed's July 2026 flagship Seedream tier on Arenas (~1240 Elo). Hosted via Doubao / Volcano Engine; API pricing about $0.09 per image.",
  },
  {
    slug: "seedream-4-0",
    name: "Seedream 4.0",
    organization: "ByteDance",
    releaseDate: "2025-09-01",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 4096, height: 4096 },
    },
    pricing: { provider: "ByteDance", perImage: 0.03 },
    benchmarks: { "image-arena-elo": 1192 },
    links: {
      docs: "https://seed.bytedance.com/en/seedream4_0",
      announcement: "https://seed.bytedance.com/en/seedream4_0",
      modelCard: "https://arxiv.org/abs/2509.20427",
    },
    summary:
      "ByteDance Seedream 4.0 unifies generation and editing with native up-to-4K output. Strong Arena standing (~1192 Elo) at roughly $0.03 per image on first-party APIs.",
  },

  // ─── Alibaba ──────────────────────────────────────────────
  {
    slug: "qwen-image-2-0-pro",
    name: "Qwen Image 2.0 Pro",
    organization: "Alibaba",
    releaseDate: "2026-04-22",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 2048, height: 2048 },
    },
    pricing: { provider: "Alibaba", perImage: 0.075 },
    benchmarks: { "image-arena-elo": 1174 },
    links: {
      docs: "https://www.alibabacloud.com/help/en/model-studio/",
      announcement:
        "https://qwenlm.github.io/blog/qwen-image/",
    },
    summary:
      "Alibaba's hosted Qwen Image 2.0 Pro tier (2026-04-22 snapshot on Arenas) with strong bilingual text-in-image. About $0.075 per image via DashScope / Model Studio.",
  },
  {
    slug: "qwen-image",
    name: "Qwen-Image",
    organization: "Alibaba",
    releaseDate: "2025-08-04",
    openSource: true,
    license: "Apache 2.0",
    specs: {
      maxResolution: { width: 2048, height: 2048 },
    },
    pricing: { provider: "Alibaba", perImage: 0.02 },
    benchmarks: { "image-arena-elo": 1062 },
    links: {
      docs: "https://github.com/QwenLM/Qwen-Image",
      modelCard: "https://huggingface.co/Qwen/Qwen-Image",
      announcement: "https://qwenlm.github.io/blog/qwen-image/",
    },
    summary:
      "Alibaba Qwen team's open text-to-image foundation model (Apache 2.0) noted for complex Chinese/English text rendering. Hosted Max/Plus tiers also exist; open weights for self-hosting.",
  },

  // ─── Tencent ──────────────────────────────────────────────
  {
    slug: "hunyuan-image-3-0",
    name: "HunyuanImage 3.0",
    organization: "Tencent",
    releaseDate: "2025-09-28",
    openSource: true,
    license: "Tencent Hunyuan Community License",
    specs: {
      maxResolution: { width: 2048, height: 2048 },
    },
    benchmarks: { "image-arena-elo": 1125 },
    links: {
      docs: "https://github.com/Tencent-Hunyuan/HunyuanImage-3.0",
      modelCard: "https://huggingface.co/tencent/HunyuanImage-3.0",
      announcement:
        "https://huggingface.co/tencent/HunyuanImage-3.0",
    },
    summary:
      "Tencent Hunyuan's open MoE Transfusion image model (~80B total / 13B active) for unified understanding and generation. Community license; strong open-weights Arena presence.",
  },

  // ─── HiDream ──────────────────────────────────────────────
  {
    slug: "hidream-o1-image-1-5",
    name: "HiDream-O1-Image-1.5",
    organization: "HiDream",
    releaseDate: "2026-06-01",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 2048, height: 2048 },
    },
    pricing: { provider: "HiDream", perImage: 0.08 },
    benchmarks: { "image-arena-elo": 1245 },
    links: {
      docs: "https://github.com/HiDream-ai/HiDream-O1-Image",
      modelCard: "https://huggingface.co/HiDream-ai/HiDream-O1-Image",
      announcement: "https://github.com/HiDream-ai/HiDream-O1-Image",
    },
    summary:
      "HiDream's hosted O1 Image 1.5 unified generation/editing model (Pixel-level Unified Transformer). Strong Arena Elo (~1245) at about $0.08 per image; open Dev weights also published.",
  },

  // ─── NVIDIA ───────────────────────────────────────────────
  {
    slug: "cosmos3-super-text2image",
    name: "Cosmos3-Super-Text2Image",
    organization: "NVIDIA",
    releaseDate: "2026-05-31",
    openSource: true,
    license: "OpenMDW 1.1",
    specs: {
      maxResolution: { width: 2048, height: 2048 },
    },
    benchmarks: { "image-arena-elo": 1219 },
    links: {
      docs: "https://research.nvidia.com/labs/cosmos-lab/cosmos3/",
      modelCard: "https://huggingface.co/nvidia/Cosmos3-Super-Text2Image",
      announcement: "https://huggingface.co/collections/nvidia/cosmos3",
    },
    summary:
      "64B open-weights NVIDIA Cosmos3 specialization for high-fidelity text-to-image (agentic prompt upsampling optional). Leads open-weights Image Arena Elo; self-host via Diffusers / vLLM-Omni.",
  },
];
