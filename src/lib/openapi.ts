/**
 * Hand-written OpenAPI 3.1 document for the blog API.
 *
 * It is generated from this one object at /api/openapi.json and rendered at
 * /api/docs, so the published contract and the served routes stay together.
 */

const postProperties = {
  id: { type: "string", example: "cmw66wohz000440phl0mrsojd" },
  title: { type: "string" },
  slug: { type: "string" },
  excerpt: { type: "string" },
  content: { type: "string", description: "Markdown. Absent from list responses." },
  coverImageUrl: { type: ["string", "null"], format: "uri" },
  coverImageAlt: { type: ["string", "null"] },
  status: { type: "string", enum: ["DRAFT", "PUBLISHED", "ARCHIVED"] },
  featured: { type: "boolean" },
  readTimeMinutes: { type: "integer", description: "Derived from the word count on every write." },
  viewCount: { type: "integer" },
  seoTitle: { type: ["string", "null"] },
  seoDescription: { type: ["string", "null"] },
  publishedAt: { type: ["string", "null"], format: "date-time" },
  createdAt: { type: "string", format: "date-time" },
  updatedAt: { type: "string", format: "date-time" },
  author: { $ref: "#/components/schemas/Author" },
  category: { oneOf: [{ $ref: "#/components/schemas/Category" }, { type: "null" }] },
  tags: { type: "array", items: { $ref: "#/components/schemas/Tag" } },
} as const;

const unauthorised = {
  description: "The admin key is missing or wrong.",
  content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
};
const notFound = {
  description: "No post with that slug or id.",
  content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
};
const validationFailed = {
  description: "The body failed validation. `error.details` lists each problem.",
  content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
};

