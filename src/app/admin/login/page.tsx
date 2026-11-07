"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin";
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key }),
      });
      if (!response.ok) {
        setError("That key is not valid.");
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm">
      <h1 className="display text-4xl">Admin</h1>
      <p className="mt-3 text-sm text-mute-dark">
        Enter the admin key to manage posts. In development it is the{" "}
        <code className="rounded bg-night-2 px-1.5 py-0.5 text-xs">ADMIN_API_KEY</code> from your{" "}
        <code className="rounded bg-night-2 px-1.5 py-0.5 text-xs">.env</code>.
      </p>

      <label htmlFor="admin-key" className="mt-10 block text-sm text-mute-dark">
        Admin key
      </label>
      <input
        id="admin-key"
        type="password"
        required
        autoComplete="current-password"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        aria-describedby={error ? "admin-key-error" : undefined}
        aria-invalid={error ? true : undefined}
        className="mt-2 block w-full border-b border-rule-dark bg-transparent py-2 text-lg outline-none transition-colors focus:border-gold"
      />

      {error && (
        <p id="admin-key-error" role="alert" className="mt-3 text-sm text-gold">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-8 w-full rounded-full bg-gold py-3.5 text-[15px] font-medium text-night transition-colors hover:bg-snow disabled:opacity-60"
      >
        {busy ? "Checking…" : "Sign in"}
      </button>

      <Link href="/" className="mt-6 block text-center text-sm text-mute-dark hover:text-snow">
        Back to the site
      </Link>
    </form>
  );
}

export default function AdminLogin() {
  return (
    <main className="grid min-h-dvh place-items-center bg-night px-5 text-snow">
      <div className="w-full max-w-sm">
        <div className="mb-12 flex justify-center">
          <Logo light />
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
