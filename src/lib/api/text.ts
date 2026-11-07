/** Turns a title into a URL-safe slug. Mirrors what WordPress produced, so old links can be kept. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/**
 * Read time in whole minutes at 200 words per minute, with markdown syntax and
 * code fences removed first so a long snippet does not inflate the estimate.
 */
export function readTimeMinutes(markdown: string): number {
  const prose = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~|-]/g, " ");
  const words = prose.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** First N characters of the prose, cut on a word boundary. Used when no excerpt is given. */
export function autoExcerpt(markdown: string, max = 180): string {
  const prose = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~`>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (prose.length <= max) return prose;
  return prose.slice(0, prose.lastIndexOf(" ", max)).trimEnd() + "…";
}
