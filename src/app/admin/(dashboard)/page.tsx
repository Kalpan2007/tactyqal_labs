import Link from "next/link";
import { Plus } from "lucide-react";
import { listPosts } from "@/lib/posts";
import { listPostsQuerySchema } from "@/lib/validation/post";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { DeletePostButton } from "@/components/admin/DeletePostButton";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

const statusStyles: Record<string, string> = {
  PUBLISHED: "bg-night text-snow",
  DRAFT: "bg-gold text-night",
  ARCHIVED: "border border-rule text-mute",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminPosts({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const parsed = listPostsQuerySchema.safeParse({ ...raw, limit: PER_PAGE });
  const query = parsed.success ? parsed.data : listPostsQuerySchema.parse({ limit: PER_PAGE });

  const [{ data: posts, meta }, counts] = await Promise.all([
    listPosts(query),
    prisma.post.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countFor = (s: string) => counts.find((c) => c.status === s)?._count._all ?? 0;
  const total = counts.reduce((n, c) => n + c._count._all, 0);

  const filterHref = (status?: string) => {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (status) params.set("status", status);
    const s = params.toString();
    return s ? `/admin?${s}` : "/admin";
  };

  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.status) params.set("status", query.status);
    params.set("page", String(page));
    return `/admin?${params.toString()}`;
  };

  const tabs = [
    { label: "All", value: undefined, count: total },
    { label: "Published", value: "PUBLISHED", count: countFor("PUBLISHED") },
    { label: "Drafts", value: "DRAFT", count: countFor("DRAFT") },
    { label: "Archived", value: "ARCHIVED", count: countFor("ARCHIVED") },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="display text-4xl">Posts</h1>
          <p className="mt-2 text-sm text-mute">{total} in the database</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 rounded-full bg-night px-5 py-3 text-sm text-snow transition-colors hover:bg-night-2"
        >
          <Plus size={16} aria-hidden="true" />
          New post
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
          {tabs.map((t) => {
            const on = query.status === t.value;
            return (
              <Link
                key={t.label}
                href={filterHref(t.value)}
                aria-current={on ? "page" : undefined}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  on ? "border-night bg-night text-snow" : "border-rule bg-snow text-mute hover:border-night hover:text-night"
                }`}
              >
                {t.label} <span className="ml-1 text-xs opacity-60">{t.count}</span>
              </Link>
            );
          })}
        </nav>

        <form action="/admin" method="get" role="search" className="ml-auto flex items-center gap-2">
          {query.status && <input type="hidden" name="status" value={query.status} />}
          <label htmlFor="admin-search" className="sr-only">
            Search posts
          </label>
          <input
            id="admin-search"
            type="search"
            name="search"
            defaultValue={query.search ?? ""}
            placeholder="Search posts"
            className="rounded-full border border-rule bg-snow px-4 py-2 text-sm outline-none focus:border-night"
          />
          <button type="submit" className="rounded-full border border-rule bg-snow px-4 py-2 text-sm hover:border-night">
            Search
          </button>
        </form>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-rule bg-snow">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Blog posts, newest first</caption>
          <thead className="border-b border-rule text-xs text-mute">
            <tr>
              <th scope="col" className="px-5 py-3 font-medium">Title</th>
              <th scope="col" className="hidden px-5 py-3 font-medium md:table-cell">Category</th>
              <th scope="col" className="hidden px-5 py-3 font-medium sm:table-cell">Status</th>
              <th scope="col" className="hidden px-5 py-3 font-medium lg:table-cell">Published</th>
              <th scope="col" className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-mute">
                  No posts match that filter.
                </td>
              </tr>
            )}
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-rule last:border-0 hover:bg-fog">
                <td className="px-5 py-4">
                  <Link href={`/admin/posts/${post.id}`} className="font-medium hover:underline">
                    {post.title}
                  </Link>
                  <span className="mt-1 block text-xs text-mute">/{post.slug}</span>
                </td>
                <td className="hidden px-5 py-4 text-mute md:table-cell">{post.category?.name ?? "—"}</td>
                <td className="hidden px-5 py-4 sm:table-cell">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs ${statusStyles[post.status]}`}>
                    {post.status.toLowerCase()}
                  </span>
                </td>
                <td className="hidden px-5 py-4 text-mute lg:table-cell">
                  {post.publishedAt ? formatDate(post.publishedAt) : "—"}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-3">
                    {post.status === "PUBLISHED" && (
                      <Link href={`/blog/${post.slug}`} className="text-xs underline decoration-gold underline-offset-4">
                        View
                      </Link>
                    )}
                    <Link href={`/admin/posts/${post.id}`} className="text-xs underline decoration-gold underline-offset-4">
                      Edit
                    </Link>
                    <DeletePostButton id={post.id} title={post.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta.totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-8 flex items-center justify-between">
          {meta.hasPreviousPage ? (
            <Link href={pageHref(meta.page - 1)} className="text-sm underline decoration-gold underline-offset-4">
              &larr; Previous
            </Link>
          ) : (
            <span className="text-sm text-mute">&larr; Previous</span>
          )}
          <span className="text-sm text-mute">
            Page {meta.page} of {meta.totalPages}
          </span>
          {meta.hasNextPage ? (
            <Link href={pageHref(meta.page + 1)} className="text-sm underline decoration-gold underline-offset-4">
              Next &rarr;
            </Link>
          ) : (
            <span className="text-sm text-mute">Next &rarr;</span>
          )}
        </nav>
      )}
    </>
  );
}
