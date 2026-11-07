import type { NextRequest } from "next/server";
import { openApiDocument } from "@/lib/openapi";

export const dynamic = "force-dynamic";

/** GET /api/openapi.json — the machine-readable contract. */
export async function GET(request: NextRequest) {
  return Response.json(openApiDocument(request.nextUrl.origin), {
    headers: { "cache-control": "public, max-age=300" },
  });
}
