/**
 * Imports the live WordPress blog into Postgres.
 *
 *   npm run db:import            # every published post
 *   npm run db:import -- --limit 50
 *   npm run db:import -- --slug some-post-slug
 *   npm run db:import -- --dry-run
 *
 * Safe to run repeatedly: posts are matched on slug and updated in place.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { scriptDatabaseUrl } from "./db-url";
import { readTimeMinutes } from "../src/lib/api/text";
import { fetchWordPressPosts, WP_BASE, type NormalisedPost } from "./wordpress";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}
const limit = arg("limit") ? Number(arg("limit")) : undefined;
const dryRun = process.argv.includes("--dry-run");
const onlySlug = arg("slug");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: scriptDatabaseUrl() }) });

/** Caches keep the import to one write per author/category/tag instead of one per post. */
const authorIds = new Map<string, string>();
const categoryIds = new Map<string, string>();

async function authorId(a: NormalisedPost["author"]): Promise<string> {
  const cached = authorIds.get(a.slug);
  if (cached) return cached;
  const row = await prisma.author.upsert({
    where: { slug: a.slug },
    update: { name: a.name, bio: a.bio, avatarUrl: a.avatarUrl },
    create: { slug: a.slug, name: a.name, bio: a.bio, avatarUrl: a.avatarUrl },
    select: { id: true },
  });
  authorIds.set(a.slug, row.id);
  return row.id;
}

async function categoryId(c: NonNullable<NormalisedPost["category"]>): Promise<string> {
  const cached = categoryIds.get(c.slug);
  if (cached) return cached;
  const row = await prisma.category.upsert({
    where: { slug: c.slug },
    update: { name: c.name, description: c.description },
    create: { slug: c.slug, name: c.name, description: c.description },
    select: { id: true },
  });
  categoryIds.set(c.slug, row.id);
  return row.id;
}

export async function importWordPress({ max, slug, quiet = false }: { max?: number; slug?: string; quiet?: boolean } = {}) {
  const counts = { created: 0, updated: 0, skipped: 0 };
  const log = (m: string) => !quiet && console.log(m);

  log(`Reading ${WP_BASE}${slug ? ` (slug ${slug})` : max ? ` (first ${max} posts)` : ""}…`);

  for await (const post of fetchWordPressPosts(max, slug)) {
    if (!post.content || post.content.length < 50) {
      counts.skipped += 1;
      continue;
    }
    if (dryRun) {
      log(`  would import ${post.slug} (${post.content.length} chars)`);
      counts.created += 1;
      continue;
    }

    const common = {
      title: post.title,
      excerpt: post.excerpt || post.title,
      content: post.content,
      coverImageUrl: post.coverImageUrl,
      coverImageAlt: post.coverImageAlt,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      status: "PUBLISHED" as const,
      readTimeMinutes: readTimeMinutes(post.content),
      publishedAt: post.publishedAt,
      authorId: await authorId(post.author),
      categoryId: post.category ? await categoryId(post.category) : null,
    };

    // `connectOrCreate` is valid on both paths; `set: []` clears stale tags and
    // is only meaningful on an update.
    const tagLinks = post.tags.map((t) => ({
      where: { slug: t.slug },
      create: { slug: t.slug, name: t.name },
    }));

    const existing = await prisma.post.findUnique({ where: { slug: post.slug }, select: { id: true } });
    if (existing) {
      await prisma.post.update({
        where: { id: existing.id },
        data: { ...common, tags: { set: [], connectOrCreate: tagLinks } },
      });
      counts.updated += 1;
    } else {
      await prisma.post.create({
        data: { ...common, slug: post.slug, tags: { connectOrCreate: tagLinks } },
      });
      counts.created += 1;
    }

    const done = counts.created + counts.updated;
    if (!quiet && done % 25 === 0) log(`  …${done} posts`);
  }

  // The three most recent posts carry the homepage, so mark them as featured.
  if (!dryRun && !slug) {
    const recent = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { id: true },
    });
    await prisma.post.updateMany({ data: { featured: false }, where: { featured: true } });
    await prisma.post.updateMany({ data: { featured: true }, where: { id: { in: recent.map((p) => p.id) } } });
  }

  return counts;
}

async function main() {
  const started = Date.now();
  const counts = await importWordPress({ max: limit, slug: onlySlug });
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `\nDone in ${seconds}s — ${counts.created} created, ${counts.updated} updated, ${counts.skipped} skipped.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
