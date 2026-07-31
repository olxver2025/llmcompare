/** LMArena Elo gap at/below which quality is treated as close enough for value tie-breaks. */
export const QUALITY_COMPARABLE_ELO_BAND = 50;

export type OverallBasis = "quality" | "specs" | "value" | "tie";

export type SideTally = { a: number; b: number; ties: number };

/**
 * Quality-first overall lead:
 * 1) Benchmark/quality majority
 * 2) Else capability specs
 * 3) Else one-sided benchmark coverage
 * 4) Else price/speed only when quality is comparable and specs are tied
 */
export function decideOverallLead(input: {
  quality: SideTally;
  specs: SideTally;
  value: SideTally;
  sharedBenchmarkCount: number;
  coverageA: number;
  coverageB: number;
  eloA?: number;
  eloB?: number;
  eloBand?: number;
}): { lead: "a" | "b" | null; basis: OverallBasis; includeValue: boolean } {
  const {
    quality,
    specs,
    value,
    sharedBenchmarkCount,
    coverageA,
    coverageB,
    eloA,
    eloB,
    eloBand = QUALITY_COMPARABLE_ELO_BAND,
  } = input;

  const eloClose =
    eloA !== undefined &&
    eloB !== undefined &&
    Math.abs(eloA - eloB) <= eloBand;
  const qualityTied = quality.a === quality.b;
  const qualityComparable =
    sharedBenchmarkCount > 0 && (qualityTied || eloClose);

  if (quality.a !== quality.b) {
    return {
      lead: quality.a > quality.b ? "a" : "b",
      basis: "quality",
      includeValue: false,
    };
  }
  if (specs.a !== specs.b) {
    return {
      lead: specs.a > specs.b ? "a" : "b",
      basis: "specs",
      includeValue: false,
    };
  }
  if (coverageA > 0 && coverageB === 0) {
    return { lead: "a", basis: "quality", includeValue: false };
  }
  if (coverageB > 0 && coverageA === 0) {
    return { lead: "b", basis: "quality", includeValue: false };
  }
  if (
    qualityComparable &&
    qualityTied &&
    specs.a === specs.b &&
    value.a !== value.b
  ) {
    return {
      lead: value.a > value.b ? "a" : "b",
      basis: "value",
      includeValue: true,
    };
  }
  return { lead: null, basis: "tie", includeValue: false };
}
