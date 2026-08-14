import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { load } from "./update-benchmarks/load.mjs";

const asOf = "2026-08-14";

const models = load("src/data/models.ts", "models");
const imageModels = load("src/data/image-models.ts", "imageModels");
const videoModels = load("src/data/video-models.ts", "videoModels");
const benchmarkCatalog = load("src/data/benchmarks.ts", "BENCHMARKS");
const benchmarkIds = new Set(load("src/data/benchmarks.ts", "BENCHMARK_IDS"));
const evidenceLedger = JSON.parse(
  fs.readFileSync("scripts/benchmark-evidence.json", "utf8")
);
const emptyBenchmarkManifest = JSON.parse(
  fs.readFileSync("scripts/benchmark-empty-models.json", "utf8")
);
const modelsLibSource = fs.readFileSync("src/lib/models.ts", "utf8");

const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};
const bySlug = Object.fromEntries(models.map((model) => [model.slug, model]));
const expectedBenchmarkIds = new Set([
  "mmlu-pro",
  "gpqa-diamond",
  "hle",
  "aime-2025",
  "math-500",
  "swe-bench-verified",
  "swe-bench-pro",
  "swe-bench-multilingual",
  "livecodebench",
  "terminal-bench-2-1",
  "terminal-bench-3",
  "aider-polyglot",
  "scicode",
  "cursorbench",
  "swe-rebench",
  "nl2repo",
  "cybergym",
  "deepswe",
  "toolathlon-verified",
  "agents-last-exam",
  "automation-bench",
  "webdev-arena",
  "bigcodebench",
  "tau-bench",
  "matharena",
  "lmarena-elo",
]);

