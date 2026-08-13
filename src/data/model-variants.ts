/**
 * Fast-tier price/speed lives on the base model (`model.fast`).
 * Old fast slugs redirect to the base model page.
 */
export const FAST_SLUG_REDIRECTS: Record<string, string> = {
  "gpt-5-6-sol-fast": "gpt-5-6-sol",
  "kimi-k3-fast": "kimi-k3",
  "composer-2-5-fast": "composer-2-5",
  "composer-2-fast": "composer-2",
  "cursor-grok-4-5-fast": "cursor-grok-4-5",
};

export function baseSlugForFastSlug(slug: string): string | undefined {
  return FAST_SLUG_REDIRECTS[slug];
}
