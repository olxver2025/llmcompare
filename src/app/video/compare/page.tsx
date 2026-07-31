import type { Metadata } from "next";
import Link from "next/link";
import { MediaCompareForm } from "@/components/media-compare-form";
import { getAllVideoModels } from "@/lib/media-models";

export const metadata: Metadata = {
  title: "Compare video models",
  description:
    "Pick any two video models for a head-to-head on Arena Elo, resolution, duration, price, and speed.",
};

export default function VideoComparePickerPage() {
  const models = getAllVideoModels();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/video" className="hover:text-foreground hover:underline">
          Video models
        </Link>
        <span className="mx-2 text-border">/</span>
        <span className="text-foreground">Compare</span>
      </nav>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Compare two video models
        </h1>
        <p className="mt-3 text-muted-foreground text-pretty">
          Same-type pairs only — video vs video. Pair URLs use alphabetical
          slug order so each matchup has one canonical link.
        </p>
      </div>
      <div className="section-rule">
        <MediaCompareForm kind="video" models={models} />
      </div>
    </div>
  );
}
