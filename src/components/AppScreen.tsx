import type { Project } from "@/lib/content";

/**
 * A drawn "screenshot" of a student app (no photos needed).
 * Three layouts rotate so the strip and the case viewer feel varied.
 * Swap for real screenshots with next/image when they are available.
 */
export function AppScreen({
  project,
  variant,
  className = "",
}: {
  project: Pick<Project, "name" | "category">;
  variant: number;
  className?: string;
}) {
  const v = variant % 3;
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl bg-[#e9e9e9] text-night ${className}`}
      role="img"
      aria-label={`Illustration of the ${project.name} app`}
    >
      <div className="flex items-center gap-1.5 border-b border-black/10 bg-[#f5f5f5] px-3 py-2">
        <span className="size-2 rounded-full bg-black/20" />
        <span className="size-2 rounded-full bg-black/20" />
        <span className="size-2 rounded-full bg-gold" />
        <span className="ml-3 h-4 flex-1 rounded-full bg-black/5 px-3 text-[9px] leading-4 text-black/40">
          {project.name.toLowerCase().replace(/\s+/g, "")}.app
        </span>
      </div>

      {v === 0 && (
        <div className="grid flex-1 grid-cols-[1.1fr_0.9fr] gap-3 p-4">
          <div className="flex flex-col justify-between rounded-lg bg-night p-4 text-snow">
            <span className="text-[10px] text-mute-dark">{project.category}</span>
            <span className="wide text-lg leading-tight font-light">{project.name}</span>
            <span className="h-6 w-20 rounded-full bg-gold" />
          </div>
          <div className="grid gap-3">
            <div className="rounded-lg bg-snow p-3">
              <span className="block h-2 w-2/3 rounded-full bg-black/15" />
              <span className="mt-2 block h-2 w-1/2 rounded-full bg-black/10" />
            </div>
            <div className="flex items-end gap-1.5 rounded-lg bg-snow p-3">
              {[40, 65, 50, 80, 95].map((h, i) => (
                <span key={i} className={`flex-1 rounded-sm ${i === 4 ? "bg-gold" : "bg-black/15"}`} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {v === 1 && (
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <span className="wide text-base font-light">{project.name}</span>
            <span className="h-5 w-14 rounded-full bg-night" />
          </div>
          <div className="grid flex-1 grid-cols-3 gap-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col rounded-lg bg-snow p-2">
                <span className={`flex-1 rounded-md ${i === 1 ? "bg-gold" : "bg-black/10"}`} />
                <span className="mt-2 block h-1.5 w-3/4 rounded-full bg-black/15" />
                <span className="mt-1 block h-1.5 w-1/2 rounded-full bg-black/10" />
              </div>
            ))}
          </div>
        </div>
      )}

      {v === 2 && (
        <div className="grid flex-1 grid-cols-[0.35fr_1fr] gap-3 p-4">
          <div className="space-y-2 rounded-lg bg-night p-3">
            <span className="block size-4 rounded-full bg-gold" />
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="block h-1.5 rounded-full bg-snow/20" />
            ))}
          </div>
          <div className="flex flex-col gap-2.5 rounded-lg bg-snow p-3">
            <span className="wide text-sm font-light">{project.name}</span>
            <div className="ml-auto max-w-[75%] rounded-lg rounded-br-none bg-gold px-2.5 py-1.5">
              <span className="block h-1.5 w-16 rounded-full bg-night/30" />
            </div>
            <div className="max-w-[75%] rounded-lg rounded-bl-none bg-fog px-2.5 py-1.5">
              <span className="block h-1.5 w-24 rounded-full bg-night/20" />
              <span className="mt-1 block h-1.5 w-14 rounded-full bg-night/15" />
            </div>
            <span className="mt-auto block h-6 rounded-full border border-black/10" />
          </div>
        </div>
      )}
    </div>
  );
}
