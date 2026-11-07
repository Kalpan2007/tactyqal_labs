import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatDate, formatReadTime } from "@/lib/format";

export type PostCardData = {
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  readTimeMinutes: number;
  publishedAt: Date | null;
  createdAt: Date;
  category: { name: string; slug: string } | null;
};

export function PostCard({ post, priority = false }: { post: PostCardData; priority?: boolean }) {
  const date = post.publishedAt ?? post.createdAt;
  return (
    <article className="group flex h-full flex-col">
      <Link href={`/blog/${post.slug}`} className="flex h-full flex-col rounded-xl outline-offset-4">
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-fog">
          {post.coverImageUrl ? (
            <Image
              src={post.coverImageUrl}
              alt={post.coverImageAlt ?? ""}
              fill
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
              priority={priority}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="grid h-full place-items-center text-mute" aria-hidden="true">
              <span className="display text-5xl opacity-30">T</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col pt-5">
          <p className="flex items-center gap-3 text-xs text-mute">
            {post.category && <span className="text-gold">{post.category.name}</span>}
            <span>{formatDate(date)}</span>
            <span aria-hidden="true">·</span>
            <span>{formatReadTime(post.readTimeMinutes)}</span>
          </p>
          <h3 className="wide mt-3 text-xl leading-snug font-light group-hover:underline group-hover:decoration-gold group-hover:underline-offset-4">
            {post.title}
          </h3>
          <p className="mt-3 line-clamp-3 leading-relaxed text-mute">{post.excerpt}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm" aria-hidden="true">
            Read
            <ArrowUpRight size={15} className="text-gold transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
    </article>
  );
}
