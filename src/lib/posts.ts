import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { autoExcerpt, readTimeMinutes, slugify } from "@/lib/api/text";
import type { CreatePostInput, ListPostsQuery, UpdatePostInput } from "@/lib/validation/post";

/** The shape every endpoint returns, so the API surface stays identical everywhere. */
export const postSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  coverImageUrl: true,
  coverImageAlt: true,
  status: true,
  featured: true,
  readTimeMinutes: true,
  viewCount: true,
  seoTitle: true,
  seoDescription: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  author: { select: { id: true, name: true, slug: true, role: true, avatarUrl: true } },
  category: { select: { id: true, name: true, slug: true } },
  tags: { select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } },
} satisfies Prisma.PostSelect;

/** List view leaves out the article body: it is the single biggest column. */
const { content: _content, ...listSelect } = postSelect;

export type PostDto = Prisma.PostGetPayload<{ select: typeof postSelect }>;

/**
 * Finds a slug nobody is using. Appends -2, -3 … rather than a random suffix so
 * URLs stay readable and predictable.
 */
async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const root = slugify(base) || "post";
  for (let n = 1; n < 100; n++) {
    const candidate = n === 1 ? root : `${root}-${n}`;
    const clash = await prisma.post.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!clash || clash.id === ignoreId) return candidate;
  }
  return `${root}-${Date.now()}`;
}

/** Connects existing tags by slug and creates the ones that are new, in one write. */
function tagConnector(names: string[]) {
  return {
    connectOrCreate: names.map((name) => ({
      where: { slug: slugify(name) },
      create: { name: name.trim(), slug: slugify(name) },
    })),
  };
}

export function buildWhere(q: ListPostsQuery): Prisma.PostWhereInput {
  const where: Prisma.PostWhereInput = {};
  if (q.status) where.status = q.status;
  if (q.category) where.category = { slug: q.category };
  if (q.tag) where.tags = { some: { slug: q.tag } };
  if (q.featured !== undefined) where.featured = q.featured;
  if (q.search) {
    where.OR = [
      { title: { contains: q.search, mode: "insensitive" } },
      { excerpt: { contains: q.search, mode: "insensitive" } },
      { content: { contains: q.search, mode: "insensitive" } },
    ];
  }
  return where;
}

function orderFor(sort: ListPostsQuery["sort"]): Prisma.PostOrderByWithRelationInput[] {
  if (sort === "oldest") return [{ publishedAt: "asc" }, { createdAt: "asc" }];
  if (sort === "popular") return [{ viewCount: "desc" }, { publishedAt: "desc" }];
  return [{ publishedAt: "desc" }, { createdAt: "desc" }];
}

export async function listPosts(q: ListPostsQuery) {
  const where = buildWhere(q);
  // Two independent reads on separate pooled connections. A $transaction batch
  // would serialise them on one connection, which the pg driver warns about.
  const [total, items] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      select: listSelect,
      orderBy: orderFor(q.sort),
      skip: (q.page - 1) * q.limit,
      take: q.limit,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / q.limit));
  return {
    data: items,
    meta: {
      page: q.page,
      limit: q.limit,
      total,
      totalPages,
      hasNextPage: q.page < totalPages,
      hasPreviousPage: q.page > 1,
    },
  };
}

/** Accepts either a slug or an id, so clients never have to care which they hold. */
export function findPost(idOrSlug: string) {
  return prisma.post.findFirst({
    where: { OR: [{ slug: idOrSlug }, { id: idOrSlug }] },
    select: postSelect,
  });
}

export async function createPost(input: CreatePostInput): Promise<PostDto> {
  const slug = await uniqueSlug(input.slug ?? input.title);
  const publishing = input.status === "PUBLISHED";
  return prisma.post.create({
    data: {
      title: input.title,
      slug,
      excerpt: input.excerpt?.trim() || autoExcerpt(input.content),
      content: input.content,
      coverImageUrl: input.coverImageUrl ?? null,
      coverImageAlt: input.coverImageAlt ?? null,
      status: input.status,
      featured: input.featured,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      readTimeMinutes: readTimeMinutes(input.content),
      publishedAt: input.publishedAt ?? (publishing ? new Date() : null),
      author: { connect: { id: input.authorId } },
      category: input.categoryId ? { connect: { id: input.categoryId } } : undefined,
      tags: input.tags.length ? tagConnector(input.tags) : undefined,
    },
    select: postSelect,
  });
}

export async function updatePost(id: string, input: UpdatePostInput): Promise<PostDto> {
  const existing = await prisma.post.findUnique({
    where: { id },
    select: { id: true, slug: true, title: true, status: true, publishedAt: true },
  });
  if (!existing) throw new Prisma.PrismaClientKnownRequestError("Post not found", { code: "P2025", clientVersion: "7" });

  const data: Prisma.PostUpdateInput = {};

  if (input.title !== undefined) data.title = input.title;
  if (input.slug !== undefined && input.slug !== existing.slug) {
    data.slug = await uniqueSlug(input.slug, id);
  }
  if (input.content !== undefined) {
    data.content = input.content;
    data.readTimeMinutes = readTimeMinutes(input.content);
  }
  if (input.excerpt !== undefined) {
    data.excerpt = input.excerpt.trim() || autoExcerpt(input.content ?? "");
  }
  if (input.coverImageUrl !== undefined) data.coverImageUrl = input.coverImageUrl;
  if (input.coverImageAlt !== undefined) data.coverImageAlt = input.coverImageAlt;
  if (input.featured !== undefined) data.featured = input.featured;
  if (input.seoTitle !== undefined) data.seoTitle = input.seoTitle;
  if (input.seoDescription !== undefined) data.seoDescription = input.seoDescription;
  if (input.authorId !== undefined) data.author = { connect: { id: input.authorId } };
  if (input.categoryId !== undefined) {
    data.category = input.categoryId ? { connect: { id: input.categoryId } } : { disconnect: true };
  }
  if (input.tags !== undefined) {
    data.tags = { set: [], ...tagConnector(input.tags) };
  }

  if (input.status !== undefined) {
    data.status = input.status;
    // Stamp the publish date the first time a post goes live, and never overwrite it.
    if (input.status === "PUBLISHED" && !existing.publishedAt) data.publishedAt = new Date();
  }
  if (input.publishedAt !== undefined) data.publishedAt = input.publishedAt;

  return prisma.post.update({ where: { id }, data, select: postSelect });
}

export function deletePost(id: string) {
  return prisma.post.delete({ where: { id }, select: { id: true, slug: true } });
}

/** Fire-and-forget view counter: a failure here must never break a page render. */
export function recordView(id: string) {
  return prisma.post
    .update({ where: { id }, data: { viewCount: { increment: 1 } }, select: { id: true } })
    .catch(() => undefined);
}
