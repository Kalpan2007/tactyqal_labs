/**
 * Seeds a fresh database.
 *
 * The content is pulled from the real WordPress blog rather than invented, so
 * the API is exercised against the data it will actually serve. If the network
 * is unavailable the seed falls back to a small built-in set.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { scriptDatabaseUrl } from "../scripts/db-url";
import { readTimeMinutes } from "../src/lib/api/text";
import { importWordPress } from "../scripts/import-wordpress";

const SEED_POST_COUNT = Number(process.env.SEED_POST_COUNT ?? 60);

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: scriptDatabaseUrl() }) });

const fallbackPosts = [
  {
    title: "The elevator pitch, with examples, for business entrepreneurs",
    slug: "elevator-pitch-with-examples-for-business-entrepreneurs",
    excerpt: "How to explain what you are building in thirty seconds, and the three mistakes that lose the room.",
  },
  {
    title: "How to build a tech startup team",
    slug: "how-to-build-a-tech-startup-team-2",
    excerpt: "Who to hire first, what to look for in a technical cofounder, and when to wait.",
  },
  {
    title: "11 reasons why startups fail at the idea stage",
    slug: "11-reasons-why-startups-fail-at-idea-stage",
    excerpt: "Most ideas die long before a line of code is written. Here is where they go wrong.",
  },
];

async function fallbackSeed() {
  const author = await prisma.author.upsert({
    where: { slug: "tactyqal-labs" },
    update: {},
    create: { slug: "tactyqal-labs", name: "Tactyqal Labs", role: "Mentor team" },
    select: { id: true },
  });
  const category = await prisma.category.upsert({
    where: { slug: "startup-advice" },
    update: {},
    create: { slug: "startup-advice", name: "Startup advice" },
    select: { id: true },
  });

  for (const [i, post] of fallbackPosts.entries()) {
    const content = `## ${post.title}\n\n${post.excerpt}\n\nThis placeholder was written because the WordPress API could not be reached while seeding. Run \`npm run db:import\` once you are online to replace it with the real article.`;
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        ...post,
        content,
        status: "PUBLISHED",
        featured: i < 3,
        readTimeMinutes: readTimeMinutes(content),
        publishedAt: new Date(Date.now() - i * 864e5),
        authorId: author.id,
        categoryId: category.id,
      },
    });
  }
  return fallbackPosts.length;
}

async function main() {
  console.log("Seeding database…");
  try {
    const counts = await importWordPress({ max: SEED_POST_COUNT, quiet: false });
    console.log(`Imported ${counts.created + counts.updated} posts from WordPress.`);
  } catch (err) {
    console.warn(`WordPress import failed (${(err as Error).message}). Falling back to built-in posts.`);
    const n = await fallbackSeed();
    console.log(`Seeded ${n} fallback posts.`);
  }

  const [posts, authors, categories, tags] = await Promise.all([
    prisma.post.count(),
    prisma.author.count(),
    prisma.category.count(),
    prisma.tag.count(),
  ]);
  console.log(`Database now holds ${posts} posts, ${authors} authors, ${categories} categories, ${tags} tags.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
