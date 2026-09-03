"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import type { Model } from "@/data/types";
import { compareSlug } from "@/lib/models";
import { MAX_MULTI_COMPARE } from "@/lib/multi-compare";
import { ModelPicker } from "@/components/model-picker";
import { Button } from "@/components/ui/button";

export function CompareForm({
  models,
  initialA,
  initialB,
  initialSlugs,
}: {
  models: Model[];
  initialA?: string;
  initialB?: string;
  initialSlugs?: string[];
}) {
  const router = useRouter();
  const seed = (() => {
    if (initialSlugs && initialSlugs.length > 0) {
      const next = initialSlugs.slice(0, MAX_MULTI_COMPARE);
      while (next.length < 2) next.push("");
      return next;
    }
    if (initialA && initialB) return [initialA, initialB];
    return ["", ""];
  })();
  const [slugs, setSlugs] = useState<string[]>(seed);

  const filled = slugs.filter(Boolean);
  const unique = [...new Set(filled)];
  const canCompare = unique.length >= 2 && filled.length === slugs.length;

  function setAt(i: number, slug: string) {
    setSlugs((prev) => prev.map((s, idx) => (idx === i ? slug : s)));
  }

  function removeAt(i: number) {
    setSlugs((prev) => (prev.length <= 2 ? prev : prev.filter((_, idx) => idx !== i)));
  }

  function addSlot() {
    setSlugs((prev) =>
      prev.length >= MAX_MULTI_COMPARE ? prev : [...prev, ""]
    );
  }

  function go() {
    if (!canCompare) return;
    if (unique.length === 2) {
      router.push(`/compare/${compareSlug(unique[0], unique[1])}`);
      return;
    }
    router.push(`/compare/multi?m=${unique.join(",")}`);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {slugs.map((slug, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor={`model-${i}`} className="text-sm font-medium">
                Model {i + 1}
                {slugs.length === 2 ? (
                  <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {i === 0 ? "A" : "B"}
                  </span>
                ) : null}
              </label>
              {slugs.length > 2 ? (
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label={`Remove model ${i + 1}`}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
            <ModelPicker
              id={`model-${i}`}
              models={models.filter(
                (m) => m.slug === slug || !slugs.includes(m.slug)
              )}
              value={slug || undefined}
              onChange={(value) => setAt(i, value)}
              placeholder={`Choose model ${i + 1}…`}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {slugs.length < MAX_MULTI_COMPARE ? (
          <Button type="button" variant="outline" size="sm" onClick={addSlot}>
            <Plus className="mr-1 size-3.5" />
            Add model
          </Button>
        ) : null}
        <Button
          size="lg"
          className="h-11"
          disabled={!canCompare}
          onClick={go}
        >
          {unique.length > 2
            ? `Compare ${unique.length} models`
            : "Compare"}
        </Button>
      </div>
    </div>
  );
}
