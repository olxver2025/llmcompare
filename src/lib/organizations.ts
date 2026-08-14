import type { ImageModel, Model, VideoModel } from "@/data/types";
import {
  getAllImageModels,
  getAllVideoModels,
  getImageOrganizations,
  getVideoOrganizations,
} from "@/lib/media-models";
import { getAllModels, getOrganizations } from "@/lib/models";

/** Stable, readable slug for an organization name (e.g. "Zhipu AI" -> "zhipu-ai"). */
export function orgSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Union of organization names across the LLM, image, and video catalogs. */
export function getAllOrganizationNames(): string[] {
  const names = new Set([
    ...getOrganizations(),
    ...getImageOrganizations(),
    ...getVideoOrganizations(),
  ]);
  return [...names].sort((a, b) => a.localeCompare(b));
}

export function getOrganizationSlugs(): string[] {
  return getAllOrganizationNames().map(orgSlug);
}

export function findOrganizationBySlug(slug: string): string | undefined {
  return getAllOrganizationNames().find((name) => orgSlug(name) === slug);
}

export type OrganizationSummary = {
  name: string;
  slug: string;
  modelCount: number;
  openWeightModelCount: number;
  modelSlugs: string[];
  imageModelCount: number;
  videoModelCount: number;
};

export function organizationSummaries(): OrganizationSummary[] {
  const llmModels = getAllModels();
  const imageModels = getAllImageModels();
  const videoModels = getAllVideoModels();
  return getAllOrganizationNames().map((name) => {
    const models = llmModels.filter((m) => m.organization === name);
    return {
      name,
      slug: orgSlug(name),
      modelCount: models.length,
      openWeightModelCount: models.filter((m) => m.openSource).length,
      modelSlugs: models.map((m) => m.slug).sort(),
      imageModelCount: imageModels.filter((m) => m.organization === name).length,
      videoModelCount: videoModels.filter((m) => m.organization === name).length,
    };
  });
}

export type OrganizationDetail = {
  name: string;
  slug: string;
  models: Model[];
  imageModels: ImageModel[];
  videoModels: VideoModel[];
};

export function getOrganizationDetail(slug: string): OrganizationDetail | undefined {
  const name = findOrganizationBySlug(slug);
  if (!name) return undefined;
  return {
    name,
    slug,
    models: getAllModels().filter((m) => m.organization === name),
    imageModels: getAllImageModels().filter((m) => m.organization === name),
    videoModels: getAllVideoModels().filter((m) => m.organization === name),
  };
}
