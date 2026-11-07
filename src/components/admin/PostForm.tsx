"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { slugify } from "@/lib/api/text";

export type Option = { id: string; name: string };

export type PostFormValues = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  coverImageAlt: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  authorId: string;
  categoryId: string;
  tags: string;
};

type FieldErrors = Record<string, string>;

const empty: PostFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  coverImageAlt: "",
  status: "DRAFT",
  featured: false,
  seoTitle: "",
  seoDescription: "",
  authorId: "",
  categoryId: "",
  tags: "",
};

const label = "block text-sm text-mute";
const input =
  "mt-2 block w-full rounded-lg border border-rule bg-snow px-3 py-2.5 text-[15px] outline-none transition-colors focus:border-night";

export function PostForm({
  initial,
  authors,
  categories,
}: {
  initial?: Partial<PostFormValues>;
  authors: Option[];
  categories: Option[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<PostFormValues>({
    ...empty,
    authorId: authors[0]?.id ?? "",
    ...initial,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isEdit = Boolean(values.id);
  const previewSlug = values.slug || slugify(values.title);
  const wordCount = useMemo(() => values.content.split(/\s+/).filter(Boolean).length, [values.content]);

  function set<K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => {
      if (!e[key as string]) return e;
      const { [key as string]: _removed, ...rest } = e;
      return rest;
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setBanner(null);
    setErrors({});

    // Only send what the API accepts; empty optional strings become null.
    const payload = {
      title: values.title,
      slug: values.slug || undefined,
      excerpt: values.excerpt || undefined,
      content: values.content,
      coverImageUrl: values.coverImageUrl || null,
      coverImageAlt: values.coverImageAlt || null,
      status: values.status,
      featured: values.featured,
      seoTitle: values.seoTitle || null,
      seoDescription: values.seoDescription || null,
      authorId: values.authorId,
      categoryId: values.categoryId || null,
      tags: values.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      const response = await fetch(isEdit ? `/api/posts/${values.id}` : "/api/posts", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const issues = body?.error?.details as Array<{ path: string[]; message: string }> | undefined;
        if (issues?.length) {
          setErrors(Object.fromEntries(issues.map((i) => [i.path[0] ?? "form", i.message])));
          setBanner("Please fix the highlighted fields.");
        } else {
          setBanner(body?.error?.message ?? "Could not save the post.");
        }
        return;
      }

      const saved = await response.json();
      router.push(`/admin/posts/${saved.id}`);
      router.refresh();
    } catch {
      setBanner("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  const err = (field: string) =>
    errors[field] ? (
      <p id={`${field}-error`} role="alert" className="mt-1.5 text-xs text-night">
        {errors[field]}
      </p>
    ) : null;

  const aria = (field: string) => ({
    "aria-invalid": errors[field] ? (true as const) : undefined,
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1.6fr_0.9fr] lg:items-start">
      {banner && (
        <p role="alert" className="rounded-lg border border-night bg-gold px-4 py-3 text-sm lg:col-span-2">
          {banner}
        </p>
      )}

      <div className="grid gap-6 rounded-xl border border-rule bg-snow p-6">
        <div>
          <label htmlFor="title" className={label}>
            Title
          </label>
          <input
            id="title"
            required
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
            className={input}
            {...aria("title")}
          />
          {err("title")}
        </div>

        <div>
          <label htmlFor="slug" className={label}>
            Slug <span className="text-mute">(leave empty to generate one)</span>
          </label>
          <input
            id="slug"
            value={values.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder={slugify(values.title) || "auto-generated"}
            className={input}
            {...aria("slug")}
          />
          <p className="mt-1.5 text-xs text-mute">/blog/{previewSlug || "…"}</p>
          {err("slug")}
        </div>

        <div>
          <label htmlFor="excerpt" className={label}>
            Excerpt <span className="text-mute">(optional, generated from the content)</span>
          </label>
          <textarea
            id="excerpt"
            rows={2}
            value={values.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            className={`${input} resize-y`}
            {...aria("excerpt")}
          />
          {err("excerpt")}
        </div>

        <div>
          <label htmlFor="content" className={label}>
            Content <span className="text-mute">(markdown · {wordCount} words)</span>
          </label>
          <textarea
            id="content"
            required
            rows={22}
            value={values.content}
            onChange={(e) => set("content", e.target.value)}
            className={`${input} resize-y font-mono text-sm leading-relaxed`}
            {...aria("content")}
          />
          {err("content")}
        </div>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-5 rounded-xl border border-rule bg-snow p-6">
          <h2 className="text-sm font-medium">Publishing</h2>

          <div>
            <label htmlFor="status" className={label}>
              Status
            </label>
            <select
              id="status"
              value={values.status}
              onChange={(e) => set("status", e.target.value as PostFormValues["status"])}
              className={input}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={values.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="size-4 accent-night"
            />
            Feature on the homepage
          </label>

          <div>
            <label htmlFor="authorId" className={label}>
              Author
            </label>
            <select
              id="authorId"
              required
              value={values.authorId}
              onChange={(e) => set("authorId", e.target.value)}
              className={input}
              {...aria("authorId")}
            >
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            {err("authorId")}
          </div>

          <div>
            <label htmlFor="categoryId" className={label}>
              Category
            </label>
            <select
              id="categoryId"
              value={values.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
              className={input}
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tags" className={label}>
              Tags <span className="text-mute">(comma separated)</span>
            </label>
            <input
              id="tags"
              value={values.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="fundraising, pitch deck"
              className={input}
            />
          </div>
        </div>

        <div className="grid gap-5 rounded-xl border border-rule bg-snow p-6">
          <h2 className="text-sm font-medium">Cover image</h2>
          <div>
            <label htmlFor="coverImageUrl" className={label}>
              Image URL
            </label>
            <input
              id="coverImageUrl"
              type="url"
              value={values.coverImageUrl}
              onChange={(e) => set("coverImageUrl", e.target.value)}
              className={input}
              {...aria("coverImageUrl")}
            />
            {err("coverImageUrl")}
          </div>
          <div>
            <label htmlFor="coverImageAlt" className={label}>
              Alt text
            </label>
            <input
              id="coverImageAlt"
              value={values.coverImageAlt}
              onChange={(e) => set("coverImageAlt", e.target.value)}
              className={input}
            />
          </div>
        </div>

        <div className="grid gap-5 rounded-xl border border-rule bg-snow p-6">
          <h2 className="text-sm font-medium">SEO</h2>
          <div>
            <label htmlFor="seoTitle" className={label}>
              Meta title
            </label>
            <input
              id="seoTitle"
              value={values.seoTitle}
              onChange={(e) => set("seoTitle", e.target.value)}
              className={input}
            />
          </div>
          <div>
            <label htmlFor="seoDescription" className={label}>
              Meta description
            </label>
            <textarea
              id="seoDescription"
              rows={3}
              value={values.seoDescription}
              onChange={(e) => set("seoDescription", e.target.value)}
              className={`${input} resize-y`}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-night px-6 py-3 text-sm text-snow transition-colors hover:bg-night-2 disabled:opacity-60"
          >
            {busy ? "Saving…" : isEdit ? "Save changes" : "Create post"}
          </button>
          <Link href="/admin" className="text-sm text-mute underline decoration-rule underline-offset-4 hover:text-night">
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}
