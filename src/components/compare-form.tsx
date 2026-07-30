"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Model } from "@/data/types";
import { compareSlug } from "@/lib/models";
import { ModelPicker } from "@/components/model-picker";
import { Button } from "@/components/ui/button";

export function CompareForm({
  models,
  initialA,
  initialB,
}: {
  models: Model[];
  initialA?: string;
  initialB?: string;
}) {
  const router = useRouter();
  const [a, setA] = useState(initialA ?? "");
  const [b, setB] = useState(initialB ?? "");

  function go() {
    if (!a || !b || a === b) return;
    router.push(`/compare/${compareSlug(a, b)}`);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr_auto] sm:items-end">
      <div className="space-y-2">
        <label htmlFor="model-a" className="text-sm font-medium">
          Model A
        </label>
        <ModelPicker
          id="model-a"
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
        <label htmlFor="model-b" className="text-sm font-medium">
          Model B
        </label>
        <ModelPicker
          id="model-b"
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
