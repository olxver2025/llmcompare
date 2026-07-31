import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MediaModelDetail } from "@/components/media-model-detail";
import { getAllImageModels, getImageModel } from "@/lib/media-models";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllImageModels().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const model = getImageModel(slug);
  if (!model) return { title: "Image model not found" };
  return {
    title: model.name,
    description: model.summary,
  };
}

export default async function ImageModelPage({ params }: Props) {
  const { slug } = await params;
  const model = getImageModel(slug);
  if (!model) notFound();
  return <MediaModelDetail kind="image" model={model} />;
}