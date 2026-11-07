"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { nav } from "@/lib/content";
import { Logo } from "./Logo";

/** Fixed header. Switches between light and dark to match the section under it. */
export function Header() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    // The section list never changes after mount, so it is queried once rather
    // than on every scroll event.
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-theme]"));
    const navSections = sections.filter((s) => s.id && nav.some((n) => n.href === `#${s.id}`));

    let frame = 0;
    const measure = () => {
      frame = 0;
      const probe = 40;
      const current = sections.find((s) => {
        const r = s.getBoundingClientRect();
        return r.top <= probe && r.bottom > probe;
      });
      setDark(current?.dataset.theme === "dark");

      const line = window.innerHeight * 0.4;
      const navHit = navSections.find((s) => {
        const r = s.getBoundingClientRect();
        return r.top <= line && r.bottom > line;
      });
      setActive(navHit ? `#${navHit.id}` : "");
    };

    // Coalesce to one measurement per frame: reading layout on every scroll
    // event forces a synchronous reflow and makes the page feel heavy.
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const isDark = dark && !open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        isDark ? "bg-night/90 text-snow" : "bg-snow/90 text-night"
      } backdrop-blur-md`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-night"
      >
        Skip to content
      </a>
      <div className="mx-auto grid h-[72px] max-w-7xl grid-cols-[1fr_auto] items-center gap-6 px-5 sm:px-10 lg:grid-cols-[1fr_auto_1fr]">
        <a href="#top" aria-label="Tactyqal Labs home">
          <Logo light={isDark} />
        </a>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1.5">
            {nav.map((item) => {
              const on = active === item.href;
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={on ? "true" : undefined}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] transition-colors ${
                      on
                        ? isDark
                          ? "border-snow bg-snow text-night"
                          : "border-night bg-night text-snow"
                        : isDark
                          ? "border-rule-dark text-mute-dark hover:text-snow"
                          : "border-rule text-mute hover:text-night"
                    }`}
                  >
                    <span className={`size-1.5 rounded-full ${on ? "bg-gold" : "bg-current opacity-50"}`} />
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center justify-end gap-2">
          <a
            href="#contact"
            className="hidden rounded-full bg-gold px-5 py-2.5 text-[13px] font-medium text-night transition-colors hover:bg-snow sm:inline-block"
          >
            Book a free call
          </a>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="h-[calc(100dvh-72px)] bg-snow px-5 pb-8 lg:hidden">
          <ul className="border-t border-rule">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="display block border-b border-rule py-5 text-3xl"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="mt-8 block rounded-full bg-gold py-4 text-center font-medium"
          >
            Book a free call
          </a>
        </nav>
      )}
    </header>
  );
}
