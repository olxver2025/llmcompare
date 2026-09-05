/**
 * Upserts a single sticky pull request comment so repeated pushes replace the
 * previous report instead of burying the thread.
 *
 * Usage: node scripts/ci/pr-comment.mjs <marker> <body-file>
 */
const [marker, bodyFile] = process.argv.slice(2);
if (!marker || !bodyFile) {
  console.error("usage: pr-comment.mjs <marker> <body-file>");
  process.exit(1);
}

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const prNumber = process.env.PR_NUMBER;

if (!token || !repository || !prNumber) {
  console.log("No pull request context; skipping comment.");
  process.exit(0);
}

const { readFileSync } = await import("node:fs");
const hidden = `<!-- ${marker} -->`;
const body = `${hidden}\n${readFileSync(bodyFile, "utf8")}`;
const api = `https://api.github.com/repos/${repository}`;
const headers = {
  authorization: `Bearer ${token}`,
  accept: "application/vnd.github+json",
  "content-type": "application/json",
  "user-agent": "llmcompare-data-integrity",
};

async function request(url, init = {}) {
  const response = await fetch(url, { ...init, headers });
  if (!response.ok) {
    throw new Error(`${init.method ?? "GET"} ${url} -> ${response.status} ${await response.text()}`);
  }
  return response.json();
}

const existing = await request(`${api}/issues/${prNumber}/comments?per_page=100`);
const previous = existing.find((comment) => comment.body?.includes(hidden));

if (previous) {
  await request(`${api}/issues/comments/${previous.id}`, {
    method: "PATCH",
    body: JSON.stringify({ body }),
  });
  console.log(`Updated comment ${previous.id}.`);
} else {
  await request(`${api}/issues/${prNumber}/comments`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
  console.log("Posted a new comment.");
}
