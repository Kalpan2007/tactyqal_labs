/**
 * One place for the absolute origin, used by metadata, the sitemap and robots.txt.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_SITE_URL, unless it points at localhost while we are
 *      deployed. A stale localhost value is easy to leave behind and would
 *      otherwise ship canonical tags and a whole sitemap pointing at a machine
 *      nobody can reach, so on Vercel it is ignored rather than trusted.
 *   2. The deployment's own URL, which Vercel provides automatically.
 *   3. localhost, for local development.
 */
function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const onVercel = Boolean(process.env.VERCEL);
  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL ?? null;

  const isLocal = (url: string) => /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(url);

  if (configured && !(onVercel && isLocal(configured))) return configured;
  if (vercelUrl) return `https://${vercelUrl}`;
  return "http://localhost:3000";
}

export const siteUrl = resolveSiteUrl().replace(/\/+$/, "");

export const siteName = "Tactyqal Labs";
export const siteDescription =
  "1:1 startup mentoring for teens. Go from a first idea to a launched full-stack app in 8 weeks, with no prior coding needed.";
