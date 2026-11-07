import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 keeps the connection string out of the schema file.
 *
 * Migrations run over DIRECT_URL (Supabase port 5432). They need a real
 * session, which Supabase's transaction pooler on 6543 cannot provide — it
 * hands out a different backend per statement. The application itself uses the
 * pooled DATABASE_URL instead; see src/lib/db.ts.
 *
 * DIRECT_URL falls back to DATABASE_URL so a plain local Postgres, where the
 * two are the same, needs only one variable.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