export function openApiDocument(origin: string) {
  return {
    openapi: "3.1.0",
    info: {
      title: "Tactyqal Labs Blog API",
      version: "1.0.0",
      description:
        "The blog backend that replaces the separate WordPress install. Reads are public; every write needs the admin key.",
      contact: { name: "Tactyqal Labs", url: "https://tactyqal.com" },
    },
    servers: [{ url: origin, description: "This deployment" }],
    tags: [
      { name: "Posts", description: "Create, read, update and delete articles." },
      { name: "Taxonomy", description: "Categories, tags and authors." },
      { name: "Leads", description: "Consultation requests from the homepage." },
      { name: "System", description: "Health check." },
    ],
    components: {
      securitySchemes: {
        adminKey: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description: "The value of ADMIN_API_KEY. Also accepted as `Authorization: Bearer <key>`.",
        },
      },
      schemas: {
        Author: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            slug: { type: "string" },
            role: { type: ["string", "null"] },
            avatarUrl: { type: ["string", "null"] },
          },
        },
        Category: {
          type: "object",
          properties: { id: { type: "string" }, name: { type: "string" }, slug: { type: "string" } },
        },
        Tag: {
          type: "object",
          properties: { id: { type: "string" }, name: { type: "string" }, slug: { type: "string" } },
        },
        Post: { type: "object", properties: postProperties },
        PaginationMeta: {
          type: "object",
          properties: {
            page: { type: "integer" },
            limit: { type: "integer" },
            total: { type: "integer" },
            totalPages: { type: "integer" },
            hasNextPage: { type: "boolean" },
            hasPreviousPage: { type: "boolean" },
          },
        },
        PostList: {
          type: "object",
          properties: {
            data: { type: "array", items: { $ref: "#/components/schemas/Post" } },
            meta: { $ref: "#/components/schemas/PaginationMeta" },
          },
        },
        CreatePost: {
          type: "object",
          required: ["title", "content", "authorId"],
          properties: {
            title: { type: "string", minLength: 3, maxLength: 160 },
            slug: { type: "string", description: "Generated from the title when omitted." },
            excerpt: { type: "string", maxLength: 320, description: "Generated from the content when omitted." },
            content: { type: "string", description: "Markdown." },
            coverImageUrl: { type: ["string", "null"], format: "uri" },
            coverImageAlt: { type: ["string", "null"] },
            status: { type: "string", enum: ["DRAFT", "PUBLISHED", "ARCHIVED"], default: "DRAFT" },
            featured: { type: "boolean", default: false },
            seoTitle: { type: ["string", "null"] },
            seoDescription: { type: ["string", "null"] },
            publishedAt: { type: ["string", "null"], format: "date-time" },
            authorId: { type: "string" },
            categoryId: { type: ["string", "null"] },
            tags: {
              type: "array",
              maxItems: 10,
              items: { type: "string" },
              description: "Tag names. Any that do not exist yet are created.",
            },
          },
        },
        CreateLead: {
          type: "object",
          required: ["parentName", "email", "phone", "studentAge"],
          properties: {
            parentName: { type: "string" },
            email: { type: "string", format: "email" },
            phone: { type: "string" },
            studentAge: { type: "string" },
            idea: { type: ["string", "null"], maxLength: 2000 },
            source: { type: "string", default: "homepage" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "object",
              properties: {
                code: { type: "string", example: "VALIDATION_FAILED" },
                message: { type: "string" },
                details: {},
              },
            },
          },
        },
      },
    },
    paths: {
      "/api/posts": {
        get: {
          tags: ["Posts"],
          summary: "List posts",
          description:
            "Paginated and filterable. Anonymous callers only ever receive published posts; the `status` filter is honoured for authorised callers. The article body is omitted from list responses.",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50, default: 10 } },
            { name: "search", in: "query", schema: { type: "string" }, description: "Matches title, excerpt and body." },
            { name: "category", in: "query", schema: { type: "string" }, description: "Category slug." },
            { name: "tag", in: "query", schema: { type: "string" }, description: "Tag slug." },
            { name: "status", in: "query", schema: { type: "string", enum: ["DRAFT", "PUBLISHED", "ARCHIVED"] } },
            { name: "featured", in: "query", schema: { type: "string", enum: ["true", "false"] } },
            { name: "sort", in: "query", schema: { type: "string", enum: ["newest", "oldest", "popular"], default: "newest" } },
          ],
          responses: {
            200: {
              description: "A page of posts.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/PostList" } } },
            },
            400: { description: "A query parameter is not valid." },
          },
        },
        post: {
          tags: ["Posts"],
          summary: "Create a post",
          security: [{ adminKey: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/CreatePost" } } },
          },
          responses: {
            201: {
              description: "Created.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Post" } } },
            },
            401: unauthorised,
            422: validationFailed,
          },
        },
      },
      "/api/posts/{idOrSlug}": {
        parameters: [
          {
            name: "idOrSlug",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Either the post id or its slug.",
          },
        ],
        get: {
          tags: ["Posts"],
          summary: "Get one post",
          description: "Unpublished posts return 404 unless the admin key is supplied.",
          responses: {
            200: {
              description: "The post, including its markdown body.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Post" } } },
            },
            404: notFound,
          },
        },
        patch: {
          tags: ["Posts"],
          summary: "Update a post",
          description:
            "Partial update. Changing `status` to PUBLISHED stamps `publishedAt` the first time only. Changing `content` recalculates the read time.",
          security: [{ adminKey: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/CreatePost" } } },
          },
          responses: {
            200: {
              description: "The updated post.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Post" } } },
            },
            401: unauthorised,
            404: notFound,
            422: validationFailed,
          },
        },
        delete: {
          tags: ["Posts"],
          summary: "Delete a post",
          security: [{ adminKey: [] }],
          responses: { 204: { description: "Deleted." }, 401: unauthorised, 404: notFound },
        },
      },
      "/api/categories": {
        get: {
          tags: ["Taxonomy"],
          summary: "List categories with published-post counts",
          responses: { 200: { description: "Categories." } },
        },
        post: {
          tags: ["Taxonomy"],
          summary: "Create a category",
          security: [{ adminKey: [] }],
          responses: { 201: { description: "Created." }, 401: unauthorised, 422: validationFailed },
        },
      },
      "/api/tags": {
        get: {
          tags: ["Taxonomy"],
          summary: "List tags that have published posts, most used first",
          responses: { 200: { description: "Tags." } },
        },
      },
      "/api/authors": {
        get: { tags: ["Taxonomy"], summary: "List authors", responses: { 200: { description: "Authors." } } },
      },
      "/api/leads": {
        post: {
          tags: ["Leads"],
          summary: "Submit a consultation request",
          description: "Public, rate limited to 5 requests per IP per hour.",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/CreateLead" } } },
          },
          responses: {
            201: { description: "Received." },
            422: validationFailed,
            429: { description: "Too many requests." },
          },
        },
        get: {
          tags: ["Leads"],
          summary: "List the 100 most recent requests",
          security: [{ adminKey: [] }],
          responses: { 200: { description: "Leads." }, 401: unauthorised },
        },
      },
      "/api/health": {
        get: {
          tags: ["System"],
          summary: "Liveness and database reachability",
          responses: { 200: { description: "Healthy." }, 503: { description: "The database is unreachable." } },
        },
      },
    },
  };
}
