/**
 * Reads the existing WordPress blog through its public REST API and converts
 * each post into the shape this project's Postgres schema expects.
 *
 * This is the migration path the brief asks for: nothing is retyped by hand,
 * and the script is idempotent, so it can be re-run to pick up edits.
 */
import { decode } from "he";
import TurndownService from "turndown";

export const WP_BASE = process.env.WORDPRESS_API_URL ?? "https://tactyqal.com/blog/wp-json/wp/v2";

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  emDelimiter: "*",
});

// WordPress wraps embeds and captions in markup that carries no meaning once
// the content is markdown, so those nodes are dropped rather than transcribed.
turndown.remove(["script", "style", "noscript", "iframe", "form"]);
turndown.addRule("figureCaption", {
  filter: ["figcaption"],
  replacement: () => "",
});

export type WpPost = {
  id: number;
  date_gmt: string;
  modified_gmt: string;
  slug: string;
  status: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  yoast_head_json?: { title?: string; description?: string; og_description?: string };
  _embedded?: {
    author?: Array<{ name: string; slug: string; description?: string; avatar_urls?: Record<string, string> }>;
    "wp:featuredmedia"?: Array<{ source_url?: string; alt_text?: string }>;
    "wp:term"?: Array<Array<{ taxonomy: string; name: string; slug: string; description?: string }>>;
  };
};

export type NormalisedPost = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: Date;
  updatedAt: Date;
  author: { name: string; slug: string; bio: string | null; avatarUrl: string | null };
  category: { name: string; slug: string; description: string | null } | null;
  tags: Array<{ name: string; slug: string }>;
};

function text(html: string): string {
  return decode(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

/**
 * Tags Turndown can leave behind as literal text when the source HTML is
 * malformed — an unbalanced `</p>` has nothing to close, so it survives the
 * conversion. Listed explicitly rather than stripping every `<…>`, so prose
 * like "costs <30 USD" is not mangled.
 */
const STRAY_TAGS =
  /<\/?(?:p|div|span|br|hr|strong|em|b|i|u|s|ul|ol|li|dl|dt|dd|h[1-6]|a|img|figure|figcaption|section|article|header|footer|aside|table|thead|tbody|tfoot|tr|td|th|blockquote|pre|code|small|sup|sub|center|font)\b[^>]*>/gi;

/** Converts WordPress' rendered HTML into the markdown this schema stores. */
export function htmlToMarkdown(html: string): string {
  return turndown
    .turndown(html)
    .replace(STRAY_TAGS, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalisePost(post: WpPost): NormalisedPost {
  const embedded = post._embedded ?? {};
  const wpAuthor = embedded.author?.[0];
  const media = embedded["wp:featuredmedia"]?.[0];
  const terms = (embedded["wp:term"] ?? []).flat();

  const category = terms.find((t) => t.taxonomy === "category" && t.slug !== "uncategorized");
  const tags = terms.filter((t) => t.taxonomy === "post_tag");

  const seoDescription = post.yoast_head_json?.description ?? post.yoast_head_json?.og_description ?? null;

  return {
    title: decode(post.title.rendered).trim(),
    slug: post.slug,
    excerpt: text(post.excerpt.rendered).replace(/\s*\[…\]$/, "…").slice(0, 320),
    content: htmlToMarkdown(post.content.rendered),
    coverImageUrl: media?.source_url ?? null,
    coverImageAlt: media?.alt_text ? decode(media.alt_text) : null,
    seoTitle: post.yoast_head_json?.title ? decode(post.yoast_head_json.title).slice(0, 160) : null,
    seoDescription: seoDescription ? decode(seoDescription).slice(0, 320) : null,
    publishedAt: new Date(`${post.date_gmt}Z`),
    updatedAt: new Date(`${post.modified_gmt}Z`),
    author: {
      name: wpAuthor?.name ? decode(wpAuthor.name) : "Tactyqal Labs",
      slug: wpAuthor?.slug ?? "tactyqal-labs",
      bio: wpAuthor?.description ? decode(wpAuthor.description).slice(0, 600) : null,
      avatarUrl: wpAuthor?.avatar_urls?.["96"] ?? null,
    },
    category: category
      ? {
          name: decode(category.name),
          slug: category.slug,
          description: category.description ? text(category.description).slice(0, 240) : null,
        }
      : null,
    tags: tags.map((t) => ({ name: decode(t.name), slug: t.slug })),
  };
}

/** Fetches one post by slug, for re-importing a single article. */
export async function fetchWordPressPost(slug: string): Promise<NormalisedPost | null> {
  const response = await fetch(`${WP_BASE}/posts?slug=${encodeURIComponent(slug)}&_embed=1`, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) throw new Error(`WordPress API returned ${response.status} for slug ${slug}`);
  const [post] = (await response.json()) as WpPost[];
  return post ? normalisePost(post) : null;
}

/** Yields posts page by page so memory stays flat even across 900 articles. */
export async function* fetchWordPressPosts(limit?: number, slug?: string): AsyncGenerator<NormalisedPost> {
  if (slug) {
    const one = await fetchWordPressPost(slug);
    if (one) yield one;
    return;
  }

  const perPage = 50;
  let page = 1;
  let yielded = 0;

  while (true) {
    const url = `${WP_BASE}/posts?per_page=${perPage}&page=${page}&_embed=1&orderby=date&order=desc`;
    const response = await fetch(url, { headers: { accept: "application/json" } });

    if (response.status === 400) break; // WordPress returns 400 past the last page
    if (!response.ok) throw new Error(`WordPress API returned ${response.status} for page ${page}`);

    const batch = (await response.json()) as WpPost[];
    if (batch.length === 0) break;

    for (const post of batch) {
      if (post.status !== "publish") continue;
      yield normalisePost(post);
      yielded += 1;
      if (limit && yielded >= limit) return;
    }

    const totalPages = Number(response.headers.get("x-wp-totalpages") ?? "1");
    if (page >= totalPages) break;
    page += 1;
  }
}
