import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/db";
import { listPosts } from "@/lib/posts";
import { listPostsQuerySchema } from "@/lib/validation/post";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Contact";
import { PostCard } from "@/components/blog/PostCard";

export const metadata: Metadata = {
  title: "Blog | Tactyqal Labs",
  description:
    "Practical startup writing for young founders: finding an idea, validating it, building the product and launching it.",
  alternates: { canonical: "/blog" },
};

const PER_PAGE = 9;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function BlogIndex({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const parsed = listPostsQuerySchema.safeParse({ ...raw, limit: PER_PAGE, status: "PUBLISHED" });
  const query = parsed.success
    ? parsed.data
    : listPostsQuerySchema.parse({ limit: PER_PAGE, status: "PUBLISHED" });

  const [{ data: posts, meta }, categories] = await Promise.all([
    listPosts(query),
    prisma.category.findMany({
      where: { posts: { some: { status: "PUBLISHED" } } },
      orderBy: { name: "asc" },
      select: { name: true, slug: true, _count: { select: { posts: { where: { status: "PUBLISHED" } } } } },
    }),
  ]);

  /** Builds a link that keeps the current filters and changes one of them. */
  const q = (key: string, value: string | number | undefined) => {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.category) params.set("category", query.category);
    if (query.tag) params.set("tag", query.tag);
    if (value === undefined || value === "") params.delete(key);
    else params.set(key, String(value));
    if (key !== "page") params.delete("page");
    const s = params.toString();
    return s ? `/blog?${s}` : "/blog";
  };

  const filtered = Boolean(query.search || query.category || query.tag);

  return (
    <>
      <SiteHeader />
      <main id="main">
        <section data-theme="dark" className="bg-night pt-16 pb-14 text-snow sm:pt-24 sm:pb-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-10">
            <p className="flex items-center gap-3 text-sm text-mute-dark">
              <span className="h-px w-8 bg-gold" aria-hidden="true" />
              Resources / Blog
            </p>
            <h1 className="display mt-6 text-5xl sm:text-7xl lg:text-8xl">Learn for free</h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-mute-dark">
              {meta.total} articles on finding an idea, validating it, building the product and getting it in front of
              real users.
            </p>

            <form action="/blog" method="get" role="search" className="mt-10 flex max-w-lg items-center gap-3">
              <label htmlFor="blog-search" className="sr-only">
                Search articles
              </label>
              <div className="flex flex-1 items-center gap-3 border-b border-rule-dark focus-within:border-gold">
                <Search size={18} className="shrink-0 text-mute-dark" aria-hidden="true" />
                <input
                  id="blog-search"
                  type="search"
                  name="search"
                  defaultValue={query.search ?? ""}
                  placeholder="Search articles"
                  className="w-full bg-transparent py-3 text-lg outline-none placeholder:text-mute-dark"
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-gold px-5 py-2.5 text-[13px] font-medium text-night transition-colors hover:bg-snow"
              >
                Search
              </button>
            </form>
          </div>
        </section>

        <section data-theme="light" className="bg-snow py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-10">
            <nav aria-label="Categories" className="flex flex-wrap gap-2">
              <Link
                href={q("category", undefined)}
                aria-current={!query.category ? "page" : undefined}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  !query.category
                    ? "border-night bg-night text-snow"
                    : "border-rule text-mute hover:border-night hover:text-night"
                }`}
              >
                All
              </Link>
              {categories.map((c) => {
                const on = query.category === c.slug;
                return (
                  <Link
                    key={c.slug}
                    href={q("category", c.slug)}
                    aria-current={on ? "page" : undefined}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                      on
                        ? "border-night bg-night text-snow"
                        : "border-rule text-mute hover:border-night hover:text-night"
                    }`}
                  >
                    {c.name}
                    <span className="ml-2 text-xs opacity-60">{c._count.posts}</span>
                  </Link>
                );
              })}
            </nav>

            {filtered && (
              <p className="mt-8 text-sm text-mute" role="status">
                {meta.total} {meta.total === 1 ? "article" : "articles"}
                {query.search ? ` matching "${query.search}"` : ""}
                {query.tag ? ` tagged "${query.tag}"` : ""}
                {" · "}
                <Link href="/blog" className="underline decoration-gold underline-offset-4">
                  Clear filters
                </Link>
              </p>
            )}

            {posts.length === 0 ? (
              <div className="mt-16 border-t border-rule pt-16 text-center">
                <p className="display text-3xl">Nothing found.</p>
                <p className="mt-4 text-mute">Try a different search, or browse every article.</p>
                <Link
                  href="/blog"
                  className="mt-8 inline-block rounded-full bg-night px-6 py-3 text-sm text-snow transition-colors hover:bg-night-2"
                >
                  All articles
                </Link>
              </div>
            ) : (
              <ul className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post, i) => (
                  <li key={post.id}>
                    <PostCard post={post} priority={i < 3} />
                  </li>
                ))}
              </ul>
            )}

            {meta.totalPages > 1 && (
              <nav
                aria-label="Pagination"
                className="mt-20 flex items-center justify-between border-t border-rule pt-8"
              >
                {meta.hasPreviousPage ? (
                  <Link href={q("page", meta.page - 1)} className="text-sm underline decoration-gold underline-offset-4">
                    &larr; Previous
                  </Link>
                ) : (
                  <span className="text-sm text-mute">&larr; Previous</span>
                )}
                <span className="text-sm text-mute">
                  Page {meta.page} of {meta.totalPages}
                </span>
                {meta.hasNextPage ? (
                  <Link href={q("page", meta.page + 1)} className="text-sm underline decoration-gold underline-offset-4">
                    Next &rarr;
                  </Link>
                ) : (
                  <span className="text-sm text-mute">Next &rarr;</span>
                )}
              </nav>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
