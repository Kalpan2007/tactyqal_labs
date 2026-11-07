/**
 * Connection string for the command-line scripts.
 *
 * They prefer DIRECT_URL (Supabase port 5432) because they do thousands of
 * sequential writes: a direct session avoids the per-statement overhead and the
 * connection churn of the transaction pooler. Falls back to DATABASE_URL, which
 * is all a local Postgres needs.
 */
export function scriptDatabaseUrl(): string {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Neither DIRECT_URL nor DATABASE_URL is set. Copy .env.example to .env and fill them in.");
  }
  return url;
}
