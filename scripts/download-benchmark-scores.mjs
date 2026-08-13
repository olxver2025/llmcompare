import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AIDER_YAML_URL } from "./update-benchmarks/sources/aider.mjs";
import swebench from "./update-benchmarks/sources/swebench.mjs";
import sweRebench from "./update-benchmarks/sources/swe-rebench.mjs";
import aider from "./update-benchmarks/sources/aider.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "benchmarks");
const MARKDOWN_PATH = path.join(ROOT, "BENCHMARKS.md");
const USER_AGENT = "llmcompare-benchmark-downloader/1.0 (+https://github.com/anomalyco/opencode)";
const CONCURRENCY = 6;

const EXTRA_SCORES = {
  "livecodebench": [
    "https://livecodebench.github.io/performances_generation.json",
    "https://livecodebench.github.io/leaderboard.html",
  ],
  "aider-polyglot": [AIDER_YAML_URL],
  evalplus: ["https://evalplus.github.io/results.json"],
  bigcodebench: ["https://bigcode-bench.github.io/results.json"],
  livebench: ["https://huggingface.co/api/datasets/livebench/model_judgment"],
  "aime-2025": ["https://huggingface.co/api/datasets/MathArena/aime_2025"],
};

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function unescapeMd(url) {
  return url.replace(/\\_/g, "_").replace(/\\-/g, "-");
}

function parseBenchmarksMd(text) {
  const groups = [];
  let current = null;
  for (const rawLine of text.split(/\r?\n/)) {
    const heading = rawLine.match(/^\\?##\s+(.+?)\s*$/);
    if (heading) {
      current = { name: heading[1].trim(), slug: slugify(heading[1]), urls: [] };
      groups.push(current);
      continue;
    }
    if (!current) continue;
    const match = rawLine.match(/https?:\/\/\S+/);
    if (match) current.urls.push(unescapeMd(match[0].replace(/[).,;]+$/, "")));
  }
  const bySlug = new Map();
  for (const group of groups) {
    const existing = bySlug.get(group.slug);
    if (existing) {
      existing.urls.push(...group.urls);
      continue;
    }
    bySlug.set(group.slug, group);
  }
  for (const group of bySlug.values()) {
    group.urls = [...new Set([...(EXTRA_SCORES[group.slug] ?? []), ...group.urls])];
  }
  return [...bySlug.values()].filter((group) => group.urls.length > 0);
}

function extFrom(url, contentType) {
  const pathname = new URL(url).pathname;
  const ext = path.extname(pathname).toLowerCase();
  if ([".json", ".yml", ".yaml", ".csv", ".tsv", ".html", ".htm", ".md", ".txt", ".pdf"].includes(ext)) {
    return ext === ".htm" ? ".html" : ext;
  }
  const type = (contentType ?? "").toLowerCase();
  if (type.includes("json")) return ".json";
  if (type.includes("yaml") || type.includes("yml")) return ".yml";
  if (type.includes("csv")) return ".csv";
  if (type.includes("pdf")) return ".pdf";
  if (type.includes("text/plain")) return ".txt";
  return ".html";
}

function filenameFromUrl(url, contentType) {
  const parsed = new URL(url);
  const base = `${parsed.hostname}${parsed.pathname}${parsed.search}`
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 160);
  const ext = extFrom(url, contentType);
  return base.endsWith(ext) ? base : `${base}${ext}`;
}

async function fetchUrl(url) {
    const res = await fetch(url, {
    headers: { "user-agent": USER_AGENT, accept: "*/*" },
    redirect: "follow",
    signal: AbortSignal.timeout(25000),
  });
  const buffer = Buffer.from(await res.arrayBuffer());
  return {
    ok: res.ok,
    status: res.status,
    contentType: res.headers.get("content-type") ?? "",
    finalUrl: res.url,
    buffer,
  };
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function writeAdapterScores(slug, fetchScores) {
  const dir = path.join(OUT, slug);
  fs.mkdirSync(dir, { recursive: true });
  try {
    const scores = await fetchScores();
    fs.writeFileSync(path.join(dir, "scores.json"), `${JSON.stringify(scores, null, 2)}\n`);
    return { slug, ok: true, count: scores.length };
  } catch (error) {
    fs.writeFileSync(
      path.join(dir, "scores.error.txt"),
      `${error instanceof Error ? error.stack ?? error.message : String(error)}\n`
    );
    return { slug, ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function main() {
  const groups = parseBenchmarksMd(fs.readFileSync(MARKDOWN_PATH, "utf8"));
  fs.mkdirSync(OUT, { recursive: true });

  const jobs = [];
  for (const group of groups) {
    for (const url of group.urls) {
      jobs.push({ slug: group.slug, name: group.name, url });
    }
  }

  const downloads = await mapLimit(jobs, CONCURRENCY, async (job) => {
    const dir = path.join(OUT, job.slug);
    fs.mkdirSync(dir, { recursive: true });
    try {
      const result = await fetchUrl(job.url);
      const filename = filenameFromUrl(job.url, result.contentType);
      fs.writeFileSync(path.join(dir, filename), result.buffer);
      return {
        slug: job.slug,
        name: job.name,
        url: job.url,
        file: `${job.slug}/${filename}`,
        status: result.status,
        ok: result.ok,
        bytes: result.buffer.length,
        contentType: result.contentType,
        finalUrl: result.finalUrl,
      };
    } catch (error) {
      return {
        slug: job.slug,
        name: job.name,
        url: job.url,
        file: null,
        status: 0,
        ok: false,
        bytes: 0,
        contentType: "",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

  const adapters = await Promise.all([
    writeAdapterScores("aider-polyglot", () => aider.fetchScores()),
    writeAdapterScores("swe-bench-verified", () => swebench.fetchScores()),
    writeAdapterScores("swe-rebench", () => sweRebench.fetchScores()),
  ]);

  const manifest = {
    downloadedAt: new Date().toISOString(),
    source: "BENCHMARKS.md",
    benchmarks: groups.map((group) => ({
      slug: group.slug,
      name: group.name,
      files: downloads.filter((row) => row.slug === group.slug),
    })),
    parsedScores: adapters,
    totals: {
      benchmarks: groups.length,
      urls: downloads.length,
      ok: downloads.filter((row) => row.ok).length,
      failed: downloads.filter((row) => !row.ok).length,
      bytes: downloads.reduce((sum, row) => sum + row.bytes, 0),
    },
  };
  fs.writeFileSync(path.join(OUT, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  const failed = downloads.filter((row) => !row.ok);
  console.log(
    `Downloaded ${manifest.totals.ok}/${manifest.totals.urls} URLs into ${OUT} (${manifest.totals.benchmarks} benchmarks).`
  );
  for (const row of adapters) {
    console.log(row.ok ? `Parsed ${row.slug}: ${row.count} scores` : `Parse failed ${row.slug}: ${row.error}`);
  }
  if (failed.length > 0) {
    console.log("Failed:");
    for (const row of failed) console.log(`  ${row.status} ${row.slug} ${row.url} ${row.error ?? ""}`);
    process.exitCode = 1;
  }
}

main();
