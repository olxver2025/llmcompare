import type { MediaBenchmarkMeta, VideoBenchmarkId, VideoModel } from "./types";

/**
 * Curated static dataset for LLMcompare video models.
 * Specs & pricing: official provider docs / rate cards as of ~2026-08-01.
 * Benchmarks: Artificial Analysis Text-to-Video Arena (with audio) Elo as of ~2026-07-31;
 * omitted when the model is not listed or the score is unverifiable.
 * Re-audit periodically — video APIs and Arena rankings change quickly.
 */

export const VIDEO_BENCHMARKS: MediaBenchmarkMeta[] = [
  {
    id: "video-arena-elo",
    name: "Artificial Analysis Video Arena Elo",
    shortName: "Video Arena",
    description:
      "Blind pairwise preference Elo for text-to-video models from the Artificial Analysis Video Arena (with-audio leaderboard). Scores are only comparable within the same Arena protocol and voter pool.",
    higherIsBetter: true,
    unit: "elo",
    sourceUrl: "https://artificialanalysis.ai/video/leaderboard/text-to-video",
  },
];

export const VIDEO_BENCHMARK_IDS = VIDEO_BENCHMARKS.map(
  (b) => b.id
) as VideoBenchmarkId[];

export const videoModels: VideoModel[] = [
  // ─── Google ───────────────────────────────────────────────
  {
    slug: "gemini-omni-flash",
    name: "Gemini Omni Flash",
    organization: "Google",
    releaseDate: "2026-05-20",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 1280, height: 720 },
      maxDurationSeconds: 10,
    },
    pricing: { provider: "Google", perSecond: 0.1 },
    benchmarks: { "video-arena-elo": 1245 },
    links: {
      docs: "https://ai.google.dev/gemini-api/docs/models/gemini-omni-flash",
      modelCard: "https://ai.google.dev/gemini-api/docs/models/gemini-omni-flash",
      announcement:
        "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-omni/",
    },
    summary:
      "Google's conversational video generation/editing model (gemini-omni-flash-preview) with text/image/video inputs and 3–10s 720p output. Leads the Artificial Analysis with-audio Arena (~Elo 1245). API video output is ~$0.10/sec (~5,792 tokens/sec at $17.50/1M).",
  },
  {
    slug: "veo-3-1",
    name: "Veo 3.1",
    organization: "Google",
    releaseDate: "2025-11-17",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 3840, height: 2160 },
      maxDurationSeconds: 8,
    },
    pricing: { provider: "Google", perSecond: 0.4 },
    benchmarks: { "video-arena-elo": 1098 },
    links: {
      docs: "https://ai.google.dev/gemini-api/docs/video",
      modelCard:
        "https://ai.google.dev/gemini-api/docs/models/veo-3.1-generate-preview",
      announcement:
        "https://developers.googleblog.com/en/veo-3-and-veo-3-fast-new-pricing-new-configurations-and-better-resolution/",
    },
    summary:
      "Google's flagship Gemini API video model with native audio, 720p/1080p/4K output, and 4–8s clips. Standard with-audio API rate is $0.40/sec at 720p/1080p ($0.60/sec at 4K); Fast and Lite tiers are cheaper.",
  },
  {
    slug: "veo-3-1-fast",
    name: "Veo 3.1 Fast",
    organization: "Google",
    releaseDate: "2026-01-15",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 3840, height: 2160 },
      maxDurationSeconds: 8,
    },
    pricing: { provider: "Google", perSecond: 0.1 },
    benchmarks: { "video-arena-elo": 1091 },
    links: {
      docs: "https://ai.google.dev/gemini-api/docs/video",
      modelCard:
        "https://ai.google.dev/gemini-api/docs/models/veo-3.1-fast-generate-preview",
      announcement:
        "https://developers.googleblog.com/en/veo-3-and-veo-3-fast-new-pricing-new-configurations-and-better-resolution/",
    },
    summary:
      "Faster/cheaper Veo 3.1 tier with native audio and up to 4K. Gemini API with-audio rates are $0.10/sec (720p), $0.12/sec (1080p), and $0.30/sec (4K) for 4/6/8s clips.",
  },
  {
    slug: "veo-3-1-lite",
    name: "Veo 3.1 Lite",
    organization: "Google",
    releaseDate: "2026-03-01",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 1920, height: 1080 },
      maxDurationSeconds: 8,
    },
    pricing: { provider: "Google", perSecond: 0.05 },
    benchmarks: { "video-arena-elo": 1090 },
    links: {
      docs: "https://ai.google.dev/gemini-api/docs/video",
      announcement:
        "https://developers.googleblog.com/en/veo-3-and-veo-3-fast-new-pricing-new-configurations-and-better-resolution/",
    },
    summary:
      "Lowest-cost Veo 3.1 API tier for high-volume 720p/1080p generation with audio (no 4K). Gemini API lists $0.05/sec at 720p and $0.08/sec at 1080p for 4/6/8s clips.",
  },

  // ─── OpenAI ───────────────────────────────────────────────
  {
    slug: "sora-2-pro",
    name: "Sora 2 Pro",
    organization: "OpenAI",
    releaseDate: "2025-10-06",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 1920, height: 1080 },
      maxDurationSeconds: 20,
    },
    pricing: { provider: "OpenAI", perSecond: 0.3 },
    benchmarks: {},
    links: {
      docs: "https://developers.openai.com/api/docs/guides/video-generation",
      announcement: "https://openai.com/index/sora-2/",
    },
    summary:
      "OpenAI's higher-fidelity Videos API model with up to 20s clips and 1080p exports (720p Pro listed at $0.30/sec; 1080p at $0.70/sec). Videos API and Sora 2 aliases are scheduled for removal on 2026-09-24.",
  },
  {
    slug: "sora-2",
    name: "Sora 2",
    organization: "OpenAI",
    releaseDate: "2025-10-06",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 1280, height: 720 },
      maxDurationSeconds: 12,
    },
    pricing: { provider: "OpenAI", perSecond: 0.1 },
    benchmarks: {},
    links: {
      docs: "https://developers.openai.com/api/docs/models/sora-2",
      announcement: "https://openai.com/index/sora-2/",
    },
    summary:
      "OpenAI's standard Videos API Sora 2 SKU with synced audio at 720p (portrait 720×1280 / landscape 1280×720) for $0.10/sec. Scheduled for API removal with the Videos API on 2026-09-24.",
  },

  // ─── MiniMax ──────────────────────────────────────────────
  {
    slug: "minimax-h3",
    name: "MiniMax H3",
    organization: "MiniMax",
    releaseDate: "2026-07-31",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 2560, height: 1440 },
      maxDurationSeconds: 15,
    },
    pricing: { provider: "MiniMax", perSecond: 0.13 },
    benchmarks: { "video-arena-elo": 1242 },
    links: {
      docs: "https://platform.minimax.io/docs/guides/pricing-paygo",
      announcement: "https://www.minimax.io/news/minimax-h3-open-model-breaking-boundaries-tasks-modalities-news-overseas-1785485393",
    },
    summary:
      "MiniMax's omni-modal H3 video model with native stereo audio, 5–15s clips, and default 2K output. Official pay-as-you-go is $0.13/sec at 2K ($0.09/sec 768p in closed beta). Near the top of the AA with-audio Arena; weight release was promised at launch but not treated as open here until shipped.",
  },
  {
    slug: "hailuo-02",
    name: "Hailuo 02",
    organization: "MiniMax",
    releaseDate: "2025-06-18",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 1920, height: 1080 },
      maxDurationSeconds: 10,
    },
    pricing: { provider: "MiniMax", perSecond: 0.047 },
    benchmarks: {},
    links: {
      docs: "https://platform.minimax.io/docs/guides/pricing-video",
      announcement: "https://www.minimax.io/news/minimax-hailuo-02",
    },
    summary:
      "MiniMax Hailuo 02 text/image-to-video model with strong physics/instruction following. Official pay-as-you-go lists $0.28 for 768p/6s (~$0.047/sec), $0.56 for 768p/10s, and $0.49 for 1080p/6s; no native audio on this generation.",
  },

  // ─── Kling AI ─────────────────────────────────────────────
  {
    slug: "kling-3-0-pro",
    name: "Kling 3.0 Pro",
    organization: "Kling AI",
    releaseDate: "2026-02-04",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 1920, height: 1080 },
      maxDurationSeconds: 15,
    },
    pricing: { provider: "Kling AI", perSecond: 0.336 },
    benchmarks: { "video-arena-elo": 1113 },
    links: {
      docs: "https://kling.ai/quickstart/klingai-video-3-model-user-guide",
      announcement:
        "https://ir.kuaishou.com/news-releases/news-release-details/kling-ai-launches-30-model-ushering-era-where-everyone-can-be",
    },
    summary:
      "Kuaishou's Kling Video 3.0 Pro tier with native audio, multi-shot storyboards, and flexible 3–15s duration at up to 1080p. Consumer product bills in credits; Artificial Analysis lists ~$20.16/min (~$0.336/sec) for default 1080p API settings.",
  },
  {
    slug: "kling-3-0-standard",
    name: "Kling 3.0 Standard",
    organization: "Kling AI",
    releaseDate: "2026-02-04",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 1280, height: 720 },
      maxDurationSeconds: 15,
    },
    pricing: { provider: "Kling AI", perSecond: 0.252 },
    benchmarks: { "video-arena-elo": 1101 },
    links: {
      docs: "https://kling.ai/quickstart/klingai-video-3-model-user-guide",
      announcement:
        "https://ir.kuaishou.com/news-releases/news-release-details/kling-ai-launches-30-model-ushering-era-where-everyone-can-be",
    },
    summary:
      "Kling Video 3.0 Standard (720p) tier with native audio and 3–15s clips. Artificial Analysis lists ~$15.12/min (~$0.252/sec) for default API settings on the with-audio Arena entry.",
  },
  {
    slug: "kling-2-6-pro",
    name: "Kling 2.6 Pro",
    organization: "Kling AI",
    releaseDate: "2026-01-15",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 1920, height: 1080 },
      maxDurationSeconds: 10,
    },
    pricing: { provider: "Kling AI", perSecond: 0.14 },
    benchmarks: { "video-arena-elo": 989 },
    links: {
      docs: "https://kling.ai/quickstart/klingai-video-3-model-user-guide",
      announcement: "https://kling.ai",
    },
    summary:
      "Prior Kling Pro generation still listed on the AA with-audio Arena (January 2026 snapshot entry). Artificial Analysis quotes ~$8.40/min (~$0.14/sec) for default API settings.",
  },

  // ─── ByteDance ────────────────────────────────────────────
  {
    slug: "dreamina-seedance-2-0",
    name: "Dreamina Seedance 2.0",
    organization: "ByteDance",
    releaseDate: "2026-02-12",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 3840, height: 2160 },
      maxDurationSeconds: 15,
    },
    pricing: { provider: "ByteDance", perSecond: 0.151 },
    benchmarks: { "video-arena-elo": 1225 },
    links: {
      docs: "https://www.byteplus.com/en/product/seedance",
      announcement:
        "https://www.byteplus.com/en/blog/dreamina-seedance2-0",
    },
    summary:
      "ByteDance's multimodal Seedance 2.0 text/image-to-video model (Dreamina / BytePlus ModelArk), with native audio and 4–15s clips up to 4K. Artificial Analysis lists ~$9.07/min (~$0.151/sec) for default 1080p API settings.",
  },
  {
    slug: "seedance-1-5-pro",
    name: "Seedance 1.5 Pro",
    organization: "ByteDance",
    releaseDate: "2025-12-15",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 1920, height: 1080 },
      maxDurationSeconds: 12,
    },
    pricing: { provider: "ByteDance", perSecond: 0.198 },
    benchmarks: { "video-arena-elo": 1000 },
    links: {
      docs: "https://www.byteplus.com/en/product/seedance",
      announcement: "https://www.byteplus.com/en/product/seedance",
    },
    summary:
      "Prior ByteDance Seedance Pro generation on BytePlus / Dreamina. Artificial Analysis with-audio Arena lists Elo 1000 and ~$11.86/min (~$0.198/sec) for default API settings (Dec 2025 release cohort).",
  },

  // ─── Runway ───────────────────────────────────────────────
  {
    slug: "runway-gen-4-5",
    name: "Gen-4.5",
    organization: "Runway",
    releaseDate: "2025-12-01",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 1280, height: 720 },
      maxDurationSeconds: 10,
    },
    pricing: { provider: "Runway", perSecond: 0.12 },
    benchmarks: {},
    links: {
      docs: "https://help.runwayml.com/hc/en-us/articles/46974685288467-Creating-with-Gen-4-5",
      announcement: "https://runway.com/research/introducing-runway-gen-4.5",
    },
    summary:
      "Runway's Gen-4.5 text- and image-to-video model with 2–10s clips at 720p and strong motion/prompt adherence. API/top-up economics are 12 credits/sec at $0.01 per credit ($0.12/sec); subscription effective rates vary by plan.",
  },

  // ─── Luma AI ──────────────────────────────────────────────
  {
    slug: "luma-ray-3",
    name: "Ray3",
    organization: "Luma AI",
    releaseDate: "2025-09-18",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 3840, height: 2160 },
      maxDurationSeconds: 10,
    },
    benchmarks: {},
    links: {
      docs: "https://docs.lumalabs.ai/docs/video-generation",
      announcement: "https://lumalabs.ai/news/ray3",
    },
    summary:
      "Luma's reasoning video model with native HDR/EXR pathways, draft mode, and Dream Machine + Adobe Firefly availability. Later Ray3.14 adds native 1080p and lower per-second cost; public USD list pricing still varies by subscription vs API, so pricing is omitted.",
  },
  {
    slug: "luma-ray-2",
    name: "Ray 2",
    organization: "Luma AI",
    releaseDate: "2025-01-15",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 3840, height: 2160 },
      maxDurationSeconds: 10,
    },
    benchmarks: {},
    links: {
      docs: "https://docs.lumalabs.ai/docs/video-generation",
      modelCard: "https://lumalabs.ai/ray2",
      announcement: "https://lumalabs.ai/changelog/introducing-ray2",
    },
    summary:
      "Luma Dream Machine's Ray 2 video model with 5s/10s generations, 540p–4K output options, and camera-concept controls via the Dream Machine API. Public USD per-second list pricing is not stable across subscription vs API surfaces, so pricing is omitted.",
  },

  // ─── xAI ──────────────────────────────────────────────────
  {
    slug: "grok-imagine-video",
    name: "Grok Imagine Video",
    organization: "xAI",
    releaseDate: "2026-01-28",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 1280, height: 720 },
      maxDurationSeconds: 15,
    },
    pricing: { provider: "xAI", perSecond: 0.05 },
    benchmarks: { "video-arena-elo": 1069 },
    links: {
      docs: "https://docs.x.ai/developers/model-capabilities/video/generation",
      modelCard: "https://docs.x.ai/developers/models/grok-imagine-video",
      announcement: "https://x.ai/news/grok-imagine-api",
    },
    summary:
      "xAI's Grok Imagine text/image-to-video model with 1–15s duration and 480p/720p output on the base SKU. Official model page lists $0.05/sec output; higher-res and Imagine Video 1.5 tiers cost more.",
  },

  // ─── Alibaba ──────────────────────────────────────────────
  {
    slug: "wan-2-7",
    name: "Wan 2.7",
    organization: "Alibaba",
    releaseDate: "2026-04-06",
    openSource: true,
    license: "Apache 2.0",
    specs: {
      maxResolution: { width: 1920, height: 1080 },
      maxDurationSeconds: 15,
    },
    pricing: { provider: "Alibaba", perSecond: 0.15 },
    benchmarks: { "video-arena-elo": 1108 },
    links: {
      docs: "https://wan.video",
      announcement:
        "https://www.alibabacloud.com/blog/alibaba-unveils-wan2-7-video-to-elevate-creators-from-executors-to-directors_603009",
    },
    summary:
      "Alibaba Tongyi Lab's Wan2.7-Video suite (T2V/I2V/R2V/edit) with native audio, 2–15s clips at 720p/1080p, and Apache-2.0 open weights plus Model Studio APIs. Artificial Analysis lists Elo ~1108 and ~$9.00/min (~$0.15/sec) for default hosted settings.",
  },
  {
    slug: "wan-2-6",
    name: "Wan 2.6",
    organization: "Alibaba",
    releaseDate: "2025-12-15",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 1920, height: 1080 },
      maxDurationSeconds: 15,
    },
    pricing: { provider: "Alibaba", perSecond: 0.15 },
    benchmarks: { "video-arena-elo": 1029 },
    links: {
      docs: "https://wan.video",
      announcement: "https://wan.video",
    },
    summary:
      "Prior Alibaba Wan API generation with native audio on the AA with-audio Arena (Elo ~1029). Artificial Analysis quotes ~$9.00/min (~$0.15/sec) for default 1080p hosted settings; distinct from the open Wan 2.2 T2V-A14B weights.",
  },
  {
    slug: "wan-2-2-t2v-a14b",
    name: "Wan 2.2 T2V-A14B",
    organization: "Alibaba",
    releaseDate: "2025-07-28",
    openSource: true,
    license: "Apache 2.0",
    specs: {
      maxResolution: { width: 1280, height: 720 },
      maxDurationSeconds: 5,
    },
    benchmarks: {},
    links: {
      docs: "https://github.com/Wan-Video/Wan2.2",
      modelCard: "https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B",
      announcement: "https://wan.video",
    },
    summary:
      "Alibaba Tongyi Lab's open Apache-2.0 MoE text-to-video checkpoint (27B total / 14B active) supporting 480p and 720p ~5s clips. Weights and inference code are on Hugging Face and GitHub; later Wan 2.6/2.7 API SKUs are closed and not this open release.",
  },

  // ─── Lightricks (open weights) ────────────────────────────
  {
    slug: "ltx-2-3",
    name: "LTX-2.3",
    organization: "Lightricks",
    releaseDate: "2026-03-05",
    openSource: true,
    license: "LTX-2 Community License",
    specs: {
      maxResolution: { width: 3840, height: 2160 },
      maxDurationSeconds: 20,
    },
    benchmarks: { "video-arena-elo": 980 },
    links: {
      docs: "https://github.com/Lightricks/LTX-2",
      modelCard: "https://huggingface.co/Lightricks/LTX-2.3",
      announcement: "https://ltx.io/model/ltx-2",
    },
    summary:
      "Open-weights DiT audio-video foundation model from Lightricks with synchronized audio, up to ~20s clips, and native 4K pathways. Leading open-weights entry on the Artificial Analysis with-audio Arena (LTX-2.3 Fast Open Weights Elo). Self-host; hosted API rates vary by provider.",
  },

  // ─── Skywork AI ───────────────────────────────────────────
  {
    slug: "skyreels-v4",
    name: "SkyReels V4",
    organization: "Skywork AI",
    releaseDate: "2026-02-25",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 1920, height: 1080 },
      maxDurationSeconds: 15,
    },
    pricing: { provider: "Skywork AI", perSecond: 0.35 },
    benchmarks: { "video-arena-elo": 1109 },
    links: {
      docs: "https://www.skyreels.ai",
      announcement: "https://arxiv.org/abs/2602.21818",
    },
    summary:
      "Skywork AI's unified multi-modal SkyReels-V4 for joint video–audio generation, inpainting, and editing (up to 1080p / 32 FPS / 15s). Artificial Analysis with-audio Arena lists Elo ~1109 and ~$21.00/min (~$0.35/sec) for default API settings; prior V1–V3 were open-weight, V4 is API-only.",
  },

  // ─── Vidu (Shengshu) ──────────────────────────────────────
  {
    slug: "vidu-q3-pro",
    name: "Vidu Q3 Pro",
    organization: "Vidu",
    releaseDate: "2026-01-30",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 1920, height: 1080 },
      maxDurationSeconds: 16,
    },
    pricing: { provider: "Vidu", perSecond: 0.16 },
    benchmarks: { "video-arena-elo": 1082 },
    links: {
      docs: "https://www.vidu.com",
      announcement:
        "https://www.prnewswire.com/news-releases/vidu-showcases-china-speed-in-advancing-ai-video-into-production-at-global-creativity-week-302675040.html",
    },
    summary:
      "Shengshu Technology's Vidu Q3 Pro tier with single-pass native audio-video, up to 16s at 1080p, and cinematic camera/lip-sync controls. Artificial Analysis lists Elo ~1082 and ~$9.60/min (~$0.16/sec) for default API settings.",
  },

  // ─── PixVerse ─────────────────────────────────────────────
  {
    slug: "pixverse-v6",
    name: "PixVerse V6",
    organization: "PixVerse",
    releaseDate: "2026-03-30",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 1920, height: 1080 },
      maxDurationSeconds: 15,
    },
    pricing: { provider: "PixVerse", perSecond: 0.115 },
    benchmarks: { "video-arena-elo": 1077 },
    links: {
      docs: "https://pixverse.ai",
      announcement:
        "https://pixverse.ai/en/blog/pixverse-launches-v6-advancing-ai-video-generation",
    },
    summary:
      "PixVerse flagship V6 with multi-shot storytelling, cinematic camera controls, and native synchronized audio up to 15s at 1080p. Artificial Analysis with-audio Arena lists Elo ~1077 and ~$6.90/min (~$0.115/sec).",
  },

  // ─── Pika ─────────────────────────────────────────────────
  {
    slug: "pika-2-2",
    name: "Pika 2.2",
    organization: "Pika",
    releaseDate: "2025-02-27",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 1920, height: 1080 },
      maxDurationSeconds: 10,
    },
    benchmarks: {},
    links: {
      docs: "https://pika.art",
      announcement: "https://pika.art",
    },
    summary:
      "Pika Labs' creator-focused 2.2 release with up to 10s 1080p clips, Pikaframes keyframe transitions, and effects tooling on pika.art. Subscription credit economics dominate; stable first-party USD per-second API pricing is not published, so pricing/Elo are omitted.",
  },

  // ─── Haiper ───────────────────────────────────────────────
  {
    slug: "haiper-2-0",
    name: "Haiper 2.0",
    organization: "Haiper",
    releaseDate: "2024-10-21",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 1280, height: 720 },
      maxDurationSeconds: 6,
    },
    pricing: { provider: "Haiper", perSecond: 0.05 },
    benchmarks: {},
    links: {
      docs: "https://docs.haiper.ai/api-reference/overview",
      announcement:
        "https://www.prnewswire.com/news-releases/ai-platform-haiper-launches-powerful-2-0-video-model-for-increased-realism-and-faster-generations-302288901.html",
    },
    summary:
      "Haiper Video 2.x text/image-to-video API (4s/6s presets) at 540p/720p. Official API pricing is $0.033/sec (540p) and $0.05/sec (720p); consumer web app was discontinued and the API surface continues under Haiper/NetMind operations.",
  },

  // ─── Tencent (open weights) ───────────────────────────────
  {
    slug: "hunyuan-video-1-5",
    name: "HunyuanVideo 1.5",
    organization: "Tencent",
    releaseDate: "2025-11-20",
    openSource: true,
    license: "Tencent Hunyuan Community License",
    specs: {
      maxResolution: { width: 1920, height: 1080 },
      maxDurationSeconds: 10,
    },
    benchmarks: {},
    links: {
      docs: "https://github.com/Tencent-Hunyuan/HunyuanVideo-1.5",
      modelCard: "https://huggingface.co/tencent/HunyuanVideo-1.5",
      announcement: "https://huggingface.co/tencent/HunyuanVideo-1.5",
    },
    summary:
      "Tencent's 8.3B open DiT for unified text-to-video and image-to-video, with SSTA attention and a built-in super-resolution path to 1080p. Targets consumer GPUs (~14GB+ with offload); self-host — no first-party per-second API list price.",
  },

  // ─── Zhipu / Tsinghua (open weights) ──────────────────────
  {
    slug: "cogvideox-5b",
    name: "CogVideoX-5B",
    organization: "Zhipu AI",
    releaseDate: "2024-08-27",
    openSource: true,
    license: "CogVideoX License",
    specs: {
      maxResolution: { width: 720, height: 480 },
      maxDurationSeconds: 6,
    },
    benchmarks: {},
    links: {
      docs: "https://github.com/zai-org/CogVideo",
      modelCard: "https://huggingface.co/zai-org/CogVideoX-5b",
      announcement:
        "https://github.com/zai-org/CogVideo",
    },
    summary:
      "Open CogVideoX 5B expert-transformer text-to-video checkpoint from Zhipu AI / Tsinghua (QingYing lineage). Generates ~6s 720×480 clips at 8 fps; later CogVideoX1.5 variants extend resolution/duration. Self-host via Diffusers/GitHub.",
  },

  // ─── Genmo (open weights) ─────────────────────────────────
  {
    slug: "mochi-1",
    name: "Mochi 1",
    organization: "Genmo",
    releaseDate: "2024-10-22",
    openSource: true,
    license: "Apache 2.0",
    specs: {
      maxResolution: { width: 848, height: 480 },
      maxDurationSeconds: 5,
    },
    benchmarks: {},
    links: {
      docs: "https://github.com/genmoai/mochi",
      modelCard: "https://huggingface.co/genmo/mochi-1-preview",
      announcement:
        "https://www.genmo.ai/blog",
    },
    summary:
      "Genmo's Apache-2.0 open 10B AsymmDiT text-to-video preview with strong motion coherence at ~480p / ~5s. Weights on Hugging Face (genmo/mochi-1-preview); self-host or use community hosted runtimes — no stable first-party per-second price.",
  },

  // ─── Meta (research) ──────────────────────────────────────
  {
    slug: "meta-movie-gen",
    name: "Movie Gen",
    organization: "Meta",
    releaseDate: "2024-10-04",
    openSource: false,
    license: "Proprietary",
    specs: {
      maxResolution: { width: 1920, height: 1080 },
      maxDurationSeconds: 16,
    },
    benchmarks: {},
    links: {
      docs: "https://ai.meta.com/research/publications/movie-gen-a-cast-of-media-foundation-models/",
      announcement:
        "https://ai.meta.com/blog/movie-gen-media-foundation-models-generative-ai-video/",
    },
    summary:
      "Meta's research media foundation suite for 1080p video with synchronized audio (up to ~16s), personalization, and instruction editing. Announced Oct 2024 with a creative-industry pilot; not a public developer API, so pricing and Arena Elo are omitted.",
  },
];
