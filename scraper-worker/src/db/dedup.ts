function tokenize(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 0)
  );
}

function overlapRatio(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) {
    return 0;
  }
  let intersectionSize = 0;
  for (const word of a) {
    if (b.has(word)) {
      intersectionSize++;
    }
  }
  return intersectionSize / Math.min(a.size, b.size);
}

export function isDuplicateTitle(candidateTitle: string, existingTitles: string[], threshold = 0.5): boolean {
  const candidateWords = tokenize(candidateTitle);
  return existingTitles.some((existingTitle) => overlapRatio(candidateWords, tokenize(existingTitle)) >= threshold);
}
