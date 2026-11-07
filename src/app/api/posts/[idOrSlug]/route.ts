import type { NextRequest } from "next/server";
import { isAuthorised } from "@/lib/api/auth";
import { fail, handleError, ok, readJson } from "@/lib/api/http";
import { deletePost, findPost, updatePost } from "@/lib/posts";
import { updatePostSchema } from "@/lib/validation/post";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ idOrSlug: string }> };

/** GET /api/posts/:idOrSlug — a single post by slug or id. Drafts need the admin key. */
export async function GET(request: NextRequest, { params }: Ctx) {
  try {
    const { idOrSlug } = await params;
    const post = await findPost(idOrSlug);
    if (!post) return fail(404, "NOT_FOUND", "No post with that slug or id.");
    if (post.status !== "PUBLISHED" && !isAuthorised(request)) {
      // Do not reveal that an unpublished post exists.
      return fail(404, "NOT_FOUND", "No post with that slug or id.");
    }
    return ok(post);
  } catch (err) {
    return handleError(err);
  }
}

/** PATCH /api/posts/:idOrSlug — partial update. Requires the admin key. */
export async function PATCH(request: NextRequest, { params }: Ctx) {
  try {
    if (!isAuthorised(request)) return fail(401, "UNAUTHORISED", "A valid admin key is required.");

    const { idOrSlug } = await params;
    const existing = await findPost(idOrSlug);
    if (!existing) return fail(404, "NOT_FOUND", "No post with that slug or id.");

    const parsed = updatePostSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return fail(422, "VALIDATION_FAILED", "The request body is not valid.", parsed.error.issues);
    }

    return ok(await updatePost(existing.id, parsed.data));
  } catch (err) {
    if (err instanceof SyntaxError) return fail(400, "INVALID_JSON", "The request body must be valid JSON.");
    return handleError(err);
  }
}

/** DELETE /api/posts/:idOrSlug. Requires the admin key. */
export async function DELETE(request: NextRequest, { params }: Ctx) {
  try {
    if (!isAuthorised(request)) return fail(401, "UNAUTHORISED", "A valid admin key is required.");

    const { idOrSlug } = await params;
    const existing = await findPost(idOrSlug);
    if (!existing) return fail(404, "NOT_FOUND", "No post with that slug or id.");

    await deletePost(existing.id);
    return new Response(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
