import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

/** Every published post, plus the two static pages. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // A database blip should degrade the sitemap to its static entries, not fail
  // the build. It is regenerated hourly, so the posts come back on their own.
  let posts: Array<{ slug: string; updatedAt: Date }> = [];
  try {
    posts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      select: { slug: true, updatedAt: true },
    });
  } catch (err) {
    console.warn("[sitemap] could not read posts:", err);
  }

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    ...posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
