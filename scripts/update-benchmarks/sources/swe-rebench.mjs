import { fetchText, todayIsoDate } from "../load.mjs";

export const SWE_REBENCH_URL = "https://swe-rebench.com/";

function extractJsonObject(text, startHint) {
  const start = text.indexOf("{", startHint);
  if (start < 0) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

function flightPayload(html) {
  const pushes = [...html.matchAll(/self\.__next_f\.push\(([\s\S]*?)\)<\/script>/g)].map(
    (match) => match[1]
  );
  if (pushes.length === 0) {
    throw new Error(
      `swe-rebench.com is missing Next.js flight payloads. Excerpt: ${html.slice(0, 400)}`
    );
  }
  const payloads = [];
  for (const raw of pushes) {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed[1] === "string") payloads.push(parsed[1]);
      else if (typeof parsed === "string") payloads.push(parsed);
      else payloads.push(raw);
    } catch {
      payloads.push(raw);
    }
  }
  const withModels = payloads.find((payload) => payload.includes('"modelId":'));
  if (!withModels) {
    const excerpt = payloads.sort((a, b) => b.length - a.length)[0]?.slice(0, 400) ?? "";
    throw new Error(
      `swe-rebench.com flight payload contained no model objects (htmlHasModelId=${html.includes("modelId")} pushes=${pushes.length} sizes=${pushes.map((p) => p.length).join(",")}). Excerpt: ${excerpt}`
    );
  }
  return withModels;
}

function roundScore(value) {
  return Math.round(value * 10) / 10;
}

export function parseSweRebenchModels(payload) {
  const models = [];
  let cursor = 0;
  while (true) {
    const idx = payload.indexOf('"modelId":', cursor);
    if (idx < 0) break;
    const objectStart = payload.lastIndexOf("{", idx);
    const raw = objectStart >= 0 ? extractJsonObject(payload, objectStart) : null;
    cursor = idx + 10;
    if (!raw) continue;
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }
    if (parsed.modelId && parsed.modelName && parsed.rangeStats) {
      models.push(parsed);
    }
  }
  if (models.length === 0) {
    throw new Error(
      `swe-rebench.com flight payload contained no model objects. Excerpt: ${payload.slice(0, 400)}`
    );
  }
  return models;
}

export default {
  name: "swe-rebench",
  catalog: "llm",
  benchmarkIds: ["swe-rebench"],
  async fetchScores() {
    const html = await fetchText(process.env.SWE_REBENCH_URL || SWE_REBENCH_URL);
    const payload = flightPayload(html);
    const models = parseSweRebenchModels(payload);
    const snapshotDate = todayIsoDate();
    const scores = [];
    for (const model of models) {
      if (typeof model.modelName !== "string" || !model.modelName.trim()) {
        throw new Error(
          `swe-rebench row missing modelName: ${JSON.stringify(model).slice(0, 300)}`
        );
      }
      const from = model.taskRangeTimestamp?.from;
      const to = model.taskRangeTimestamp?.to;
      const windows = model.rangeStats?.all;
      if (!windows || typeof windows !== "object") {
        throw new Error(
          `swe-rebench row missing rangeStats.all for ${model.modelName}`
        );
      }
      const exactKey = `${from}:${to}`;
      let windowKey = exactKey;
      let rate = windows[exactKey]?.resolvedRate;
      if (!Number.isFinite(rate)) {
        const prefix = `${from}:`;
        const candidates = Object.keys(windows)
          .filter((key) => key.startsWith(prefix))
          .sort((a, b) => Number(b.slice(prefix.length)) - Number(a.slice(prefix.length)));
        windowKey = candidates[0];
        rate = windowKey ? windows[windowKey]?.resolvedRate : undefined;
      }
      if (!Number.isFinite(rate)) {
        throw new Error(
          `swe-rebench row missing resolvedRate for ${model.modelName} (${exactKey}): ${JSON.stringify({ rangeKeys: Object.keys(windows) }).slice(0, 400)}`
        );
      }
      const agent = model.agentVersion ?? "unknown";
      const sourceModelName = model.agentVersion
        ? `${model.modelName} [${model.agentVersion}]`
        : model.modelName;
      scores.push({
        benchmarkId: "swe-rebench",
        sourceModelName,
        value: roundScore(rate),
        sourceUrl: SWE_REBENCH_URL,
        evaluationDate: snapshotDate,
        protocol: `SWE-rebench official leaderboard listing '${model.modelName}', agent ${agent}, current task window resolved rate.`,
      });
    }
    return scores;
  },
};
