/** Shared label-placement helpers for price/performance-style scatter charts. */

export type LabelPoint = {
  x: number;
  y: number;
  name: string;
  slug: string;
  label: boolean;
  labelDx: number;
  labelDy: number;
};

export function shortLabel(name: string): string {
  return name
    .replace(/^Claude /, "")
    .replace(/^GPT-/, "GPT-")
    .replace(/^Gemini /, "Gem ")
    .replace(/^DeepSeek /, "DS ")
    .replace(/^Cursor /, "")
    .slice(0, 16);
}

/** Greedy non-overlapping labels in chart pixel space, ranked by y then value density. */
export function assignLabels<T extends LabelPoint>(
  pts: T[],
  plotW: number,
  plotH: number
): T[] {
  if (pts.length === 0) return pts;

  const xs = pts.map((p) => Math.log10(p.x));
  const ys = pts.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;

  const toPx = (p: T) => ({
    px: ((Math.log10(p.x) - minX) / spanX) * plotW,
    py: plotH - ((p.y - minY) / spanY) * plotH,
  });

  // Prefer high score, then value (score / log price)
  const ranked = [...pts].sort((a, b) => {
    const va = a.y / Math.log10(a.x + 1);
    const vb = b.y / Math.log10(b.x + 1);
    if (b.y !== a.y) return b.y - a.y;
    return vb - va;
  });

  const maxLabels = Math.min(8, Math.max(3, Math.floor(pts.length / 3)));
  const placed: { x: number; y: number; w: number; h: number }[] = [];
  const labeled = new Set<string>();
  const offsets = new Map<string, { dx: number; dy: number }>();

  const labelW = 78;
  const labelH = 14;
  const candidates = [
    { dx: 8, dy: -2 },
    { dx: 8, dy: 12 },
    { dx: -84, dy: -2 },
    { dx: -84, dy: 12 },
    { dx: 8, dy: -14 },
    { dx: -84, dy: -14 },
  ];

  for (const p of ranked) {
    if (labeled.size >= maxLabels) break;
    const { px, py } = toPx(p);
    let chosen: { dx: number; dy: number } | null = null;
    for (const off of candidates) {
      const box = {
        x: px + off.dx,
        y: py + off.dy - 10,
        w: labelW,
        h: labelH,
      };
      if (box.x < -20 || box.x + box.w > plotW + 40) continue;
      if (box.y < -10 || box.y + box.h > plotH + 10) continue;
      const hit = placed.some(
        (q) =>
          box.x < q.x + q.w &&
          box.x + box.w > q.x &&
          box.y < q.y + q.h &&
          box.y + box.h > q.y
      );
      if (!hit) {
        chosen = off;
        placed.push(box);
        break;
      }
    }
    if (chosen) {
      labeled.add(p.slug);
      offsets.set(p.slug, chosen);
    }
  }

  return pts.map((p) => ({
    ...p,
    label: labeled.has(p.slug),
    labelDx: offsets.get(p.slug)?.dx ?? 8,
    labelDy: offsets.get(p.slug)?.dy ?? -2,
  }));
}
