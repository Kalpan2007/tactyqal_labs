import type { NextRequest } from "next/server";
import { isAuthorised } from "@/lib/api/auth";
import { created, fail, handleError, ok, readJson } from "@/lib/api/http";
import { createPost, listPosts } from "@/lib/posts";
import { createPostSchema, listPostsQuerySchema } from "@/lib/validation/post";

export const dynamic = "force-dynamic";

/**
 * GET /api/posts
 * Paginated list. Public callers only ever see published posts; an authorised
 * caller may ask for drafts with ?status=DRAFT.
 */
export async function GET(request: NextRequest) {
  try {
    const parsed = listPostsQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
    if (!parsed.success) {
      return fail(400, "INVALID_QUERY", "One or more query parameters are not valid.", parsed.error.issues);
    }

    const query = parsed.data;
    if (!isAuthorised(request)) {
      // Anonymous callers cannot widen the filter beyond published content.
      query.status = "PUBLISHED";
    } else if (!query.status) {
      query.status = undefined;
    }

    return ok(await listPosts(query));
  } catch (err) {
    return handleError(err);
  }
}

/** POST /api/posts — create a post. Requires the admin key. */
export async function POST(request: NextRequest) {
  try {
    if (!isAuthorised(request)) return fail(401, "UNAUTHORISED", "A valid admin key is required.");

    const body = await readJson(request);
    const parsed = createPostSchema.safeParse(body);
    if (!parsed.success) {
      return fail(422, "VALIDATION_FAILED", "The request body is not valid.", parsed.error.issues);
    }

    const post = await createPost(parsed.data);
    return created(post, `/api/posts/${post.slug}`);
  } catch (err) {
    if (err instanceof SyntaxError) return fail(400, "INVALID_JSON", "The request body must be valid JSON.");
    return handleError(err);
  }
}
