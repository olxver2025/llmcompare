"use client";

import type { ResolvedThinking } from "@/data/types";
import { Spec } from "@/components/spec-row";
import { ModelSpeedToggle } from "@/components/model-speed-toggle";
import { useSpeedMode } from "@/components/model-speed-context";
import { blendedPrice, formatPrice, formatSpeed, workloadCost } from "@/lib/models";

export function ModelSpeedSpecRow() {
  const { activeModel } = useSpeedMode();
  return <Spec label="Speed" value={formatSpeed(activeModel)} />;
}

export function ModelSpeedPricingCard({
  thinking,
  priceRank,
  pricedCount,
}: {
  thinking?: ResolvedThinking;
  priceRank?: number;
  pricedCount: number;
}) {
  const { mode, activeModel } = useSpeedMode();
  const blend = blendedPrice(activeModel);
  const cost = workloadCost(activeModel);

  return (
    <section className="section-rule">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Pricing</h2>
        <ModelSpeedToggle />
      </div>
      {activeModel.pricing ? (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-muted-foreground">
            {activeModel.pricing.provider}, $ per 1M tokens
            {thinking
              ? ". Thinking tokens bill as output; list rates do not change by effort."
              : ""}
          </p>
          <dl>
            <Spec
              label="Input"
              value={formatPrice(activeModel.pricing.inputPer1M)}
            />
            <Spec
              label="Output"
              value={formatPrice(activeModel.pricing.outputPer1M)}
            />
            <Spec
              label="Blended"
              value={blend !== undefined ? formatPrice(blend) : "-"}
              hint="3∶1 input:output mix"
            />
            <Spec
              label="1M+250K"
              value={cost !== undefined ? formatPrice(cost) : "-"}
              hint="Illustrative chat workload"
            />
            {mode === "standard" && priceRank !== undefined ? (
              <Spec
                label="Catalog rank"
                value={`#${priceRank} of ${pricedCount}`}
                hint="Lower blended price ranks higher"
              />
            ) : null}
          </dl>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          No primary-provider API pricing in this dataset.
        </p>
      )}
    </section>
  );
}
