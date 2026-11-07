import { cookies } from "next/headers";
import { z } from "zod";
import { ADMIN_COOKIE, isValidAdminKey } from "@/lib/api/auth";
import { fail, handleError, ok, readJson } from "@/lib/api/http";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ key: z.string().min(1) });

/**
 * Exchanges the admin key for an httpOnly cookie, so the browser UI never has
 * to keep the key in JavaScript where a script could read it.
 */
export async function POST(request: Request) {
  try {
    const parsed = bodySchema.safeParse(await readJson(request));
    if (!parsed.success) return fail(400, "INVALID_BODY", "A key is required.");

    if (!isValidAdminKey(parsed.data.key)) {
      return fail(401, "UNAUTHORISED", "That key is not valid.");
    }

    const store = await cookies();
    store.set(ADMIN_COOKIE, parsed.data.key, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return ok({ ok: true });
  } catch (err) {
    if (err instanceof SyntaxError) return fail(400, "INVALID_JSON", "The request body must be valid JSON.");
    return handleError(err);
  }
}

/** Signs out. */
export async function DELETE() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  return ok({ ok: true });
}
