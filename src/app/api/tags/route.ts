import { prisma } from "@/lib/db";
import { handleError, ok } from "@/lib/api/http";

export const dynamic = "force-dynamic";

/** GET /api/tags — tags that have at least one published post, most used first. */
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { posts: { where: { status: "PUBLISHED" } } } },
      },
    });
    return ok({
      data: tags
        .map(({ _count, ...t }) => ({ ...t, postCount: _count.posts }))
        .filter((t) => t.postCount > 0)
        .sort((a, b) => b.postCount - a.postCount || a.name.localeCompare(b.name)),
    });
  } catch (err) {
    return handleError(err);
  }
}
