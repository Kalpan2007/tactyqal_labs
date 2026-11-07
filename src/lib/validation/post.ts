import { z } from "zod";

export const postStatus = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Fields a client may send when creating a post. Everything else is derived server-side. */
export const createPostSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(160),
  slug: z
    .string()
    .trim()
    .regex(slugPattern, "Slug may contain lowercase letters, numbers and single hyphens only.")
    .max(80)
    .optional(),
  excerpt: z.string().trim().max(320).optional(),
  content: z.string().trim().min(1, "Content cannot be empty."),
  coverImageUrl: z.string().url().max(2048).optional().nullable(),
  coverImageAlt: z.string().trim().max(200).optional().nullable(),
  status: postStatus.default("DRAFT"),
  featured: z.boolean().default(false),
  seoTitle: z.string().trim().max(160).optional().nullable(),
  seoDescription: z.string().trim().max(320).optional().nullable(),
  publishedAt: z.coerce.date().optional().nullable(),
  authorId: z.string().min(1, "authorId is required."),
  categoryId: z.string().min(1).optional().nullable(),
  /** Tag names, not ids: new tags are created on the fly. */
  tags: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
});

/** Every field optional, but at least one must be present. */
export const updatePostSchema = createPostSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: "Provide at least one field to update." });

export const listPostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().min(1).max(100).optional(),
  category: z.string().trim().min(1).max(80).optional(),
  tag: z.string().trim().min(1).max(80).optional(),
  status: postStatus.optional(),
  featured: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  sort: z.enum(["newest", "oldest", "popular"]).default("newest"),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
