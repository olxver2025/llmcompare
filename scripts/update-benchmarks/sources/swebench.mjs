import { fetchText } from "../load.mjs";

export const SWEBENCH_URL = "https://www.swebench.com/";

const BOARD_TO_BENCHMARK = {
  Verified: {
    benchmarkId: "swe-bench-verified",
    sourceUrl: "https://www.swebench.com/verified.html",
  },
  Multilingual: {
    benchmarkId: "swe-bench-multilingual",
    sourceUrl: "https://www.swebench.com/multilingual.html",
  },
};

function parseLeaderboardJson(html) {
  const match = html.match(
    /<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/i
  );
  if (!match) {
    throw new Error(
      `swebench.com is missing the application/json leaderboard payload. Excerpt: ${html.slice(0, 400)}`
    );
  }
  let boards;
  try {
    boards = JSON.parse(match[1]);
  } catch (error) {
    throw new Error(
      `swebench.com leaderboard JSON failed to parse: ${error.message}. Excerpt: ${match[1].slice(0, 400)}`
    );
  }
  if (!Array.isArray(boards) || boards.length === 0) {
    throw new Error(
      `swebench.com leaderboard JSON is not a non-empty array. Excerpt: ${match[1].slice(0, 400)}`
    );
  }
  return boards;
}

export default {
  name: "swebench",
  catalog: "llm",
  benchmarkIds: ["swe-bench-verified", "swe-bench-multilingual"],
  async fetchScores() {
    const html = await fetchText(process.env.SWEBENCH_URL || SWEBENCH_URL);
    const boards = parseLeaderboardJson(html);
    const scores = [];
    for (const [boardName, meta] of Object.entries(BOARD_TO_BENCHMARK)) {
      const board = boards.find((entry) => entry.name === boardName);
      if (!board || !Array.isArray(board.results) || board.results.length === 0) {
        throw new Error(
          `swebench.com is missing the ${boardName} board (found: ${boards.map((b) => b.name).join(", ") || "none"})`
        );
      }
      for (const row of board.results) {
        if (typeof row.name !== "string" || !row.name.trim()) {
          throw new Error(
            `swebench.com ${boardName} row missing name: ${JSON.stringify(row).slice(0, 300)}`
          );
        }
        if (!Number.isFinite(row.resolved)) {
          throw new Error(
            `swebench.com ${boardName} row missing resolved % for ${row.name}: ${JSON.stringify(row).slice(0, 300)}`
          );
        }
        if (typeof row.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) {
          throw new Error(
            `swebench.com ${boardName} row missing ISO date for ${row.name}: ${JSON.stringify(row).slice(0, 300)}`
          );
        }
        const agent = row.agent ?? "unknown agent";
        scores.push({
          benchmarkId: meta.benchmarkId,
          sourceModelName: row.name,
          value: row.resolved,
          sourceUrl: meta.sourceUrl,
          evaluationDate: row.date,
          protocol: `SWE-bench ${boardName} official leaderboard listing '${row.name}', agent ${agent}, resolved %.`,
        });
      }
    }
    return scores;
  },
};
