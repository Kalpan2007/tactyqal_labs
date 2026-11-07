import Link from "next/link";
import { Logo } from "./Logo";

/**
 * Header for the inner pages. The homepage keeps its own scroll-aware header;
 * this one is static because there are no sections to track.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-rule-dark bg-night/90 text-snow backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-night"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-10">
        <Link href="/" aria-label="Tactyqal Labs home">
          <Logo light />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-2 sm:gap-5">
          <Link href="/blog" className="hidden text-[13px] text-mute-dark transition-colors hover:text-snow sm:block">
            Blog
          </Link>
          <Link
            href="/#programme"
            className="hidden text-[13px] text-mute-dark transition-colors hover:text-snow sm:block"
          >
            Programme
          </Link>
          <Link
            href="/#contact"
            className="rounded-full bg-gold px-5 py-2.5 text-[13px] font-medium text-night transition-colors hover:bg-snow"
          >
            Book a free call
          </Link>
        </nav>
      </div>
    </header>
  );
}
