import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { findPost } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import { PostForm } from "@/components/admin/PostForm";

export const dynamic = "force-dynamic";

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, authors, categories] = await Promise.all([
    findPost(id),
    prisma.author.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!post) notFound();

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-mute">
        <Link href="/admin" className="underline decoration-rule underline-offset-4 hover:text-night">
          Posts
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Edit</span>
      </nav>

      <div className="mt-4 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-4xl">Edit post</h1>
          <p className="mt-2 text-sm text-mute">
            {post.readTimeMinutes} min read · {post.viewCount} views ·{" "}
            {post.publishedAt ? `published ${formatDate(post.publishedAt)}` : "not published"}
          </p>
        </div>
        {post.status === "PUBLISHED" && (
          <Link
            href={`/blog/${post.slug}`}
            className="rounded-full border border-rule bg-snow px-4 py-2 text-sm hover:border-night"
          >
            View on site
          </Link>
        )}
      </div>

      <PostForm
        authors={authors}
        categories={categories}
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverImageUrl: post.coverImageUrl ?? "",
          coverImageAlt: post.coverImageAlt ?? "",
          status: post.status,
          featured: post.featured,
          seoTitle: post.seoTitle ?? "",
          seoDescription: post.seoDescription ?? "",
          authorId: post.author.id,
          categoryId: post.category?.id ?? "",
          tags: post.tags.map((t) => t.name).join(", "),
        }}
      />
    </>
  );
}
