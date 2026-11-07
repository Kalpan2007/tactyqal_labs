import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthorised } from "@/lib/api/auth";
import { created, fail, handleError, ok, readJson } from "@/lib/api/http";
import { createLeadSchema } from "@/lib/validation/lead";

export const dynamic = "force-dynamic";

/**
 * POST /api/leads — the homepage consultation form.
 * Public by design, so it is rate limited per IP.
 */
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // crude ceiling; a real deployment would use Redis
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (rateLimited(ip)) {
      return fail(429, "RATE_LIMITED", "Too many requests. Please try again later.");
    }

    const parsed = createLeadSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return fail(422, "VALIDATION_FAILED", "Please check the form and try again.", parsed.error.issues);
    }

    const lead = await prisma.lead.create({
      data: { ...parsed.data, idea: parsed.data.idea ?? null },
      select: { id: true, createdAt: true },
    });
    // Only the id goes back: the client never needs the stored personal data echoed.
    return created({ id: lead.id, message: "Thanks. A mentor will be in touch within 24 hours." });
  } catch (err) {
    if (err instanceof SyntaxError) return fail(400, "INVALID_JSON", "The request body must be valid JSON.");
    return handleError(err);
  }
}

/** GET /api/leads — admin only. */
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorised(request)) return fail(401, "UNAUTHORISED", "A valid admin key is required.");
    const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    return ok({ data: leads });
  } catch (err) {
    return handleError(err);
  }
}
