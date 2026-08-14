"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import type { Model } from "@/data/types";
import { MAX_MULTI_COMPARE } from "@/lib/multi-compare";
import { ModelPicker } from "@/components/model-picker";
import { Button } from "@/components/ui/button";

export function MultiCompareForm({
  models,
  initialSlugs,
}: {
  models: Model[];
  initialSlugs?: string[];
}) {
  const router = useRouter();
  const seed =
    initialSlugs && initialSlugs.length >= 2 ? initialSlugs : ["", ""];
  const [slugs, setSlugs] = useState<string[]>(seed);

  const filled = slugs.filter(Boolean);
  const canCompare = new Set(filled).size >= 2 && filled.length === slugs.length;

  function setAt(i: number, slug: string) {
    setSlugs((prev) => prev.map((s, idx) => (idx === i ? slug : s)));
  }

  function removeAt(i: number) {
    setSlugs((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addSlot() {
    setSlugs((prev) => [...prev, ""]);
  }

  function go() {
    if (!canCompare) return;
    router.push(`/compare/multi?m=${filled.join(",")}`);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {slugs.map((slug, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor={`model-${i}`}
                className="text-sm font-medium"
              >
                Model {i + 1}
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
        <Button size="lg" className="h-11" disabled={!canCompare} onClick={go}>
          Compare {filled.length > 0 ? filled.length : ""} models
        </Button>
      </div>
    </div>
  );
}
