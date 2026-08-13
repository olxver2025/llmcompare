export function normalizeName(value) {
  return String(value)
    .toLowerCase()
    .replace(/\d{4}-\d{2}-\d{2}/g, "")
    .replace(/\d{8}/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

export function buildCatalogIndex(models) {
  return models.map((model) => ({
    slug: model.slug,
    name: model.name,
    normSlug: normalizeName(model.slug),
    normName: normalizeName(model.name),
  }));
}

export function exactCatalogMatch(sourceModelName, catalog) {
  const needle = normalizeName(sourceModelName);
  if (!needle) return null;
  const hits = catalog.filter(
    (entry) => entry.normSlug === needle || entry.normName === needle
  );
  if (hits.length === 1) return hits[0].slug;
  return null;
}

export function suggestSlugs(sourceModelName, catalog, limit = 3) {
  const needle = normalizeName(sourceModelName);
  return catalog
    .map((entry) => ({
      slug: entry.slug,
      distance: Math.min(
        levenshtein(needle, entry.normSlug),
        levenshtein(needle, entry.normName)
      ),
    }))
    .sort((a, b) => a.distance - b.distance || a.slug.localeCompare(b.slug))
    .slice(0, limit)
    .map((entry) => entry.slug);
}

export function resolveSourceName(sourceName, adapterName, nameMap) {
  const mapped = nameMap.sources?.[adapterName];
  if (!mapped) return null;
  const hits = Object.entries(mapped)
    .filter(([, value]) => value === sourceName)
    .map(([slug]) => slug);
  return hits.length === 1 ? hits[0] : null;
}
