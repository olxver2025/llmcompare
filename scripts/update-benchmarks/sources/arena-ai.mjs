import fs from "node:fs";
import { flightSegments } from "./artificial-analysis.mjs";

export function extractArenaEntries(file) {
  const segs = flightSegments(file);
  for (const s of segs) {
    if (!s.includes('"entries"')) continue;
    let idx = 0;
    while (true) {
      const i = s.indexOf('"entries"', idx);
      if (i < 0) break;
      let depth = 0, inStr = false, esc = false, arrStart = -1, arrEnd = -1;
      for (let k = i + 9; k < s.length; k++) {
        const ch = s[k];
        if (inStr) { if (esc) esc = false; else if (ch === "\\") esc = true; else if (ch === '"') inStr = false; continue; }
        if (ch === '"') { inStr = true; continue; }
        if (ch === "[") { depth++; if (arrStart < 0) arrStart = k; }
        else if (ch === "]") { depth--; if (depth === 0) { arrEnd = k; break; } }
      }
      if (arrStart < 0) break;
      const raw = s.slice(arrStart, arrEnd + 1);
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].modelDisplayName !== undefined) {
          return parsed;
        }
      } catch {}
      idx = arrEnd + 1;
    }
  }
  return null;
}

export function extractLMArenaElo() {
  const entries = extractArenaEntries("benchmarks/lmarena-elo/arena.ai-leaderboard.html");
  return (entries ?? []).map((e) => ({
    benchmarkId: "lmarena-elo",
    sourceModelName: e.modelDisplayName,
    value: Math.round(e.rating * 10) / 10,
    sourceUrl: "https://arena.ai/leaderboard",
    evaluationDate: "2026-08-12",
    protocol: `LMArena Elo leaderboard snapshot, ${e.modelDisplayName}, style-control overall Elo.`,
  })).filter((s) => Number.isFinite(s.value));
}

export function extractWebDevArena() {
  const entries = extractArenaEntries("benchmarks/webdev-arena/arena.ai-leaderboard-code-webdev.html");
  return (entries ?? []).map((e) => ({
    benchmarkId: "webdev-arena",
    sourceModelName: e.modelDisplayName,
    value: Math.round(e.rating * 10) / 10,
    sourceUrl: "https://arena.ai/leaderboard/code/webdev",
    evaluationDate: "2026-08-12",
    protocol: `WebDev Arena leaderboard snapshot, ${e.modelDisplayName}, overall Elo.`,
  })).filter((s) => Number.isFinite(s.value));
}
