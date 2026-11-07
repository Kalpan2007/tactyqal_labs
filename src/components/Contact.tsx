"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { contact, nav } from "@/lib/content";
import { LogoMark } from "./Logo";
import { LineArt, PillButton, RiseHeading, useInView } from "./ui";

const fields = [
  { name: "parentName", label: "Your name", type: "text", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
  { name: "studentAge", label: "Your child’s age", type: "text", autoComplete: "off" },
] as const;

type FieldErrors = Partial<Record<string, string>>;

export function Contact() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    setBanner(null);

    const data = Object.fromEntries(new FormData(event.currentTarget));

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, source: "homepage" }),
      });

      if (response.ok) {
        setSent(true);
        return;
      }

      const body = await response.json().catch(() => null);
      const issues = body?.error?.details as Array<{ path: string[]; message: string }> | undefined;
      if (issues?.length) {
        setErrors(Object.fromEntries(issues.map((i) => [i.path[0] ?? "form", i.message])));
        setBanner("Please check the highlighted fields.");
      } else if (response.status === 429) {
        setBanner("That is a lot of requests. Please try again a little later.");
      } else {
        setBanner(body?.error?.message ?? "Something went wrong. Please email us instead.");
      }
    } catch {
      setBanner("Could not reach the server. Please email us instead.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="contact" data-theme="light" className="bg-snow py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="flex flex-col">
          <RiseHeading lines={["Let’s talk"]} className="text-6xl sm:text-8xl" />
          <LineArt variant="arrow" className="mt-10 w-24 text-gold" />
          <p className="mt-10 max-w-xs text-lg leading-relaxed">
            Book a free consultation and talk through your child’s idea with a mentor.
          </p>

          <ul className="mt-auto space-y-3 pt-10 text-sm">
            <li>
              <a href={`mailto:${contact.email}`} className="group inline-flex items-center gap-3">
                <Mail size={16} className="text-gold" aria-hidden="true" />
                <span className="group-hover:underline group-hover:decoration-gold group-hover:underline-offset-4">
                  {contact.email}
                </span>
              </a>
            </li>
            <li>
              <a href={contact.phoneHref} className="group inline-flex items-center gap-3">
                <Phone size={16} className="text-gold" aria-hidden="true" />
                <span className="group-hover:underline group-hover:decoration-gold group-hover:underline-offset-4">
                  {contact.phone}
                </span>
              </a>
            </li>
            <li className="text-mute">
              {contact.hours} · {contact.responseTime}
            </li>
          </ul>
        </div>

        {sent ? (
          <div className="flex flex-col justify-center border-t border-night pt-10" role="status">
            <p className="display text-4xl">Request sent.</p>
            <p className="mt-4 max-w-md text-lg text-mute">
              A mentor will contact you to schedule the free consultation, usually within 24 hours.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="mt-8 self-start text-sm underline decoration-gold underline-offset-4"
            >
              Send another request
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
            {banner && (
              <p role="alert" className="rounded-lg border border-night bg-gold px-4 py-3 text-sm sm:col-span-2">
                {banner}
              </p>
            )}

            {fields.map((f) => (
              <label key={f.name} className="block">
                <span className="text-sm text-mute">{f.label}</span>
                <input
                  required
                  name={f.name}
                  type={f.type}
                  autoComplete={f.autoComplete}
                  aria-invalid={errors[f.name] ? true : undefined}
                  aria-describedby={errors[f.name] ? `${f.name}-error` : undefined}
                  className={`mt-2 block w-full border-b bg-transparent py-2 text-lg outline-none transition-colors focus:border-gold ${
                    errors[f.name] ? "border-night" : "border-rule"
                  }`}
                />
                {errors[f.name] && (
                  <span id={`${f.name}-error`} role="alert" className="mt-1.5 block text-xs">
                    {errors[f.name]}
                  </span>
                )}
              </label>
            ))}

            <label className="block sm:col-span-2">
              <span className="text-sm text-mute">Your child’s idea (optional)</span>
              <textarea
                name="idea"
                rows={3}
                className="mt-2 block w-full resize-none border-b border-rule bg-transparent py-2 text-lg outline-none transition-colors focus:border-gold"
              />
            </label>

            <div className="sm:col-span-2 sm:justify-self-end">
              <PillButton as="button" type="submit" disabled={busy}>
                {busy ? "Sending…" : "Book a free consultation"}
              </PillButton>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

export function Footer() {
  const [ref, inView] = useInView<HTMLParagraphElement>(0.2);
  return (
    <footer data-theme="light" className="overflow-hidden bg-snow">
      <div className="mx-auto max-w-7xl px-5 sm:px-10">
        <div className="grid gap-10 border-t border-night pt-8 sm:grid-cols-[1fr_auto_auto] sm:gap-16">
          <p className="max-w-xs text-sm text-mute">
            Helping young builders turn ideas into real-world products through 1:1 mentoring.
          </p>
          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
              {nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="hover:text-mute">
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <Link href="/blog" className="hover:text-mute">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-mute">
                  FAQ
                </Link>
              </li>
            </ul>
          </nav>
          <div className="text-sm">
            <a href={`mailto:${contact.email}`} className="block hover:text-mute">
              {contact.email}
            </a>
            <a href={contact.phoneHref} className="mt-2 block hover:text-mute">
              {contact.phone}
            </a>
          </div>
        </div>

        <div className="mt-16 flex items-end gap-4 pb-4 sm:gap-8" aria-hidden="true">
          <LogoMark className="w-[13vw] shrink-0 lg:w-48" />
          <p
            ref={ref}
            className={`wordmark display text-[14vw] leading-[0.8] whitespace-nowrap lg:text-[13rem] ${
              inView ? "is-in" : ""
            }`}
          >
            {"Tactyqal".split("").map((ch, i) => (
              <span
                key={i}
                style={{ transitionDelay: `${i * 0.06}s`, color: i < 4 ? "#1b1b1b" : i < 6 ? "#5a5a5a" : "#d9d9d9" }}
              >
                {ch}
              </span>
            ))}
          </p>
        </div>
        <p className="border-t border-rule py-6 text-xs text-mute">
          © {new Date().getFullYear()} Tactyqal Labs. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
