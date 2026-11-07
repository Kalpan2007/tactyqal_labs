export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path d="M14 2 H38 L26 18 H2 Z" fill="#dcbf6c" />
      <path d="M2 22 H26 C26 32 20 38 10 38 H2 Z" fill="#dcbf6c" opacity="0.75" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark className="size-6" />
      <span className={`wide text-lg font-medium tracking-tight whitespace-nowrap ${light ? "text-snow" : "text-night"}`}>
        Tactyqal Labs
      </span>
    </span>
  );
}
