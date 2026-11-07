import { prisma } from "@/lib/db";
import { handleError, ok } from "@/lib/api/http";

export const dynamic = "force-dynamic";

/** GET /api/authors — the people who write for the blog. */
export async function GET() {
  try {
    const authors = await prisma.author.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        role: true,
        bio: true,
        avatarUrl: true,
        _count: { select: { posts: { where: { status: "PUBLISHED" } } } },
      },
    });
    return ok({ data: authors.map(({ _count, ...a }) => ({ ...a, postCount: _count.posts })) });
  } catch (err) {
    return handleError(err);
  }
}
