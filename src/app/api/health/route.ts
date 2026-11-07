import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/health — used by the deploy platform and by `npm run smoke`. */
export async function GET() {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({
      status: "ok",
      database: "reachable",
      latencyMs: Date.now() - started,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      { status: "degraded", database: "unreachable", timestamp: new Date().toISOString() },
      { status: 503 },
    );
  }
}
