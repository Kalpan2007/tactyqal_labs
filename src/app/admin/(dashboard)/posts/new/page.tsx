import Link from "next/link";
import { prisma } from "@/lib/db";
import { PostForm } from "@/components/admin/PostForm";

export const dynamic = "force-dynamic";

export default async function NewPost() {
  const [authors, categories] = await Promise.all([
    prisma.author.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-mute">
        <Link href="/admin" className="underline decoration-rule underline-offset-4 hover:text-night">
          Posts
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">New</span>
      </nav>
      <h1 className="display mt-4 mb-8 text-4xl">New post</h1>
      <PostForm authors={authors} categories={categories} />
    </>
  );
}
