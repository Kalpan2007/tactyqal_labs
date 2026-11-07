import { timingSafeEqual } from "node:crypto";
import { ADMIN_COOKIE } from "./constants";

// Re-exported so request handlers have a single import for everything auth.
export { ADMIN_COOKIE };

/** Constant-time compare, so a wrong key cannot be guessed byte by byte from response timing. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function adminKey(): string | undefined {
  const key = process.env.ADMIN_API_KEY;
  return key && key.length > 0 ? key : undefined;
}

export function isValidAdminKey(candidate: string | undefined | null): boolean {
  const key = adminKey();
  if (!key || !candidate) return false;
  return safeEqual(candidate, key);
}

/**
 * A write is allowed with either an `x-api-key` header (for scripts and the
 * API docs) or the admin session cookie (for the browser UI).
 */
export function isAuthorised(request: Request): boolean {
  const header = request.headers.get("x-api-key");
  if (isValidAdminKey(header)) return true;

  const bearer = request.headers.get("authorization");
  if (bearer?.startsWith("Bearer ") && isValidAdminKey(bearer.slice(7))) return true;

  const cookie = request.headers.get("cookie");
  if (!cookie) return false;
  const match = cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${ADMIN_COOKIE}=`));
  if (!match) return false;
  return isValidAdminKey(decodeURIComponent(match.slice(ADMIN_COOKIE.length + 1)));
}
