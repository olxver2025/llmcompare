import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { MediaCompareView } from "@/components/media-compare-page";
import {
  compareSlug,
  generateMediaVerdict,
  getVideoModel,
  mediaCompareBreakdown,
  parseCompareSlug,
  popularVideoComparePairs,
} from "@/lib/media-models";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = true;

export function generateStaticParams() {
  return popularVideoComparePairs().map(([a, b]) => ({
    slug: compareSlug(a, b),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseCompareSlug(slug);
  if (!parsed) return { title: "Compare video models" };
  const a = getVideoModel(parsed.a);
  const b = getVideoModel(parsed.b);
  if (!a || !b) return { title: "Compare video models" };
  return {
    title: `${a.name} vs ${b.name}`,
    description: generateMediaVerdict("video", a, b),
  };
}

export default async function VideoComparePage({ params }: Props) {
  const { slug } = await params;
  const parsed = parseCompareSlug(slug);
  if (!parsed) notFound();

  const canonical = compareSlug(parsed.a, parsed.b);
  if (slug !== canonical) {
    permanentRedirect(`/video/compare/${canonical}`);
  }

  const a = getVideoModel(parsed.a);
  const b = getVideoModel(parsed.b);
  if (!a || !b) notFound();

  const breakdown = mediaCompareBreakdown("video", a, b);
  const verdict = generateMediaVerdict("video", a, b);

  return (
    <MediaCompareView
      kind="video"
      a={a}
      b={b}
      breakdown={breakdown}
      verdict={verdict}
    />
  );
}