try {
  execFileSync(
    process.execPath,
    ["scripts/generate-benchmark-evidence.mjs", "--check"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
  );
} catch (error) {
  const detail = String(error.stderr ?? error.message ?? "unknown generator error").trim();
  check(false, `benchmark evidence ledger is not reproducible: ${detail}`);
}

check(benchmarkIds.size === 26, `expected 26 benchmark IDs, found ${benchmarkIds.size}`);
check(
  benchmarkIds.size === Object.keys(benchmarkCatalog).length,
  "benchmark metadata and benchmark ID exports disagree"
);
check(
  benchmarkIds.size === expectedBenchmarkIds.size &&
    [...benchmarkIds].every((id) => expectedBenchmarkIds.has(id)),
  "benchmark IDs changed outside the audited 35-field scope"
);
check(evidenceLedger.asOf === asOf, `evidence ledger is not dated ${asOf}`);
check(
  emptyBenchmarkManifest.asOf === asOf,
  `empty benchmark manifest is not dated ${asOf}`
);
check(
  modelsLibSource.includes(`DATA_FRESHNESS = "${asOf}"`),
  `src/lib/models.ts DATA_FRESHNESS must be ${asOf}`
);
check(
  Object.keys(evidenceLedger.cells).length === models.length,
  "evidence ledger must include every model, including intentional empty records"
);

check(models.length === 268, `expected 268 models, found ${models.length}`);
check(new Set(models.map((model) => model.slug)).size === models.length, "duplicate model slug");
const expectedEmptyBenchmarkModels = new Set(emptyBenchmarkManifest.slugs);
check(
  expectedEmptyBenchmarkModels.size === emptyBenchmarkManifest.slugs.length,
  "empty benchmark manifest contains duplicate model slugs"
);
check(bySlug["qwen3-7-plus"], "Qwen3.7 Plus should be catalogued");
check(bySlug["qwen3-7-flash"], "Qwen3.7 Flash should be catalogued");
check(bySlug["kimi-k2-7-code"], "Kimi K2.7 Code should be catalogued");
check(bySlug["muse-spark-1-2"], "Muse Spark 1.2 should be catalogued");
check(bySlug["gemini-3-5-flash-cyber"], "Gemini 3.5 Flash Cyber should be catalogued");
check(bySlug["inkling"], "Inkling should be catalogued");
check(bySlug["inkling-small"], "Inkling-Small should be catalogued");

for (const model of models) {
  check(model.releaseDate <= asOf, `${model.slug} has a future release date`);
  check(model.contextWindow > 0, `${model.slug} has no positive context window`);
  check(model.modalities?.input?.length > 0, `${model.slug} has no input modality`);
  check(model.modalities?.output?.length > 0, `${model.slug} has no output modality`);
  if (Object.keys(model.benchmarks).length === 0) {
    check(
      expectedEmptyBenchmarkModels.has(model.slug),
      `${model.slug} is newly empty but missing from the reviewed empty manifest`
    );
  }
  if (model.benchmarkAliasOf) {
    const canonical = bySlug[model.benchmarkAliasOf];
    check(
      canonical && canonical.slug !== model.slug,
      `${model.slug} benchmark alias references an invalid canonical model`
    );
    check(
      canonical && !canonical.benchmarkAliasOf,
      `${model.slug} benchmark alias must reference a canonical model`
    );
    const canonicalIds = Object.keys(canonical?.benchmarks ?? {});
    const aliasIds = Object.keys(model.benchmarks);
    check(
      canonicalIds.length === aliasIds.length &&
        canonicalIds.every(
          (id) => model.benchmarks[id] === canonical?.benchmarks[id]
        ),
      `${model.slug} benchmark alias does not exactly match ${model.benchmarkAliasOf}`
    );
  }
  const modelEvidence = evidenceLedger.cells[model.slug];
  check(modelEvidence, `${model.slug} is missing from the evidence ledger`);
  for (const id of Object.keys(model.benchmarks)) {
    check(benchmarkIds.has(id), `${model.slug} has unknown benchmark ${id}`);
    const value = model.benchmarks[id];
    const meta = benchmarkCatalog[id];
    check(Number.isFinite(value), `${model.slug}/${id} is not numeric`);
    if (meta?.unit === "elo") {
      check(
        value >= 0 && value <= 3000,
        `${model.slug}/${id} Elo value is outside [0, 3000]`
      );
    } else {
      check(
        value >= 0 && value <= 100,
        `${model.slug}/${id} percent value is outside [0, 100]`
      );
    }

    const evidence = modelEvidence?.[id];
    check(evidence, `${model.slug}/${id} is missing evidence`);
    check(
      evidence?.value === value,
      `${model.slug}/${id} evidence value does not match catalog`
    );
    check(
      /^https?:\/\/\S+$/.test(evidence?.sourceUrl ?? ""),
      `${model.slug}/${id} evidence source URL is invalid`
    );
    check(
      evidence?.checkedOn === asOf,
      `${model.slug}/${id} evidence is not checked on ${asOf}`
    );
    const evaluationDate = evidence?.evaluationDate ?? "";
    const parsedEvaluationDate = new Date(`${evaluationDate}T00:00:00Z`);
    check(
      /^\d{4}-\d{2}-\d{2}$/.test(evaluationDate) &&
        !Number.isNaN(parsedEvaluationDate.getTime()) &&
        parsedEvaluationDate.toISOString().slice(0, 10) === evaluationDate &&
        evaluationDate <= asOf,
      `${model.slug}/${id} evidence evaluation date is invalid or in the future`
    );
    check(
      typeof evidence?.protocol === "string" && evidence.protocol.trim().length > 0,
      `${model.slug}/${id} evidence has no protocol note`
    );
  }
}

for (const [slug, modelEvidence] of Object.entries(evidenceLedger.cells)) {
  check(bySlug[slug], `evidence ledger has unknown model ${slug}`);
  for (const [id, evidence] of Object.entries(modelEvidence)) {
    check(benchmarkIds.has(id), `evidence ledger has unknown benchmark ${id}`);
    check(
      bySlug[slug]?.benchmarks?.[id] !== undefined,
      `evidence ledger has an unretained cell ${slug}/${id}`
    );
    check(
      evidence.value === bySlug[slug]?.benchmarks?.[id],
      `evidence ledger value mismatch for ${slug}/${id}`
    );
  }
}

const exact = (slug, path, expected) => {
  const value = path.split(".").reduce((current, key) => current?.[key], bySlug[slug]);
  check(value === expected, `${slug}.${path} expected ${expected}, found ${value}`);
};

exact("gpt-5-6-sol", "pricing.inputPer1M", 5);
exact("gpt-5-6-sol", "pricing.outputPer1M", 30);
exact("gpt-5-6-terra", "pricing.inputPer1M", 2);
exact("gpt-5-6-terra", "pricing.outputPer1M", 12);
exact("gpt-5-6-luna", "pricing.inputPer1M", 0.2);
exact("gpt-5-6-luna", "pricing.outputPer1M", 1.2);
exact("gpt-5-6-terra", "benchmarks.terminal-bench-2-1", 87.4);
exact("gpt-5-6-luna", "benchmarks.swe-bench-pro", 62.7);
exact("deepseek-r1", "benchmarks.mmlu-pro", 84);
exact("deepseek-r1", "benchmarks.math-500", 97.3);
exact("deepseek-r1-0528", "benchmarks.aime-2025", 87.5);
exact("deepseek-v3-1", "benchmarks.gpqa-diamond", 80.1);
exact("gemma-3-12b", "benchmarks.mmlu-pro", 60.6);
exact("kimi-k2-5", "benchmarks.swe-bench-verified", 76.8);
exact("qwq-32b", "benchmarks.aime-2025", 69.5);
exact("qwen3-8-max", "pricing.inputPer1M", 2);
exact("qwen3-8-max", "pricing.outputPer1M", 6);
exact("qwen3-7-max", "pricing.inputPer1M", 2.5);
exact("qwen3-7-max", "pricing.outputPer1M", 7.5);
exact("qwen3-7-plus", "pricing.inputPer1M", 0.4);
exact("qwen3-7-flash", "pricing.inputPer1M", 0.03);
exact("kimi-k2-7-code", "pricing.inputPer1M", 0.95);
exact("gemma-4-31b", "contextWindow", 256000);
exact("gemma-4-26b", "parameters.total", 26);
exact("gemma-4-26b", "parameters.active", 3.8);
exact("gemma-4-26b", "contextWindow", 256000);
exact("grok-4-20", "releaseDate", "2026-05-20");
exact("grok-4-20", "contextWindow", 256000);
exact("mistral-small-4", "releaseDate", "2026-03-01");
exact("devstral-2", "releaseDate", "2025-12-01");
exact("gpt-4-1", "benchmarks.gpqa-diamond", 66.3);
exact("gpt-4-1", "benchmarks.swe-bench-verified", 54.6);
exact("gpt-4-1-mini", "benchmarks.gpqa-diamond", 65);
exact("gpt-4-1-mini", "benchmarks.swe-bench-verified", 23.6);
exact("gpt-4-1-nano", "benchmarks.gpqa-diamond", 50.3);
exact("claude-3-7-sonnet", "benchmarks.swe-bench-verified", 63.7);
exact("gemini-2-5-pro", "benchmarks.hle", 18.8);
exact("gemini-2-5-pro", "benchmarks.swe-bench-verified", 63.8);
exact("phi-4-mini", "benchmarks.mmlu-pro", 52.8);

for (const slug of expectedEmptyBenchmarkModels) {
  check(bySlug[slug], `${slug} empty-scorecard guard references an unknown model`);
  check(
    Object.keys(bySlug[slug]?.benchmarks ?? {}).length === 0,
    `${slug} must remain intentionally unscored until a public scorecard is audited`
  );
}

const scoreCount = models.reduce(
  (total, model) => total + Object.keys(model.benchmarks).length,
  0
);
check(scoreCount === 1191, `expected 1191 audited benchmark cells, found ${scoreCount}`);

const imageBenchmarkIds = new Set(["image-arena-elo"]);
const videoBenchmarkIds = new Set(["video-arena-elo"]);
const slugPattern = /^[a-z0-9-]+$/;

function verifyMediaCatalog(label, catalog, expectedCount, allowedBenchmarks, kind) {
  check(
    catalog.length === expectedCount,
    `expected ${expectedCount} ${label}, found ${catalog.length}`
  );
  check(
    new Set(catalog.map((model) => model.slug)).size === catalog.length,
    `duplicate ${label} slug`
  );

  for (const model of catalog) {
    check(slugPattern.test(model.slug), `${model.slug} has invalid slug`);
    check(model.releaseDate <= asOf, `${model.slug} has a future release date`);
    check(
      model.specs?.maxResolution?.width > 0 &&
        model.specs?.maxResolution?.height > 0,
      `${model.slug} has non-positive resolution`
    );

    if (model.pricing) {
      if (kind === "image") {
        check(
          model.pricing.perImage > 0,
          `${model.slug} has non-positive perImage price`
        );
      } else {
        check(
          model.pricing.perSecond > 0,
          `${model.slug} has non-positive perSecond price`
        );
      }
    }

    if (kind === "video") {
      check(
        model.specs?.maxDurationSeconds > 0,
        `${model.slug} has non-positive maxDurationSeconds`
      );
    }

    for (const id of Object.keys(model.benchmarks ?? {})) {
      check(
        allowedBenchmarks.has(id),
        `${model.slug} has unknown benchmark ${id}`
      );
      check(
        Number.isFinite(model.benchmarks[id]),
        `${model.slug}/${id} is not numeric`
      );
    }
  }
}

verifyMediaCatalog("image models", imageModels, 37, imageBenchmarkIds, "image");
verifyMediaCatalog("video models", videoModels, 30, videoBenchmarkIds, "video");

if (failures.length > 0) {
  console.error(failures.map((failure) => `FAIL ${failure}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `OK ${models.length} models; ${scoreCount} audited benchmark cells; ${imageModels.length} image models; ${videoModels.length} video models; snapshot ${asOf}`
  );
}
