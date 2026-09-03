"use client";

import type { ResolvedThinking } from "@/data/types";
import { Spec } from "@/components/spec-row";
import { PricingRates } from "@/components/pricing-rates";
import { ModelSpeedToggle } from "@/components/model-speed-toggle";
import { useSpeedMode } from "@/components/model-speed-context";
import { blendedPrice, formatSpeed, workloadCost } from "@/lib/models";

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
      <PricingRates
        model={activeModel}
        blend={blend}
        cost={cost}
        priceRank={mode === "standard" ? priceRank : undefined}
        pricedCount={pricedCount}
        thinking={thinking}
      />
    </section>
  );
}
