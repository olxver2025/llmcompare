import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { MediaCompareView } from "@/components/media-compare-page";
import {
  compareSlug,
  generateMediaVerdict,
  getImageModel,
  mediaCompareBreakdown,
  parseCompareSlug,
  popularImageComparePairs,
} from "@/lib/media-models";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = true;

export function generateStaticParams() {
  return popularImageComparePairs().map(([a, b]) => ({
    slug: compareSlug(a, b),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseCompareSlug(slug);
  if (!parsed) return { title: "Compare image models" };
  const a = getImageModel(parsed.a);
  const b = getImageModel(parsed.b);
  if (!a || !b) return { title: "Compare image models" };
  return {
    title: `${a.name} vs ${b.name}`,
    description: generateMediaVerdict("image", a, b),
  };
}

export default async function ImageComparePage({ params }: Props) {
  const { slug } = await params;
  const parsed = parseCompareSlug(slug);
  if (!parsed) notFound();

  const canonical = compareSlug(parsed.a, parsed.b);
  if (slug !== canonical) {
    permanentRedirect(`/image/compare/${canonical}`);
  }

  const a = getImageModel(parsed.a);
  const b = getImageModel(parsed.b);
  if (!a || !b) notFound();

  const breakdown = mediaCompareBreakdown("image", a, b);
  const verdict = generateMediaVerdict("image", a, b);

  return (
    <MediaCompareView
      kind="image"
      a={a}
      b={b}
      breakdown={breakdown}
      verdict={verdict}
    />
  );
}
