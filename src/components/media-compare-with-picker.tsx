"use client";

import { useRouter } from "next/navigation";
import type { ImageModel, VideoModel } from "@/data/types";
import { ModelPicker } from "@/components/model-picker";
import {
  compareSlug,
  type MediaKind,
} from "@/lib/media-models";

export function MediaCompareWithPicker({
  kind,
  models,
  currentSlug,
}: {
  kind: MediaKind;
  models: Array<ImageModel | VideoModel>;
  currentSlug: string;
}) {
  const router = useRouter();

  return (
    <ModelPicker
      models={models}
      excludeSlug={currentSlug}
      placeholder="Compare with…"
      onChange={(slug) => {
        router.push(`/${kind}/compare/${compareSlug(currentSlug, slug)}`);
      }}
    />
  );
}
