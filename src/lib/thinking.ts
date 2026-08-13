import type { BenchmarkId, Model, ResolvedThinking, ThinkingLevel } from "@/data/types";
import {
  BENCHMARKS_BY_THINKING_LEVEL,
  BENCHMARK_THINKING_LEVELS,
  MODEL_THINKING,
  THINKING_FAMILIES,
} from "@/data/thinking";

export function getModelThinking(model: Model): ResolvedThinking | undefined {
  const assignment = MODEL_THINKING[model.slug];
  if (!assignment) return undefined;
  const family = THINKING_FAMILIES[assignment.familyId];
  if (!family) return undefined;
  const allowed = new Set(assignment.levelIds);
  const levels = family.levels.filter((level) => allowed.has(level.id));
  if (levels.length === 0) return undefined;
  return {
    familyId: family.id,
    param: family.param,
    sourceUrl: family.sourceUrl,
    levels,
    highestLevel: levels[levels.length - 1].id,
  };
}

export function thinkingLevelLabel(
  thinking: ResolvedThinking,
  levelId: string
): string {
  return thinking.levels.find((level) => level.id === levelId)?.label ?? levelId;
}

export function getRecordedThinkingLevel(
  model: Model,
  id: BenchmarkId
): string | undefined {
  return BENCHMARK_THINKING_LEVELS[model.slug]?.[id];
}

export function getScoreAtThinkingLevel(
  model: Model,
  id: BenchmarkId,
  levelId: string
): {
  score: number | undefined;
  recordedLevel: string | undefined;
  matched: boolean;
} {
  const recordedLevel = getRecordedThinkingLevel(model, id);
  const overlay = BENCHMARKS_BY_THINKING_LEVEL[model.slug]?.[levelId]?.[id];
  if (overlay !== undefined) {
    return { score: overlay, recordedLevel: levelId, matched: true };
  }
  const catalog = model.benchmarks[id];
  if (catalog === undefined) {
    return { score: undefined, recordedLevel, matched: false };
  }
  if (recordedLevel === levelId) {
    return { score: catalog, recordedLevel, matched: true };
  }
  if (recordedLevel === undefined) {
    const thinking = getModelThinking(model);
    return {
      score: catalog,
      recordedLevel,
      matched: thinking?.highestLevel === levelId,
    };
  }
  return { score: catalog, recordedLevel, matched: false };
}

export function benchmarkHasThinkingLevel(
  model: Model,
  id: BenchmarkId,
  levelId: string
): boolean {
  if (model.benchmarks[id] === undefined) return false;
  if (BENCHMARKS_BY_THINKING_LEVEL[model.slug]?.[levelId]?.[id] !== undefined) {
    return true;
  }
  return getRecordedThinkingLevel(model, id) === levelId;
}

export function availableThinkingLevels(
  model: Model,
  thinking: ResolvedThinking
): Set<string> {
  const available = new Set<string>([thinking.highestLevel]);
  for (const id of Object.keys(model.benchmarks) as BenchmarkId[]) {
    const recorded = getRecordedThinkingLevel(model, id);
    if (recorded) available.add(recorded);
    for (const level of thinking.levels) {
      if (benchmarkHasThinkingLevel(model, id, level.id)) {
        available.add(level.id);
      }
    }
  }
  return available;
}

export function highestThinkingLevel(thinking: ResolvedThinking): ThinkingLevel {
  return (
    thinking.levels.find((level) => level.id === thinking.highestLevel) ??
    thinking.levels[thinking.levels.length - 1]
  );
}
