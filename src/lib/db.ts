import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * One Prisma client per process. Next.js re-evaluates modules on every hot
 * reload, so in development the instance is cached on globalThis to stop the
 * dev server from opening a new connection pool on every file save.
 *
 * In production this runs against Supabase's transaction pooler (port 6543).
 * Each serverless instance keeps its own small pool, so `max` is deliberately
 * low: many instances multiplied by a large pool is how a project runs out of
 * Postgres connections. node-postgres uses unnamed prepared statements, which
 * is what makes it safe behind a transaction-mode pooler in the first place.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Supabase's poolers sit behind TLS, so `sslmode=require` in the URL is enough. */
function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill in your Supabase connection string.");
  }

  const pooled = connectionString.includes("pooler.supabase.com");

  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      // A pooler is already multiplexing for us, so hold very few sockets.
      max: pooled ? 1 : 10,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
