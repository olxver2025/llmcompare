import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MediaModelDetail } from "@/components/media-model-detail";
import { getAllVideoModels, getVideoModel } from "@/lib/media-models";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllVideoModels().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const model = getVideoModel(slug);
  if (!model) return { title: "Video model not found" };
  return {
    title: model.name,
    description: model.summary,
  };
}

export default async function VideoModelPage({ params }: Props) {
  const { slug } = await params;
  const model = getVideoModel(slug);
  if (!model) notFound();
  return <MediaModelDetail kind="video" model={model} />;
}