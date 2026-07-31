"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ImageModel, VideoModel } from "@/data/types";
import { ModelPicker } from "@/components/model-picker";
import { Button } from "@/components/ui/button";
import { compareSlug, type MediaKind } from "@/lib/media-models";

export function MediaCompareForm({
  kind,
  models,
  initialA,
  initialB,
}: {
  kind: MediaKind;
  models: Array<ImageModel | VideoModel>;
  initialA?: string;
  initialB?: string;
}) {
  const router = useRouter();
  const [a, setA] = useState(initialA ?? "");
  const [b, setB] = useState(initialB ?? "");

  function go() {
    if (!a || !b || a === b) return;
    router.push(`/${kind}/compare/${compareSlug(a, b)}`);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr_auto] sm:items-end">
      <div className="space-y-2">
        <label htmlFor={`${kind}-model-a`} className="text-sm font-medium">
          Model A
        </label>
        <ModelPicker
          id={`${kind}-model-a`}
          models={models}
          value={a || undefined}
          onChange={setA}
          excludeSlug={b || undefined}
          placeholder="Choose first model…"
        />
      </div>
      <div className="hidden pb-2 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground sm:block">
        vs
      </div>
      <div className="space-y-2">
        <label htmlFor={`${kind}-model-b`} className="text-sm font-medium">
          Model B
        </label>
        <ModelPicker
          id={`${kind}-model-b`}
          models={models}
          value={b || undefined}
          onChange={setB}
          excludeSlug={a || undefined}
          placeholder="Choose second model…"
        />
      </div>
      <Button
        size="lg"
        className="h-11"
        disabled={!a || !b || a === b}
        onClick={go}
      >
        Compare
      </Button>
    </div>
  );
}
