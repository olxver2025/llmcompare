"use client";

import { useRouter } from "next/navigation";
import type { Model } from "@/data/types";
import { compareSlug } from "@/lib/models";
import { ModelPicker } from "@/components/model-picker";

export function CompareSwitch({
  models,
  a,
  b,
}: {
  models: Model[];
  a: string;
  b: string;
}) {
  const router = useRouter();

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1.5">
        <label htmlFor="compare-switch-a" className="text-sm font-medium">
          Replace A
        </label>
        <ModelPicker
          id="compare-switch-a"
          models={models}
          value={a}
          excludeSlug={b}
          onChange={(slug) => router.push(`/compare/${compareSlug(slug, b)}`)}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="compare-switch-b" className="text-sm font-medium">
          Replace B
        </label>
        <ModelPicker
          id="compare-switch-b"
          models={models}
          value={b}
          excludeSlug={a}
          onChange={(slug) => router.push(`/compare/${compareSlug(a, slug)}`)}
        />
      </div>
    </div>
  );
}
