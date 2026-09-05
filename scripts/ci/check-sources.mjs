/**
 * Confirms that every source cited by changed data is actually reachable.
 *
 * Failure classification follows the repository's split policy: a URL that is
 * definitively wrong (404, 410, dead host, bad redirect target) blocks the pull
 * request, while an ambiguous network result (bot wall, rate limit, timeout,
 * provider outage) is reported loudly but does not block, because those say
 * nothing about whether the cited number is right.
 */
import fs from "node:fs";
import { appendSummary, renderTable } from "./report.mjs";

const CONCURRENCY = 4;
const ATTEMPTS = 3;
const TIMEOUT_MS = 25_000;
const USER_AGENT =
  "llmcompare-data-integrity/1.0 (+https://github.com/olxver2025/llmcompare)";

const diffPath = process.argv.find((arg) => arg.startsWith("--diff="))?.slice("--diff=".length) ?? "data-diff.json";
if (!fs.existsSync(diffPath)) {
  console.log(`No ${diffPath}; nothing to check.`);
  process.exit(0);
}
const diff = JSON.parse(fs.readFileSync(diffPath, "utf8"));

/** @type {Map<string, Set<string>>} url -> the cells that cite it */
const citations = new Map();
const cite = (url, label) => {
  if (typeof url !== "string" || !url.startsWith("https://")) return;
  if (!citations.has(url)) citations.set(url, new Set());
  citations.get(url).add(label);
};

for (const cell of diff.benchmarkCells ?? []) {
  if (cell.change === "removed") continue;
  cite(cell.evidence?.sourceUrl, `${cell.slug}/${cell.benchmarkId}`);
}
for (const model of diff.addedModels ?? []) {
  for (const [name, url] of Object.entries(model.links ?? {})) {
    cite(url, `${model.slug} links.${name}`);
  }
}
for (const change of diff.benchmarkMetaChanges ?? []) {
  if (change.field === "sourceUrl") cite(change.after, `benchmark ${change.id}`);
  if (change.change === "added") cite(change.after?.sourceUrl, `benchmark ${change.id}`);
}

const urls = [...citations.keys()];
if (urls.length === 0) {
  appendSummary("## Source reachability\n\nNo new source URLs to check.");
  console.log("No source URLs cited by this diff.");
  process.exit(0);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchOnce(url, method) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,application/json;q=0.9,*/*;q=0.8",
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

/** 404/410 and dead hosts are the PR's problem; 403/429/5xx are the internet's. */
function classify(status) {
  if (status >= 200 && status < 300) return "ok";
  if (status === 404 || status === 410 || status === 451) return "hard";
  return "soft";
}

async function check(url) {
  let lastDetail = "";
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    try {
      let response = await fetchOnce(url, "HEAD");
      // Plenty of static hosts and CDNs answer HEAD with 403/405 but serve GET.
      if (!response.ok) response = await fetchOnce(url, "GET");
      const verdict = classify(response.status);
      if (verdict === "ok") {
        return { url, verdict, status: response.status, finalUrl: response.url };
      }
      lastDetail = `HTTP ${response.status}`;
      if (verdict === "hard") {
        return { url, verdict, status: response.status, detail: lastDetail };
      }
    } catch (error) {
      // Node wraps network errors, so the useful code lives on `cause`.
      const cause = error.cause?.code ?? error.cause?.message ?? "";
      lastDetail =
        error.name === "AbortError"
          ? `timed out after ${TIMEOUT_MS} ms`
          : [error.message, cause].filter(Boolean).join(": ");
      // A hostname that does not resolve is a broken citation, not a flake.
      if (/ENOTFOUND|ERR_INVALID_URL|ERR_TLS_CERT_ALTNAME_INVALID/.test(cause)) {
        return { url, verdict: "hard", detail: `host does not resolve (${lastDetail})` };
      }
    }
    if (attempt < ATTEMPTS) await sleep(2 ** attempt * 1000);
  }
  return { url, verdict: "soft", detail: lastDetail || "unreachable" };
}

const results = [];
const queue = [...urls];
await Promise.all(
  Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length > 0) {
      const url = queue.shift();
      results.push(await check(url));
    }
  })
);

const hard = results.filter((result) => result.verdict === "hard");
const soft = results.filter((result) => result.verdict === "soft");
const ok = results.filter((result) => result.verdict === "ok");

const rowsFor = (list) =>
  list.map((result) => [
    [...citations.get(result.url)].join(", "),
    `[link](${result.url})`,
    result.detail ?? `HTTP ${result.status}`,
  ]);

const lines = [
  "## Source reachability",
  "",
  `Checked ${results.length} cited URLs: **${ok.length} reachable**, **${hard.length} broken**, **${soft.length} unverifiable**.`,
  "",
];

if (hard.length > 0) {
  lines.push(
    "### ❌ Broken citations (blocking)",
    "",
    renderTable(["Cell", "URL", "Result"], rowsFor(hard)),
    ""
  );
}
if (soft.length > 0) {
  lines.push(
    "### ⚠️ Could not be verified (not blocking)",
    "",
    "These sources answered with a bot wall, a rate limit, or a timeout. That says nothing about whether the cited number is right — check them by hand before merging.",
    "",
    renderTable(["Cell", "URL", "Result"], rowsFor(soft)),
    ""
  );
}
if (hard.length === 0 && soft.length === 0) {
  lines.push("✅ Every cited source resolved.");
}

appendSummary(lines.join("\n"));
fs.writeFileSync("source-check.json", `${JSON.stringify({ ok: ok.length, hard, soft }, null, 2)}\n`);

for (const result of hard) {
  console.error(`FAIL ${[...citations.get(result.url)].join(", ")} -> ${result.url} (${result.detail ?? result.status})`);
}
for (const result of soft) {
  console.warn(`WARN ${[...citations.get(result.url)].join(", ")} -> ${result.url} (${result.detail ?? result.status})`);
}

if (hard.length > 0) process.exitCode = 1;
else console.log(`OK ${ok.length}/${results.length} cited sources reachable`);
