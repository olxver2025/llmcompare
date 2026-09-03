import type { Model, ResolvedThinking } from "@/data/types";
import {
  formatPrice,
  formatRateWithOffPeak,
  offPeakBlendedPrice,
  offPeakWorkloadCost,
} from "@/lib/models";

export function PricingRates({
  model,
  blend,
  cost,
  priceRank,
  pricedCount,
  thinking,
}: {
  model: Model;
  blend: number | undefined;
  cost: number | undefined;
  priceRank?: number;
  pricedCount?: number;
  thinking?: ResolvedThinking;
}) {
  if (!model.pricing) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        No primary-provider API pricing in this dataset.
      </p>
    );
  }

  const offPeakBlend = offPeakBlendedPrice(model);
  const offPeakCost = offPeakWorkloadCost(model);

  const cells: {
    label: string;
    value: string;
    offPeak?: string;
    hint: string;
  }[] = [
    {
      label: "Input",
      value: formatPrice(model.pricing.inputPer1M),
      offPeak: model.pricing.offPeak
        ? formatPrice(model.pricing.offPeak.inputPer1M)
        : undefined,
      hint: "per 1M tokens",
    },
    {
      label: "Output",
      value: formatPrice(model.pricing.outputPer1M),
      offPeak: model.pricing.offPeak
        ? formatPrice(model.pricing.offPeak.outputPer1M)
        : undefined,
      hint: "per 1M tokens",
    },
    {
      label: "Blended",
      value: formatRateWithOffPeak(blend, undefined),
      offPeak: offPeakBlend !== undefined ? formatPrice(offPeakBlend) : undefined,
      hint: "3∶1 input:output",
    },
    {
      label: "1M+250K",
      value: formatRateWithOffPeak(cost, undefined),
      offPeak: offPeakCost !== undefined ? formatPrice(offPeakCost) : undefined,
      hint: "illustrative chat",
    },
  ];

  return (
    <div className="mt-3 space-y-3">
      <p className="text-sm text-muted-foreground">
        {model.pricing.provider}, $ per 1M tokens
        {model.pricing.offPeak
          ? ` (peak / off-peak${
              model.pricing.peakHours
                ? `; peak hours ${model.pricing.peakHours}`
                : ""
            })`
          : ""}
        {thinking
          ? ". Thinking tokens bill as output; list rates do not change by effort"
          : ""}
        .
      </p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {cells.map((cell) => (
          <div key={cell.label}>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {cell.label}
            </p>
            <p className="mt-0.5 font-mono text-xl tabular-nums tracking-tight">
              {cell.value}
            </p>
            <p className="text-xs text-muted-foreground">{cell.hint}</p>
            {cell.offPeak ? (
              <p className="font-mono text-xs tabular-nums text-muted-foreground">
                {cell.offPeak} off-peak
              </p>
            ) : null}
          </div>
        ))}
      </div>
      {priceRank !== undefined && pricedCount !== undefined ? (
        <p className="font-mono text-xs tabular-nums text-muted-foreground">
          Catalog rank #{priceRank} of {pricedCount} (lower blended price ranks
          higher)
        </p>
      ) : null}
    </div>
  );
}
