import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { findPost, recordView } from "@/lib/posts";
import { formatDate, formatReadTime, initials } from "@/lib/format";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Contact";
import { Markdown } from "@/components/blog/Markdown";
import { PostCard } from "@/components/blog/PostCard";

type Params = Promise<{ slug: string }>;

/**
 * Pre-render the 24 most recent posts at build time; the rest render on first
 * request and are then cached. Kept modest on purpose: every prerendered page
 * is database round trips during the build, and the build machine may be in a
 * different region from the database.
 *
 * If the database is unreachable during the build, fall back to rendering
 * everything on demand rather than failing the whole deploy.
 */
export async function generateStaticParams() {
  try {
    const posts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 24,
      select: { slug: true },
    });
    return posts.map(({ slug }) => ({ slug }));
  } catch (err) {
    console.warn("[build] could not prerender posts, falling back to on-demand rendering:", err);
    return [];
  }
}

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await findPost(slug);
  if (!post || post.status !== "PUBLISHED") return { title: "Article not found | Tactyqal Labs" };

  const title = post.seoTitle ?? `${post.title} | Tactyqal Labs`;
  const description = post.seoDescription ?? post.excerpt;

  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name],
      images: post.coverImageUrl ? [{ url: post.coverImageUrl, alt: post.coverImageAlt ?? post.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await findPost(slug);
  if (!post || post.status !== "PUBLISHED") notFound();

  // Not awaited: a slow counter must never hold up the page.
  void recordView(post.id);

  const related = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: post.id },
      OR: [
        post.category ? { categoryId: post.category.id } : {},
        post.tags.length ? { tags: { some: { id: { in: post.tags.map((t) => t.id) } } } } : {},
      ].filter((c) => Object.keys(c).length > 0),
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImageUrl: true,
      coverImageAlt: true,
      readTimeMinutes: true,
      publishedAt: true,
      createdAt: true,
      category: { select: { name: true, slug: true } },
    },
  });

  const published = post.publishedAt ?? post.createdAt;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription ?? post.excerpt,
    image: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    datePublished: published.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Person", name: post.author.name },
    publisher: { "@type": "Organization", name: "Tactyqal Labs" },
    mainEntityOfPage: { "@type": "WebPage", "@id": `/blog/${post.slug}` },
  };

  return (
    <>
      <SiteHeader />
      <main id="main">
        <script
          type="application/ld+json"
          // Serialised from our own database rows, not from user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <article>
          <header data-theme="dark" className="bg-night pt-12 pb-14 text-snow sm:pt-16 sm:pb-20">
            <div className="mx-auto max-w-3xl px-5 sm:px-10">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm text-mute-dark transition-colors hover:text-snow"
              >
                <ArrowLeft size={15} aria-hidden="true" />
                All articles
              </Link>

              <p className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-mute-dark">
                {post.category && (
                  <Link
                    href={`/blog?category=${post.category.slug}`}
                    className="text-gold underline-offset-4 hover:underline"
                  >
                    {post.category.name}
                  </Link>
                )}
                <span>{formatDate(published)}</span>
                <span aria-hidden="true">·</span>
                <span>{formatReadTime(post.readTimeMinutes)}</span>
              </p>

              <h1 className="display mt-5 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">{post.title}</h1>
              <p className="mt-7 text-lg leading-relaxed text-mute-dark">{post.excerpt}</p>

              <div className="mt-10 flex items-center gap-3 border-t border-rule-dark pt-6">
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-gold text-sm text-night"
                  aria-hidden="true"
                >
                  {initials(post.author.name)}
                </span>
                <span className="text-sm">
                  <span className="block font-medium">{post.author.name}</span>
                  <span className="block text-xs text-mute-dark">{post.author.role ?? "Tactyqal Labs"}</span>
                </span>
              </div>
            </div>
          </header>

          {post.coverImageUrl && (
            <div data-theme="light" className="bg-snow">
              <div className="mx-auto max-w-4xl px-5 sm:px-10">
                <div className="relative -mt-10 aspect-[16/9] overflow-hidden rounded-xl bg-fog shadow-lg">
                  <Image
                    src={post.coverImageUrl}
                    alt={post.coverImageAlt ?? ""}
                    fill
                    priority
                    sizes="(min-width: 896px) 896px, 92vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          <div data-theme="light" className="bg-snow pt-14 pb-20 sm:pt-20 sm:pb-28">
            <div className="mx-auto max-w-3xl px-5 sm:px-10">
              <Markdown>{post.content}</Markdown>

              {post.tags.length > 0 && (
                <div className="mt-16 border-t border-rule pt-8">
                  <h2 className="text-sm text-mute">Tagged</h2>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <li key={tag.id}>
                        <Link
                          href={`/blog?tag=${tag.slug}`}
                          className="inline-block rounded-full border border-rule px-4 py-2 text-sm text-mute transition-colors hover:border-night hover:bg-night hover:text-snow"
                        >
                          {tag.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </article>

        <section data-theme="dark" className="bg-night py-16 text-snow sm:py-20">
          <div className="mx-auto grid max-w-3xl gap-8 px-5 sm:px-10 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="display text-3xl sm:text-4xl">Turn what you read into something real.</h2>
              <p className="mt-4 max-w-md leading-relaxed text-mute-dark">
                Book a free consultation and talk your idea through with a mentor.
              </p>
            </div>
            <Link
              href="/#contact"
              className="justify-self-start rounded-full bg-gold px-6 py-3.5 text-[15px] font-medium text-night transition-colors hover:bg-snow md:justify-self-end"
            >
              Book a free consultation
            </Link>
          </div>
        </section>

        {related.length > 0 && (
          <section data-theme="light" className="bg-snow py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-5 sm:px-10">
              <h2 className="wide text-2xl font-light">Keep reading</h2>
              <ul className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <li key={r.id}>
                    <PostCard post={r} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
