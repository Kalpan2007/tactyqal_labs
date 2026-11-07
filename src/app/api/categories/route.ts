import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { isAuthorised } from "@/lib/api/auth";
import { created, fail, handleError, ok, readJson } from "@/lib/api/http";
import { slugify } from "@/lib/api/text";

export const dynamic = "force-dynamic";

const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80).optional(),
  description: z.string().trim().max(240).optional().nullable(),
});

/** GET /api/categories — every category with a count of its published posts. */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: { select: { posts: { where: { status: "PUBLISHED" } } } },
      },
    });
    return ok({
      data: categories.map(({ _count, ...c }) => ({ ...c, postCount: _count.posts })),
    });
  } catch (err) {
    return handleError(err);
  }
}

/** POST /api/categories. Requires the admin key. */
export async function POST(request: NextRequest) {
  try {
    if (!isAuthorised(request)) return fail(401, "UNAUTHORISED", "A valid admin key is required.");
    const parsed = createCategorySchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return fail(422, "VALIDATION_FAILED", "The request body is not valid.", parsed.error.issues);
    }
    const { name, slug, description } = parsed.data;
    const category = await prisma.category.create({
      data: { name, slug: slug ?? slugify(name), description: description ?? null },
    });
    return created(category, `/api/categories/${category.slug}`);
  } catch (err) {
    if (err instanceof SyntaxError) return fail(400, "INVALID_JSON", "The request body must be valid JSON.");
    return handleError(err);
  }
}
