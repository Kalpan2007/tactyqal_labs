"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await fetch("/api/admin/session", { method: "DELETE" });
          router.replace("/admin/login");
          router.refresh();
        })
      }
      className="rounded-full border border-rule-dark px-4 py-2 text-[13px] text-mute-dark transition-colors hover:border-snow hover:text-snow disabled:opacity-60"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
