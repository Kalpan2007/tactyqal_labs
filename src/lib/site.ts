/** One place for the absolute origin, used by metadata, the sitemap and robots.txt. */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) ??
  "http://localhost:3000"
).replace(/\/$/, "");

export const siteName = "Tactyqal Labs";
export const siteDescription =
  "1:1 startup mentoring for teens. Go from a first idea to a launched full-stack app in 8 weeks, with no prior coding needed.";
