import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * One Prisma client per process. Next.js re-evaluates modules on every hot
 * reload, so in development the instance is cached on globalThis to stop the
 * dev server from opening a new connection pool on every file save.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Pool size has to suit the phase, not just the host.
 *
 * `next build` prerenders many pages at once from a single process, and each
 * page issues several queries concurrently, so a pool of one serialises the
 * whole build and times out. A request on a serverless instance is far less
 * concurrent, but still needs more than one socket: the blog list alone runs
 * its count and its page query together.
 */
function poolSize(pooled: boolean): number {
  if (process.env.NEXT_PHASE === "phase-production-build") return 10;
  return pooled ? 5 : 10;
}

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill in your Supabase connection string.");
  }

  // Supabase's poolers sit behind TLS; `sslmode=require&uselibpqcompat=true`
  // in the URL is what negotiates it.
  const pooled = connectionString.includes("pooler.supabase.com");

  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      max: poolSize(pooled),
      idleTimeoutMillis: 10_000,
      // Generous, because the database may be a long way from the region the
      // build or the function runs in.
      connectionTimeoutMillis: 30_000,
    }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
