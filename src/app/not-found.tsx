import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-night px-5 text-snow">
      <div className="text-center">
        <div className="flex justify-center">
          <Logo light />
        </div>
        <p className="display mt-12 text-7xl sm:text-8xl">404</p>
        <h1 className="wide mt-4 text-xl font-light">That page does not exist.</h1>
        <p className="mx-auto mt-4 max-w-sm leading-relaxed text-mute-dark">
          It may have moved during the move off WordPress. Try the blog, or head back to the homepage.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-gold px-6 py-3 text-sm font-medium text-night transition-colors hover:bg-snow"
          >
            Homepage
          </Link>
          <Link
            href="/blog"
            className="rounded-full border border-rule-dark px-6 py-3 text-sm transition-colors hover:border-snow"
          >
            Read the blog
          </Link>
        </div>
      </div>
    </main>
  );
}
