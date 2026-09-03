/**
 * One dummy "peer-average" observation is added per this many battery benches.
 * The composite is sum(z) / (n_published + k) rather than sum(z) / batterySize.
 */
export const COMPOSITE_PSEUDOCOUNT_RATE = 4;

export function compositePseudocount(batterySize: number): number {
  if (batterySize <= 0) return 1;
  return Math.max(1, Math.round(batterySize / COMPOSITE_PSEUDOCOUNT_RATE));
}

/** Shrunken mean of published z-scores. `publishedCount` must be > 0. */
export function shrinkCompositeZ(
  publishedZSum: number,
  publishedCount: number,
  batterySize: number
): number {
  return publishedZSum / (publishedCount + compositePseudocount(batterySize));
}
