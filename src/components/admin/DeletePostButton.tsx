"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * Two-step delete. Deliberately not window.confirm: a native dialog blocks the
 * page and cannot be styled or reached by assistive tech in the same way.
 */
export function DeletePostButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="text-xs text-mute underline decoration-rule underline-offset-4 hover:text-night hover:decoration-night"
      >
        Delete<span className="sr-only"> {title}</span>
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-xs" role="group" aria-label={`Confirm deleting ${title}`}>
      {error ? (
        <span className="text-night">{error}</span>
      ) : (
        <span className="text-mute">Delete?</span>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const response = await fetch(`/api/posts/${id}`, { method: "DELETE" });
            if (!response.ok && response.status !== 204) {
              setError("Failed.");
              return;
            }
            setArmed(false);
            router.refresh();
          })
        }
        className="rounded-full bg-night px-3 py-1 text-snow disabled:opacity-60"
      >
        {pending ? "Deleting…" : "Yes"}
      </button>
      <button
        type="button"
        onClick={() => {
          setArmed(false);
          setError(null);
        }}
        className="text-mute underline decoration-rule underline-offset-4 hover:text-night"
      >
        No
      </button>
    </span>
  );
}
