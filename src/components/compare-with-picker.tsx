"use client";

import { useRouter } from "next/navigation";
import type { Model } from "@/data/types";
import { compareSlug } from "@/lib/models";
import { ModelPicker } from "@/components/model-picker";

export function CompareWithPicker({
  models,
  currentSlug,
}: {
  models: Model[];
  currentSlug: string;
}) {
  const router = useRouter();

  return (
    <ModelPicker
      models={models}
      excludeSlug={currentSlug}
      placeholder="Compare with…"
      onChange={(slug) => {
        router.push(`/compare/${compareSlug(currentSlug, slug)}`);
      }}
    />
  );
}
