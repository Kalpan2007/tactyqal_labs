# Tactyqal Labs — homepage redesign and blog backend

Submission for the Tactyqal Labs Full Stack Developer Intern hire-a-thon.

Both tasks live in **one Next.js application**: the redesigned marketing site, the blog, the REST API that powers it, and the admin UI. One repository, one deploy, one database.

| Task | Where it is |
| --- | --- |
| **1 — Homepage redesign** | `/` — [src/app/page.tsx](src/app/page.tsx), [src/components/](src/components/) |
| **2 — Blog backend** | `/api/*` — [src/app/api/](src/app/api/), [prisma/schema.prisma](prisma/schema.prisma) |
| Blog front end | `/blog`, `/blog/[slug]` |
| Admin CRUD UI | `/admin` |
| API reference | `/api/docs` (OpenAPI 3.1 at `/api/openapi.json`) |

**The database is seeded with all 895 posts from the live WordPress blog**, imported through its REST API — not invented sample data. See [Migrating off WordPress](#migrating-off-wordpress).

---

## Run it

Requires Node 20+. The database is **Supabase Postgres**; Docker is only needed if you want to work offline.

```bash
cp .env.example .env     # then paste your Supabase connection strings into it
npm install
npm run db:setup         # migrate + generate + seed from the live WordPress blog
npm run dev              # http://localhost:3000
```

Both connection strings come from **Supabase → your project → Connect → ORMs → Prisma**:

| Variable | Supabase string | Used by |
| --- | --- | --- |
| `DATABASE_URL` | **Transaction pooler, port 6543** | The running app. Serverless functions open and drop connections constantly, which is exactly what the transaction pooler is for. |
| `DIRECT_URL` | **Session pooler, port 5432** | `prisma migrate` and the import scripts. Migrations need a real session; the transaction pooler hands out a different backend per statement. |

Both use the *same* pooler hostname and differ only in port. Three things catch people out:

- **Use the session pooler for `DIRECT_URL`, not the "direct connection" host.** `db.[ref].supabase.co` resolves to IPv6 only unless you buy Supabase's IPv4 add-on, so on a normal IPv4 network it fails with `P1001: Can't reach database server`.
- **URL-encode the password** if it contains `@ : / ? # &` (`@` → `%40`). An unencoded `@` splits the URL at the wrong place and corrupts the hostname.
- **Keep `uselibpqcompat=true`.** Without it, `pg` v8.16+ reads `sslmode=require` as full CA verification and rejects the pooler's chain with `self-signed certificate in certificate chain`. The connection stays TLS-encrypted either way; this only turns off CA-chain checking, which is the semantics libpq and the Supabase docs assume.

<details>
<summary>Offline, against local Postgres instead</summary>

```bash
npm run db:up            # Postgres 17 in Docker on port 5433
```

Then swap in the two commented lines at the top of `.env`. Nothing else changes — `DIRECT_URL` falls back to `DATABASE_URL`, so a local database only really needs one.
</details>

`npm run db:setup` pulls 60 posts so it finishes in about ten seconds. For the full archive:

```bash
npm run db:import        # all 895 posts, ~150s
```

Sign in to the admin at `/admin/login` with the `ADMIN_API_KEY` from your `.env`.

| Script | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run typecheck` / `lint` | `tsc --noEmit` / ESLint |
| `npm run db:up` / `db:down` | Start or stop the local Docker Postgres (offline development only) |
| `npm run db:migrate` | Create and apply a migration |
| `npm run db:seed` | Seed (WordPress import, with an offline fallback) |
| `npm run db:import` | Import every published WordPress post |
| `npm run db:studio` | Prisma Studio |
| `npm run db:reset` | Drop, re-migrate and re-seed |

---

## Task 1 — Homepage redesign

### What was wrong with the current page

| On tactyqal.com today | What this redesign does |
| --- | --- |
| A stray "Back to Top" link at the very top, a wrapping logo and nav, a "Contact" button clipped at the edge | A sticky header with one primary CTA and a working mobile menu |
| Large empty gap above the hero; low-contrast teal on dark; price badges crowding the headline | A hero that states the promise, the four proof points and the price together, with no dead space |
| Uneven grids with orphan cards (Week 7–8, "Pitch & Presentation") | A balanced 4-step timeline and a scannable benefits grid |
| The "Startup Ideas 101" video renders as an empty black box | Removed; the free tools are grouped and every one links to its real URL |
| Testimonial cards mostly empty, with stock photos | A compact quote wall where the quote is the focus |
| Six blog cards with duplicated layout and 2024 dates | The three latest posts, read live from the database |
| Pricing appears twice, in the hero and the footer | Stated once in the hero, then once in full in the pricing section |
| "FAQ" in the nav with no FAQ section on the page | An accessible FAQ built on native `<details>` |
| Contact section with no reachable contact details | Real email, phone and opening hours, plus a form that actually submits |
| Student counts disagree between sections (100+ vs 50+) | Both are kept, each labelled for what it counts |

### Correctness, measured rather than assumed

Horizontal overflow was checked programmatically on `/`, `/blog` and an article at 320, 340, 360, 375, 390, 400, 414, 430, 480, 540, 600, 640, 768, 834, 1024, 1152, 1280, 1366, 1440, 1600, 1920 and 2560 px. `document.scrollWidth === clientWidth` at every one.

Getting there turned up a real class of bug. Three headings were sized in viewport units or fixed `text-*` steps, so they overflowed the narrowest layouts. They are now sized against **their own column** with container queries:

```tsx
<div className="@container min-w-0">
  <RiseHeading lines={["Your teen builds", …]} className="text-[min(12.9cqw,5.25rem)]" />
```

`12.9cqw` is the measured ratio of the longest line's width to its column, so the line can never wrap. `min-w-0` on the item and `grid-cols-[minmax(0,1fr)]` on the track are both required: without them the grid sizes the column from the heading's min-content width, which sizes itself from the column — a cycle the browser resolves by letting the page overflow.

### Accessibility and motion

- Tabs follow the WAI-ARIA pattern: one tab stop, arrow keys / Home / End to move, roving `tabIndex`, a labelled `tabpanel`.
- The programme list opens on click only. It used to open on hover, which made the page jump as the cursor crossed it.
- Semantic landmarks, a skip link, visible focus rings, `aria-current` on the active nav item, `role="alert"` on form errors tied to inputs with `aria-describedby`.
- Every animation is disabled under `prefers-reduced-motion`.
- The scroll listener coalesces to one layout read per frame with `requestAnimationFrame`; it previously read layout on every scroll event, forcing a synchronous reflow.

### Design system

Archivo (variable width, self-hosted — no layout shift), alternating near-black and white sections, one gold accent. The accent is a single token in [globals.css](src/app/globals.css), so it can be swapped for Tactyqal's teal in one line.

---

## Task 2 — Blog backend

### Why replace WordPress

The blog is a second system: a second host, a second language, a second thing to patch, and no typed contract between it and the site. Folding it in gives:

- **One stack.** The homepage reads posts with the same query layer the API uses — no HTTP hop, no API key, no second deploy.
- **A typed contract end to end.** Prisma generates the types, Zod validates the edges, so a schema change is a compile error and not a 500 in production.
- **Headless by default.** The same API serves the website, the admin UI and anything built later.
- **Faster pages.** Articles are statically generated and revalidated hourly, rather than assembled per request by PHP.
- **Derived fields cannot drift.** Slug, excerpt and read time are computed on every write instead of being typed in by hand.

### Schema

[prisma/schema.prisma](prisma/schema.prisma) — `Post`, `Author`, `Category` (one per post), `Tag` (many-to-many), `Lead`.

Notable choices:

- `status` is an enum (`DRAFT` / `PUBLISHED` / `ARCHIVED`), not a boolean, so a post can be retired without deleting it.
- `publishedAt` is stamped the first time a post goes live and never overwritten, so re-publishing does not reorder the blog.
- `@@index([status, publishedAt(sort: Desc)])` matches the public list query exactly — "published, newest first".
- Deleting an author is `Restrict` (it would orphan articles); deleting a category is `SetNull` (the articles survive).
- `Lead` holds consultation requests, so the homepage form has somewhere real to go.

### API

Reads are public. Every write needs `x-api-key` (or `Authorization: Bearer`). Interactive reference at **`/api/docs`**.

| Method | Route | Notes |
| --- | --- | --- |
| `GET` | `/api/posts` | `page`, `limit`, `search`, `category`, `tag`, `status`, `featured`, `sort`. Body omitted from list responses. |
| `POST` | `/api/posts` | Admin. Slug, excerpt and read time derived if absent. |
| `GET` | `/api/posts/:idOrSlug` | Accepts either. Drafts 404 without the key. |
| `PATCH` | `/api/posts/:idOrSlug` | Admin. Partial. |
| `DELETE` | `/api/posts/:idOrSlug` | Admin. `204`. |
| `GET`/`POST` | `/api/categories` | With published-post counts. |
| `GET` | `/api/tags` | Only tags in use, most used first. |
| `GET` | `/api/authors` | With post counts. |
| `POST` | `/api/leads` | Public, rate limited to 5 per IP per hour. |
| `GET` | `/api/leads` | Admin. |
| `GET` | `/api/health` | Liveness and database reachability. |

Behaviour worth calling out:

- **Drafts are invisible, not forbidden.** An unpublished post returns `404`, not `403`, so the API never confirms that a hidden post exists.
- **Anonymous callers cannot widen the filter.** `?status=DRAFT` without a key is silently narrowed back to published.
- **Slugs never collide.** A duplicate title becomes `…-2`, `…-3`, which keeps URLs readable.
- **Errors are shaped consistently:** `{ "error": { "code", "message", "details" } }`, with Zod issues in `details`. One handler maps Prisma's `P2002` → `409`, `P2025` → `404`, `P2003` → `422`, and everything else to a `500` that logs the cause and returns nothing about it.
- The admin key is compared with `timingSafeEqual`, and the browser holds it in an `httpOnly` cookie rather than in JavaScript.

```bash
curl "$BASE/api/posts?search=pitch%20deck&limit=3"
curl -X POST "$BASE/api/posts" -H "x-api-key: $KEY" -H 'content-type: application/json' \
  -d '{"title":"A new post","content":"## Hello","authorId":"<id>","status":"PUBLISHED"}'
```

### Migrating off WordPress

[scripts/import-wordpress.ts](scripts/import-wordpress.ts) reads the live blog through `https://tactyqal.com/blog/wp-json/wp/v2` and writes it into Postgres. It:

- pages through every published post, streaming rather than buffering all 895;
- converts rendered HTML to Markdown with Turndown and decodes HTML entities, so `&#8217;` becomes `’` and nothing is stored as raw HTML;
- carries over the author, category, tags, featured image and its alt text, and the Yoast SEO title and description;
- preserves the original slug, so **every existing URL keeps working**;
- recomputes read time from the real word count;
- is **idempotent** — it matches on slug and updates in place, so it can run repeatedly during a cutover.

Verified against Supabase after a full run: **895 posts, 3 authors, 24 categories, 23 tags**, zero undecoded HTML entities and zero rows containing leftover HTML tags.

Two numbers are lower than perfect because the source is:

- **1 post has no cover image.** It has no featured image in WordPress either. The card falls back to a placeholder.
- **292 posts have no category.** Their only WordPress category is `Uncategorized` (term id 1), which the importer deliberately drops rather than carrying a label that means nothing. They are still fully searchable and tagged.

One post (`elements-of-good-business-model`) exposed a real conversion gap: its source HTML has an unbalanced `</p>`, which Turndown left in the output as literal text. `htmlToMarkdown` now strips a known list of leftover tags — listed explicitly rather than stripping every `<…>`, so prose like "costs <30 USD" survives. Re-import a single article with `npm run db:import -- --slug <slug>`.

Set `WORDPRESS_API_URL` to point it somewhere else.

### Admin UI

`/admin`, behind the key.

- Post list with status tabs and counts, search and pagination over all 895 rows.
- Create and edit, with live slug preview, word count, publishing controls, cover image, SEO fields and comma-separated tags.
- Two-step inline delete rather than `window.confirm`, which blocks the page and styles badly.
- Validation errors from the API are mapped back onto the individual fields.
- Consultation requests at `/admin/leads`.

The UI talks to the public REST API over `fetch` rather than to the database directly, so using it exercises the same endpoints an external client would.

---

## Architecture

```
src/
  app/
    page.tsx                  homepage (reads the 3 latest posts from the database)
    blog/                     listing with search, category and tag filters; article pages
    admin/
      login/                  key exchange for an httpOnly cookie
      (dashboard)/            post list, editor, leads — route group so login has no chrome
    api/
      posts/                  list, create, read, update, delete
      categories/ tags/ authors/ leads/ health/
      docs/ openapi.json/     OpenAPI 3.1 contract and reference UI
    sitemap.ts robots.ts      897 URLs, generated from the database
  components/                 homepage sections, blog, admin
  lib/
    db.ts                     Prisma client (one pool per process, HMR-safe)
    posts.ts                  the query layer the API *and* the pages both use
    validation/               Zod schemas
    api/                      http helpers, auth, slug and read-time derivation
  middleware.ts               admin gate (Edge-safe: no node:crypto in its import graph)
prisma/                       schema, migrations, seed
scripts/                      WordPress reader and importer
```

**One query layer, two consumers.** Pages call `listPosts()` directly rather than fetching their own API over HTTP — no self-request, no serialisation round trip — while external clients get the same results through the REST routes. Filtering, pagination and the response shape are defined once.

## Troubleshooting the database connection

| Error | Cause | Fix |
| --- | --- | --- |
| `P1001: Can't reach database server at db.[ref].supabase.co:5432` | That host has no IPv4 address — only IPv6, unless you buy Supabase's IPv4 add-on. | Point `DIRECT_URL` at the **session pooler** (`aws-0-[region].pooler.supabase.com:5432`) instead. |
| `P1000: Authentication failed` | The password contains `@`, `:`, `/`, `?`, `#` or `&` and was pasted unencoded, so the URL splits in the wrong place. | URL-encode it: `@` → `%40`. |
| `P1011: Error opening a TLS connection: self-signed certificate in certificate chain` | `pg` v8.16+ treats `sslmode=require` as `verify-full`. | Append `uselibpqcompat=true` to the connection string. |
| Migrations succeed but the app cannot connect | `prisma migrate` uses the schema engine, which has a separate TLS path from the runtime driver adapter. | A green migration does not prove the runtime URL works — check `/api/health`. |

`GET /api/health` returns `{"status":"ok","database":"reachable"}` and is the quickest way to confirm the runtime connection, locally and on Vercel.

## Deploying

**Supabase** holds the database, **Vercel** runs the app.

1. Create the Supabase project and copy both connection strings into `.env`.
2. Apply the schema and load the content, from your machine:
   ```bash
   npm run db:deploy        # applies migrations over DIRECT_URL
   npm run db:import        # all 895 posts from the live WordPress blog
   ```
3. Push the repo to GitHub and import it into Vercel.
4. Set four environment variables in Vercel (Production and Preview):

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | Supabase transaction pooler, port 6543 |
   | `DIRECT_URL` | Supabase direct connection, port 5432 |
   | `ADMIN_API_KEY` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `NEXT_PUBLIC_SITE_URL` | The deployed origin, e.g. `https://tactyqal-labs.vercel.app` |

5. Deploy. The build runs `prisma generate` before `next build`, so no extra build command is needed.

`NEXT_PUBLIC_SITE_URL` must be the real origin: canonical tags, Open Graph URLs and all 897 sitemap entries are built from it.

## Production notes

- Each serverless instance keeps a pool of one connection when it detects a Supabase pooler host, because many instances multiplied by a large pool is how a project runs out of Postgres connections.
- Security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`) are set in [next.config.ts](next.config.ts).
- Post bodies are rendered with `react-markdown`, which builds React elements instead of HTML, so stored content cannot inject markup.
- `/admin` and `/api/` are disallowed in `robots.txt`, and the admin pages carry `noindex`.
- Images go through `next/image` with AVIF/WebP and an explicit remote allowlist.
- Articles are statically generated (the 50 newest at build time) and revalidated hourly.

### Known limitations

- The lead rate limiter is in-process. Behind more than one instance it should move to Redis or Upstash.
- Auth is a single shared admin key, which suits one editor. Real multi-user editing needs per-user accounts and sessions.
- Cover images are still served from the WordPress media library. Moving them to object storage is the next step of the migration.
- `npm audit` reports a transitive `postcss` advisory inside Next 15.5.29; the fix is a Next 16 major upgrade, deliberately not taken mid-submission.
