import Link from "next/link";
import type { Model } from "@/data/types";
import { compareSlug, getModel, popularComparePairs } from "@/lib/models";

export function ModelPeers({
  model,
  related,
}: {
  model: Model;
  related: Model[];
}) {
  const seen = new Set<string>([model.slug]);
  const peers: Model[] = [];

  for (const [a, b] of popularComparePairs()) {
    const other = a === model.slug ? b : b === model.slug ? a : null;
    if (!other || seen.has(other)) continue;
    const peer = getModel(other);
    if (!peer) continue;
    seen.add(other);
    peers.push(peer);
  }

  for (const rel of related) {
    if (seen.has(rel.slug)) continue;
    seen.add(rel.slug);
    peers.push(rel);
  }

  const shown = peers.slice(0, 8);
  if (shown.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {shown.map((peer) => (
        <li key={peer.slug}>
          <Link
            href={`/compare/${compareSlug(model.slug, peer.slug)}`}
            className="inline-flex items-center border border-border px-2 py-1 font-mono text-xs text-muted-foreground hover:border-foreground/40 hover:text-foreground"
          >
            vs {peer.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
