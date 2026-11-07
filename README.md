# Tactyqal Labs — homepage redesign + blog backend

A rebuild of the [tactyqal.com](https://tactyqal.com) homepage, and a replacement for its WordPress blog — both in **one Next.js app, one repo, one deploy.**

Submission for the Tactyqal Labs Full Stack Developer Intern hire-a-thon.

| | |
| --- | --- |
| **Live demo** | **https://tactyqallabsassignment.vercel.app** |
| New homepage | [/](https://tactyqallabsassignment.vercel.app) |
| Blog (895 articles) | [/blog](https://tactyqallabsassignment.vercel.app/blog) |
| API reference | [/api/docs](https://tactyqallabsassignment.vercel.app/api/docs) |
| Health check | [/api/health](https://tactyqallabsassignment.vercel.app/api/health) |
| Admin (needs a key) | [/admin](https://tactyqallabsassignment.vercel.app/admin) |

---

## The short version

**Task 1 — Homepage redesign.** Rebuilt in Next.js 15, TypeScript and Tailwind v4. Modern editorial layout, every section interactive, verified to have zero horizontal overflow from 320px to 2560px.

**Task 2 — Blog backend.** WordPress replaced by a typed Postgres schema with a documented REST API, a blog front end and an admin UI.

**And the part that makes it real:** the database isn't sample data. Their WordPress exposes a public REST API, so I wrote a migration that pulled **all 895 of their actual articles** into Postgres — images, tags, SEO fields and original URLs intact.

### By the numbers

| | |
| --- | --- |
| Real articles migrated | **895** (plus 3 authors, 24 categories, 23 tags) |
| Migration runtime | 150 seconds, idempotent, re-runnable |
| API endpoints | 11, documented with OpenAPI 3.1 |
| Screen widths checked for overflow | 22, from 320px to 2560px — **zero** found |
| URLs in the sitemap | 897, generated from the database |
| Database response time in production | ~3ms (functions co-located with Supabase) |

---

## Quick start

You need **Node 20+** and a **Supabase** project (free tier is fine). Docker is optional, for working offline.

```bash
git clone https://github.com/Kalpan2007/tactyqal_labs.git
cd tactyqal_labs
cp .env.example .env     # paste your Supabase connection strings in
npm install
npm run db:setup         # create tables, then seed from the live WordPress blog
npm run dev              # http://localhost:3000
```

`npm run db:setup` pulls 60 posts so it finishes in about ten seconds. For the full archive, run `npm run db:import` (~150s, all 895).

To use the admin, open `/admin/login` and enter the `ADMIN_API_KEY` from your `.env`.

### The two connection strings

Both come from **Supabase → your project → Connect → ORMs → Prisma**.

| Variable | Which Supabase string | Used by | Why |
| --- | --- | --- | --- |
| `DATABASE_URL` | Transaction pooler, port **6543** | The running app | Serverless functions open and drop connections constantly. This pooler is built for that. |
| `DIRECT_URL` | Session pooler, port **5432** | `prisma migrate`, import scripts | Migrations need one real session. The transaction pooler gives a different backend per statement. |

They share the same hostname and differ only in the port. Three things catch people out — all three are in [Troubleshooting](#troubleshooting) below.

### Every command

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `start` | Production build / serve it |
| `npm run typecheck` / `lint` | `tsc --noEmit` / ESLint |
| `npm run db:setup` | Migrate, generate the client, seed |
| `npm run db:import` | Import every published WordPress post |
| `npm run db:import -- --slug <slug>` | Re-import one article |
| `npm run db:migrate` / `db:deploy` | Create a migration / apply migrations |
| `npm run db:studio` | Browse the data in Prisma Studio |
| `npm run db:reset` | Drop, re-migrate, re-seed |
| `npm run db:up` / `db:down` | Start / stop local Docker Postgres (offline only) |

---

## Task 1 — Homepage redesign

### What was wrong, and what I did

| On tactyqal.com today | In the redesign |
| --- | --- |
| A stray "Back to Top" link at the very top, a wrapping nav, a Contact button clipped at the edge | A sticky header with one clear call to action and a working mobile menu |
| Big empty gap above the hero; low-contrast teal on dark; price badges crowding the headline | A hero that states the promise, the four proof points and the price together — no dead space |
| Uneven grids with orphan cards (Week 7–8, "Pitch & Presentation") | A balanced 4-step timeline and a scannable benefits grid |
| The "Startup Ideas 101" video renders as an empty black box | Removed. The free tools are grouped, and every link goes to the real tool |
| Testimonial cards mostly empty, with stock photos | A compact quote wall where the quote is the focus |
| Six blog cards, all duplicated layout, dated 2024 | The three latest posts, read live from the database |
| Pricing appears twice — hero and footer | Once in the hero, once in full in the pricing section |
| "FAQ" in the nav, but no FAQ anywhere on the page | An accessible FAQ built on native `<details>` |
| A contact section with no way to contact anyone | Real email, phone and opening hours, and a form that submits |

### Responsive — measured, not assumed

I wrote a script that loads `/`, `/blog` and an article at **22 widths** (320, 340, 360, 375, 390, 400, 414, 430, 480, 540, 600, 640, 768, 834, 1024, 1152, 1280, 1366, 1440, 1600, 1920, 2560) and compares `document.scrollWidth` to `clientWidth` at each.

Result: **zero horizontal overflow everywhere.**

Getting there found a real bug class. Three headings were sized in viewport units, so they overflowed narrow screens. They are now sized against **their own column**:

```tsx
<div className="@container min-w-0">
  <RiseHeading lines={["Your teen builds", …]} className="text-[min(12.9cqw,5.25rem)]" />
```

`12.9cqw` is the measured ratio of the longest line's width to its column, so that line can never wrap. Both `min-w-0` on the item and `grid-cols-[minmax(0,1fr)]` on the track are required — without them the grid sizes the column from the heading's content, while the heading sizes itself from the column. That loop resolves by letting the page overflow.

### Accessibility

- Tabs follow the WAI-ARIA pattern: one tab stop, arrow keys and Home/End to move, roving `tabIndex`, a labelled panel.
- The programme list opens on **click only**. Opening on hover made the page jump as the cursor crossed it.
- Semantic landmarks, a skip link, visible focus rings, `aria-current` on the active nav item, and form errors with `role="alert"` tied to their inputs.
- Every animation is disabled under `prefers-reduced-motion`.
- The scroll listener coalesces to one layout read per frame. It previously read layout on every scroll event, forcing a reflow.

### Design

Archivo at variable width, self-hosted so there is no layout shift. Alternating near-black and white sections. One gold accent, defined as a single token in `globals.css` — swap it for Tactyqal's teal in one line.

---

## Task 2 — Blog backend

### Why replace WordPress

The blog is a second system: a second host, a second language, a second thing to patch, and no typed contract between it and the site that links to it. Folding it in gives:

- **One stack.** The homepage reads posts through the same query layer the API uses. No HTTP hop, no API key, no second deploy.
- **Types end to end.** Prisma generates the types, Zod validates the edges. A schema change becomes a compile error instead of a 500 in production.
- **Headless.** The same API serves the website, the admin UI, and anything built later.
- **Faster pages.** Articles are statically generated and revalidated hourly, instead of assembled per request by PHP.
- **Derived fields can't drift.** Slug, excerpt and read time are computed on every write, never typed by hand.

### The schema

Five models in [`prisma/schema.prisma`](prisma/schema.prisma): `Post`, `Author`, `Category` (one per post), `Tag` (many-to-many) and `Lead`.

Decisions worth explaining:

| Decision | Reason |
| --- | --- |
| `status` is an enum (`DRAFT` / `PUBLISHED` / `ARCHIVED`), not a boolean | A post can be retired without being deleted |
| `publishedAt` is stamped once and never overwritten | Re-publishing an edit doesn't reorder the blog |
| Index on `[status, publishedAt desc]` | Matches the public query exactly: published, newest first |
| Deleting an author is `Restrict` | It would orphan articles |
| Deleting a category is `SetNull` | The articles survive |
| `Lead` model | So the homepage form has somewhere real to post |

### The API

Reads are public. Every write needs the admin key, sent as `x-api-key` or `Authorization: Bearer`.

**Full interactive reference: [`/api/docs`](https://tactyqallabsassignment.vercel.app/api/docs)** · raw spec at `/api/openapi.json`

| Method | Route | Notes |
| --- | --- | --- |
| `GET` | `/api/posts` | `page`, `limit`, `search`, `category`, `tag`, `status`, `featured`, `sort`. Body omitted from lists |
| `POST` | `/api/posts` | Admin. Slug, excerpt and read time derived if absent |
| `GET` | `/api/posts/:idOrSlug` | Accepts either. Drafts 404 without the key |
| `PATCH` | `/api/posts/:idOrSlug` | Admin. Partial update |
| `DELETE` | `/api/posts/:idOrSlug` | Admin. Returns 204 |
| `GET` `POST` | `/api/categories` | With published-post counts |
| `GET` | `/api/tags` | Only tags in use, most used first |
| `GET` | `/api/authors` | With post counts |
| `POST` | `/api/leads` | Public. Rate limited to 5 per IP per hour |
| `GET` | `/api/leads` | Admin |
| `GET` | `/api/health` | Liveness and database reachability |

Four behaviours worth knowing:

- **Drafts are invisible, not forbidden.** An unpublished post returns `404`, never `403`, so the API doesn't confirm a hidden post exists.
- **Anonymous callers can't widen the filter.** `?status=DRAFT` without a key is silently narrowed back to published.
- **Slugs never collide.** A duplicate title becomes `…-2`, `…-3`, keeping URLs readable.
- **Errors are one shape:** `{ "error": { "code", "message", "details" } }`, with Zod issues in `details`. One handler maps Prisma `P2002` → 409, `P2025` → 404, `P2003` → 422, and everything else to a 500 that logs the cause and reveals nothing.

The admin key is compared with `timingSafeEqual`, and the browser holds it in an `httpOnly` cookie rather than in JavaScript.

```bash
# public read
curl "https://tactyqallabsassignment.vercel.app/api/posts?search=pitch%20deck&limit=3"

# authenticated write
curl -X POST "$BASE/api/posts" \
  -H "x-api-key: $ADMIN_API_KEY" \
  -H "content-type: application/json" \
  -d '{"title":"A new post","content":"## Hello","authorId":"<id>","status":"PUBLISHED"}'
```

### Migrating off WordPress

[`scripts/import-wordpress.ts`](scripts/import-wordpress.ts) reads the live blog through `https://tactyqal.com/blog/wp-json/wp/v2` and writes it into Postgres.

What it does:

- Pages through every published post, **streaming** rather than holding all 895 in memory.
- Converts rendered HTML to Markdown with Turndown, and decodes entities — `&#8217;` becomes `'`. Nothing is stored as HTML.
- Carries over author, category, tags, featured image with its alt text, and the Yoast SEO title and description.
- **Preserves the original slug, so every existing blog URL keeps working.**
- Recalculates read time from the real word count.
- Is **idempotent** — it matches on slug and updates in place, so it can run repeatedly during a cutover.

Verified after a full run against Supabase: **895 posts, 3 authors, 24 categories, 23 tags**, zero undecoded entities, zero rows with leftover HTML tags.

Two numbers are short of perfect because the source is:

- **1 post has no cover image** — it has none in WordPress either. The card falls back to a placeholder.
- **292 posts have no category** — their only WordPress category is `Uncategorized`, which the importer deliberately drops rather than carry a label that means nothing. They are still searchable and tagged.

One article exposed a real gap: its source HTML has an unbalanced `</p>`, which Turndown left as literal text. `htmlToMarkdown` now strips a known list of leftover tags — listed explicitly rather than stripping every `<…>`, so prose like "costs <30 USD" survives. Re-import one article with `npm run db:import -- --slug <slug>`.

Point it at a different blog with `WORDPRESS_API_URL`.

### Admin UI

At `/admin`, behind the key.

- Post list with status tabs and counts, search, and pagination over all 895 rows.
- Create and edit, with live slug preview, word count, publishing controls, cover image, SEO fields and comma-separated tags.
- Two-step inline delete rather than `window.confirm`, which blocks the page and can't be styled.
- Validation errors from the API map back onto individual fields.
- Consultation requests at `/admin/leads`.

**The admin talks to the public REST API over `fetch`, not to the database.** Using it exercises exactly the endpoints an external client would.

---

## Architecture

There is no separate API server. The API is built with **Next.js App Router route handlers** — a file at `app/api/posts/route.ts` exporting `GET` and `POST` *is* `GET /api/posts`.

Four layers, each with one job:

```
Route handler   src/app/api/posts/route.ts   HTTP only: auth, parse, status codes
      ↓
Validation      src/lib/validation/post.ts   Zod — rejects bad input at the edge
      ↓
Service         src/lib/posts.ts             All query logic: filters, pagination, slug, read time
      ↓
Prisma client   src/lib/db.ts                One pool per process → Supabase
```

**The key decision: that service layer has two consumers.** The REST routes call `listPosts()`, and the pages call it directly — `/blog` and the homepage do not fetch their own API over HTTP. No self-request, no serialisation round trip, and filtering, pagination and response shape are defined exactly once. External clients still get identical results through `/api/posts`.

```
src/
  app/
    page.tsx              homepage (reads the 3 latest posts from the database)
    blog/                 listing with search, category and tag filters; article pages
    admin/
      login/              key exchange for an httpOnly cookie
      (dashboard)/        post list, editor, leads — a route group, so login has no chrome
    api/                  posts, categories, tags, authors, leads, health, docs, openapi.json
    sitemap.ts robots.ts  897 URLs, generated from the database
  components/             homepage sections, blog, admin
  lib/
    db.ts                 Prisma client (one pool per process, HMR-safe)
    posts.ts              the query layer the API and the pages both use
    validation/           Zod schemas
    api/                  http helpers, auth, slug and read-time derivation
  middleware.ts           admin gate (Edge-safe: no node:crypto in its import graph)
prisma/                   schema, migrations, seed
scripts/                  WordPress reader and importer
```

---

## Deploying

**Supabase** holds the database. **Vercel** runs the app.

1. Create the Supabase project, copy both connection strings into `.env`.
2. Apply the schema and load the content from your machine:
   ```bash
   npm run db:deploy        # applies migrations over DIRECT_URL
   npm run db:import        # all 895 posts
   ```
3. Push to GitHub and import the repo into Vercel.
4. Set four environment variables (Production and Preview):

   | Variable | Value | Sensitive? |
   | --- | --- | --- |
   | `DATABASE_URL` | Supabase transaction pooler, 6543 | Yes |
   | `DIRECT_URL` | Supabase session pooler, 5432 | Yes |
   | `ADMIN_API_KEY` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | Yes |
   | `NEXT_PUBLIC_SITE_URL` | The deployed origin | **No — see below** |

5. Deploy. The build runs `prisma generate` before `next build`, so no custom build command is needed.

### Why `NEXT_PUBLIC_SITE_URL` can't be marked Sensitive

Anything prefixed `NEXT_PUBLIC_` is inlined into the browser bundle at build time, so it is public by definition. Vercel refuses the combination:

> Environment variables with a public framework prefix cannot use `visibility: secret`. Use `visibility: config` instead.

Add it with Sensitive **off**. The others are server-only and should stay Sensitive.

Because the value is baked in at build time, **changing it requires a redeploy** — saving it alone does nothing.

If it is missing, or left pointing at localhost while deployed, the app falls back to the deployment's own Vercel URL rather than shipping canonical tags and a sitemap full of `http://localhost:3000`.

---

## Troubleshooting

The three errors I hit setting up Supabase, in the order they appeared:

| Error | Cause | Fix |
| --- | --- | --- |
| `P1001: Can't reach database server at db.[ref].supabase.co:5432` | That host has **no IPv4 address** — only IPv6, unless you buy Supabase's IPv4 add-on | Point `DIRECT_URL` at the **session pooler** (`aws-0-[region].pooler.supabase.com:5432`) |
| `P1000: Authentication failed` | The password contains `@ : / ? # &` and was pasted unencoded, so the URL splits in the wrong place | URL-encode it — `@` becomes `%40` |
| `P1011: Error opening a TLS connection: self-signed certificate in certificate chain` | `pg` v8.16+ reads `sslmode=require` as full CA verification | Append `uselibpqcompat=true`. Still TLS-encrypted, just not CA-verified — the semantics libpq and the Supabase docs assume |
| Build times out: `prisma:error timeout exceeded when trying to connect` | The connection pool was capped at 1, but `next build` prerenders many pages at once from one process | Pool size is now phase-aware: 10 during a build, 5 at runtime |

**A green migration does not prove the app can connect.** `prisma migrate` uses the schema engine, which has a separate TLS path from the runtime driver adapter. Check `/api/health` instead.

---

## Production notes

- Each serverless instance keeps a pool of one connection when it detects a Supabase pooler host. Many instances multiplied by a big pool is how a project runs out of Postgres connections.
- Functions are pinned to `sin1` in `vercel.json`, next to the database — that is the difference between ~3ms and ~230ms per query.
- Post bodies render with `react-markdown`, which builds React elements rather than HTML, so stored content cannot inject markup.
- Security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`) are set in `next.config.ts`.
- `/admin` and `/api/` are disallowed in `robots.txt`, and the admin pages carry `noindex`.
- Images go through `next/image` with AVIF/WebP and an explicit remote allowlist.
- Articles are statically generated — the 24 newest at build time — and revalidated hourly.

## Known limitations

Stated plainly rather than hidden:

- **The lead rate limiter is in-process.** Behind more than one instance it needs Redis or Upstash.
- **Auth is a single shared admin key.** That suits one editor. Multi-user editing needs per-user accounts and sessions.
- **Cover images still come from the WordPress media library.** Moving them to object storage is the next migration step.
- **The view counter increments per render, not per visitor,** because article pages are statically generated and revalidated hourly. It indicates activity; it is not analytics.
- **No automated test suite yet.** Typecheck and lint are clean, and the API was verified end to end by hand.
- `npm audit` reports a transitive `postcss` advisory inside Next 15.5.29. The fix is a Next 16 major upgrade, deliberately not taken mid-submission.

---

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Prisma 7 · PostgreSQL (Supabase) · Zod 4 · react-markdown · Turndown · Vercel
