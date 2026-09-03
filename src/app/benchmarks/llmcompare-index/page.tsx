import type { Metadata } from "next";
import Link from "next/link";
import { BENCHMARKS } from "@/data/benchmarks";
import { CompositeDetailView } from "@/components/composite-detail-view";
import { Spec } from "@/components/spec-row";
import {
  COMPOSITE_PEER_MONTHS,
  compositePeerCutoff,
  compositePseudocount,
  getIndexBatteryIds,
  getLlmcompareIndex,
  LLMCOMPARE_INDEX,
  LLMCOMPARE_INDEX_BENCHMARK_TOTAL,
  MIN_COMPOSITE_BENCHMARKS,
} from "@/lib/benchmark-composite";
import { DATA_FRESHNESS, getAllModels } from "@/lib/models";

export const metadata: Metadata = {
  title: LLMCOMPARE_INDEX.name,
  description:
    "A site-computed composite z-scored against models from the past year. A shrunken mean so new frontier models are not treated as average on every unpublished bench, while thin brochure sets still cannot dominate.",
};

export default function LlmcompareIndexPage() {
  const rows = getLlmcompareIndex();
  const catalogCount = getAllModels().length;
  const k = compositePseudocount(LLMCOMPARE_INDEX_BENCHMARK_TOTAL);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link
          href="/benchmarks"
          className="hover:text-foreground hover:underline"
        >
          Benchmarks
        </Link>
        <span className="mx-2 text-border">/</span>
        <span className="text-foreground">{LLMCOMPARE_INDEX.name}</span>
      </nav>

      <header className="mb-10 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          LLMcompare only
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {LLMCOMPARE_INDEX.name}
        </h1>
        <p className="mt-3 text-muted-foreground text-pretty">
          A single derived ranking across the{" "}
          {LLMCOMPARE_INDEX_BENCHMARK_TOTAL} well-covered benchmarks in this
          catalog. This is not a published benchmark score, has no external
          leaderboard, and exists only here — it&apos;s computed from the
          sourced scores on this site.
        </p>
      </header>

      <section className="section-rule mb-12 max-w-2xl">
        <h2 className="text-lg font-semibold tracking-tight">Methodology</h2>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">
          Each eligible benchmark&apos;s scores are z-score normalized against
          models released in the past {COMPOSITE_PEER_MONTHS} months (since{" "}
          {compositePeerCutoff()}), not against the full catalog. That stops
          older models from farming the index by beating a long tail of retired
          systems on saturated exams. The index is a shrunken mean of published
          z-scores: sum(z) / (n + {k}), where {k} dummy average results pull
          incomplete coverage toward the peer mean without treating every
          missing bench as exactly average. A short brochure set still cannot
          outrank a broader evaluation. Saturated benches and benches scored
          on fewer than ten peer models are excluded. Lower-is-better benches
          are inverted so a higher index is always better.
        </p>
        <p className="mt-3 text-sm text-muted-foreground text-pretty">
          A model needs published scores on at least {MIN_COMPOSITE_BENCHMARKS}{" "}
          eligible benchmarks to receive an index at all. The benchmark count
          is shown next to every model, and every contributing score is listed
          so nothing is hidden behind the index number. The index also inherits
          each benchmark&apos;s own caveats: several are agent-system
          evaluations rather than model-only measurements.
        </p>
        <dl className="mt-4">
          <Spec
            label="Metric"
            value={`Shrunken mean z-score (k=${k})`}
            hint="sum(published z) / (n + k); k dummy average results shrink thin coverage toward 0"
          />
          <Spec label="Direction" value="Higher is better" />
          <Spec
            label="Peer set"
            value={`Models released since ${compositePeerCutoff()}`}
            hint={`${COMPOSITE_PEER_MONTHS}-month window vs catalog snapshot`}
          />
          <Spec
            label="Benchmarks included"
            value={getIndexBatteryIds()
              .map((id) => BENCHMARKS[id].shortName)
              .join(", ")}
          />
          <Spec
            label="Min. coverage"
            value={`${MIN_COMPOSITE_BENCHMARKS} of ${LLMCOMPARE_INDEX_BENCHMARK_TOTAL} benchmarks`}
          />
          <Spec
            label="Coverage"
            value={`${rows.length} / ${catalogCount}`}
            hint="Models in this catalog with enough published scores for an index"
          />
          <Spec
            label="Updated"
            value={
              <time dateTime={DATA_FRESHNESS} className="tabular-nums">
                {DATA_FRESHNESS}
              </time>
            }
            hint="Catalog snapshot date"
          />
        </dl>
      </section>

      <CompositeDetailView
        rows={rows}
        benchmarkTotal={LLMCOMPARE_INDEX_BENCHMARK_TOTAL}
        title="Index ranking"
      />

      <p className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
        <Link
          href="/benchmarks"
          className="text-open underline-offset-4 hover:underline"
        >
          Back to all benchmarks
        </Link>
      </p>
    </div>
  );
}
