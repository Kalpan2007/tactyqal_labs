import Link from "next/link";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import { benefits, faqs, pricing, testimonials, tools, toolsIndexUrl } from "@/lib/content";
import { formatDate, formatReadTime } from "@/lib/format";
import { LineArt, Marker, PillButton, RiseHeading } from "./ui";

/* ---------------- 0.4 Outcomes: statistics + why parents choose ---------------- */

const outcomes = [
  { value: "100+", label: "Students mentored" },
  { value: "50+", label: "Successful student founders" },
  { value: "₹1L", label: "Monthly revenue, One Last Chapter" },
  { value: "8", label: "Weeks from idea to launch" },
];

export function Outcomes() {
  return (
    <section data-theme="dark" className="bg-night pb-24 text-snow sm:pb-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-10">
        <div className="grid gap-12 border-t border-rule-dark pt-24 sm:pt-32 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Marker index="0.4" label="Outcomes" dark />
            <RiseHeading lines={["Results"]} className="mt-6 text-6xl sm:text-8xl" />
            <p className="mt-6 max-w-sm leading-relaxed text-mute-dark">
              Real products, real revenue and admits to top universities. Here is what the programme has produced so
              far.
            </p>
          </div>
          <dl className="grid grid-cols-2 self-end">
            {outcomes.map((o, i) => (
              <div
                key={o.label}
                className={`flex flex-col-reverse border-rule-dark px-4 py-8 sm:px-8 ${i % 2 === 0 ? "border-r" : ""} ${
                  i < 2 ? "border-b" : ""
                }`}
              >
                <dt className="mt-4 text-xs text-mute-dark">{o.label}</dt>
                <dd className="display text-5xl sm:text-7xl">{o.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

export function Benefits() {
  return (
    <section data-theme="light" className="bg-snow py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <Marker index="0.5" label="Why Tactyqal" />
            <RiseHeading lines={["Why parents", "choose us"]} className="mt-6 text-5xl sm:text-7xl" />
          </div>
          <LineArt className="w-32 text-gold" />
        </div>
        <ul className="mt-16 grid border-t border-l border-rule sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <li key={b.title} className="border-r border-b border-rule p-7">
              <span className="block h-px w-8 bg-gold" aria-hidden="true" />
              <h3 className="wide mt-6 text-xl leading-snug font-light">{b.title}</h3>
              <p className="mt-3 leading-relaxed text-mute">{b.detail}</p>
            </li>
          ))}
          <li className="flex flex-col justify-between gap-6 border-r border-b border-rule bg-gold p-7">
            <p className="wide text-xl leading-snug font-light">Talk it through with a mentor first.</p>
            <a href="#contact" className="inline-flex items-center gap-2 text-sm font-medium">
              Book a free call <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}

/* ---------------- 0.6 Testimonials ---------------- */

const avatarTones = ["bg-gold text-night", "bg-night text-gold", "bg-snow text-night border border-rule"];

export function Testimonials() {
  return (
    <section data-theme="light" className="bg-snow pb-24 sm:pb-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-10">
        <Marker index="0.6" label="Testimonials" />
        <RiseHeading lines={["In their words"]} className="mt-6 text-5xl sm:text-7xl" />
        <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <li key={t.name} className="flex flex-col rounded-lg bg-fog p-7">
              <p className="flex items-center gap-3">
                <span
                  className={`grid size-10 place-items-center rounded-full text-sm ${avatarTones[i % 3]}`}
                  aria-hidden="true"
                >
                  {t.name[0]}
                </span>
                <span>
                  <span className="block text-sm font-medium">{t.name}</span>
                  <span className="block text-xs text-mute">Tactyqal student</span>
                </span>
              </p>
              <blockquote className="wide mt-8 text-lg leading-snug font-light">“{t.quote}”</blockquote>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------- 0.7 Pricing ---------------- */

export function Pricing() {
  return (
    <section id="pricing" data-theme="dark" className="bg-night py-24 text-snow sm:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-14 px-5 sm:px-10 lg:grid-cols-2">
        <div className="@container min-w-0">
          <Marker index="0.7" label="Pricing" dark />
          {/*
            Sized against this column rather than the viewport. A fixed text-5xl
            pushed "One programme." past the right edge at 320px.
          */}
          <RiseHeading
            lines={["One programme.", "Everything", "included."]}
            className="mt-6 text-[min(12cqw,4.5rem)]"
          />
          <p className="mt-8 max-w-sm leading-relaxed text-mute-dark">
            No group batches. One mentor works with your child from the first idea to launch day.
          </p>
        </div>
        <div className="@container min-w-0 self-end">
          <p className="text-sm text-mute-dark">8-week founder programme, limited-time price</p>
          <p className="mt-4 flex flex-wrap items-baseline gap-x-5">
            {/* Column-relative: text-7xl pushed the price past the edge at 320px. */}
            <span className="display text-[min(25cqw,6rem)] text-gold">{pricing.price}</span>
            <span className="text-xl text-mute-dark line-through">{pricing.was}</span>
          </p>
          <ul className="mt-10 border-t border-rule-dark">
            {pricing.includes.map((item) => (
              <li key={item} className="flex items-center gap-4 border-b border-rule-dark py-4">
                <Check size={18} className="shrink-0 text-gold" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <PillButton href="#contact">Book a free consultation</PillButton>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 0.8 Resources: latest posts + the free tools ---------------- */

export type LatestPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  readTimeMinutes: number;
  publishedAt: Date | null;
  createdAt: Date;
  category: { name: string; slug: string } | null;
};

/**
 * `posts` comes from the blog database at request time, so this section is
 * always current without anyone editing the homepage.
 */
export function Resources({ posts }: { posts: LatestPost[] }) {
  return (
    <section id="resources" data-theme="light" className="bg-snow py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <Marker index="0.8" label="Resources" />
            <RiseHeading lines={["Learn for free"]} className="mt-6 text-5xl sm:text-7xl" />
          </div>
          <Link href="/blog" className="group inline-flex items-center gap-3 text-sm">
            Read all articles
            <span className="h-px w-16 bg-gold transition-all group-hover:w-24" aria-hidden="true" />
          </Link>
        </div>

        {posts.length > 0 && (
          <ul className="mt-14 border-t border-night">
            {posts.map((post) => (
              <li key={post.id} className="border-b border-rule">
                <Link
                  href={`/blog/${post.slug}`}
                  className="group grid gap-2 py-7 transition-colors hover:bg-fog sm:grid-cols-[0.25fr_1fr_auto] sm:items-center sm:px-4"
                >
                  <span className="text-sm text-mute">
                    {formatDate(post.publishedAt ?? post.createdAt)} · {formatReadTime(post.readTimeMinutes)}
                  </span>
                  <span>
                    <span className="wide block text-xl leading-snug font-light sm:text-2xl">{post.title}</span>
                    <span className="mt-1 block line-clamp-2 text-mute">{post.excerpt}</span>
                  </span>
                  <span
                    className="hidden size-11 place-items-center rounded-full border border-rule transition-colors group-hover:border-gold group-hover:bg-gold sm:grid"
                    aria-hidden="true"
                  >
                    <ArrowUpRight size={18} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div id="tools" className="mt-20 grid gap-8 lg:grid-cols-[0.6fr_1.4fr]">
          <div>
            <h3 className="wide text-2xl font-light">Free founder tools</h3>
            <p className="mt-3 max-w-xs leading-relaxed text-mute">
              Test your startup idea before you build it. Used by 1,000+ entrepreneurs.
            </p>
            <a
              href={toolsIndexUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-6 inline-flex items-center gap-3 text-sm"
            >
              Open all tools
              <span className="h-px w-12 bg-gold transition-all group-hover:w-20" aria-hidden="true" />
            </a>
          </div>
          <ul className="flex flex-wrap content-start gap-2">
            {tools.map((tool) => (
              <li key={tool.href}>
                <a
                  href={tool.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-rule px-4 py-2.5 text-sm transition-colors hover:border-night hover:bg-night hover:text-snow"
                >
                  {tool.label}
                  <ArrowUpRight size={14} className="text-gold" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 0.9 FAQ ---------------- */

export function Faq() {
  return (
    <section id="faq" data-theme="light" className="bg-fog py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Marker index="0.9" label="FAQ" />
          <RiseHeading lines={["Questions", "parents ask"]} className="mt-6 text-5xl sm:text-6xl" />
        </div>
        <div className="border-t border-night">
          {faqs.map((f) => (
            <details key={f.q} className="group border-b border-rule">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                <span className="wide text-lg font-light sm:text-xl">{f.q}</span>
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-rule transition-colors group-open:border-gold group-open:bg-gold">
                  <Plus size={16} className="transition-transform group-open:rotate-45" aria-hidden="true" />
                </span>
              </summary>
              <p className="max-w-xl pb-7 leading-relaxed text-mute">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
