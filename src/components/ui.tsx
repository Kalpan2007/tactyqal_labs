"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

/** Adds `is-in` once the element scrolls into view (drives the CSS reveals). */
export function useInView<T extends Element>(threshold = 0.3) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

/** Big heading whose lines rise out of a mask. Pass lines as an array. */
export function RiseHeading({
  lines,
  as: Tag = "h2",
  className = "",
}: {
  lines: string[];
  as?: ElementType;
  className?: string;
}) {
  const [ref, inView] = useInView<HTMLHeadingElement>(0.4);
  return (
    <Tag ref={ref} className={`display rise ${inView ? "is-in" : ""} ${className}`} aria-label={lines.join(" ")}>
      {lines.map((line) => (
        <span key={line} aria-hidden="true">
          <span>{line}</span>
        </span>
      ))}
    </Tag>
  );
}

/** Thin gold line drawing: a quarter circle and a diagonal stroke. */
export function LineArt({ className = "", variant = "arc" }: { className?: string; variant?: "arc" | "arrow" }) {
  const [ref, inView] = useInView<SVGSVGElement>(0.2);
  if (variant === "arrow") {
    return (
      <svg
        ref={ref}
        viewBox="0 0 120 80"
        fill="none"
        className={`draw ${inView ? "is-in" : ""} ${className}`}
        aria-hidden="true"
      >
        <path d="M4 30 L116 30 L96 6" stroke="currentColor" strokeWidth="1.2" />
        <path d="M116 50 L4 50 L24 74" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }
  return (
    <svg
      ref={ref}
      viewBox="0 0 160 160"
      fill="none"
      className={`draw ${inView ? "is-in" : ""} ${className}`}
      aria-hidden="true"
    >
      <path d="M10 40 L10 150 L120 150 A110 110 0 0 0 10 40" stroke="currentColor" strokeWidth="1.2" />
      <path d="M60 4 L150 4 L60 100" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/** Gold pill + round arrow button pair, as in the reference. */
export function PillButton({
  href,
  children,
  dark = false,
  as: Tag = "a",
  type,
  disabled = false,
}: {
  href?: string;
  children: ReactNode;
  dark?: boolean;
  as?: "a" | "button";
  type?: "submit" | "button";
  disabled?: boolean;
}) {
  const props = Tag === "a" ? { href } : { type, disabled };
  return (
    <Tag
      {...props}
      className={`group inline-flex items-center gap-1.5 ${disabled ? "pointer-events-none opacity-60" : ""}`}
    >
      <span
        className={`rounded-full px-6 py-3.5 text-[15px] font-medium wide transition-colors ${
          dark ? "bg-night text-snow group-hover:bg-night-2" : "bg-gold text-night group-hover:bg-snow"
        }`}
      >
        {children}
      </span>
      <span
        className={`grid size-[50px] place-items-center rounded-full transition-transform group-hover:rotate-45 ${
          dark ? "bg-night text-gold" : "bg-gold text-night"
        }`}
        aria-hidden="true"
      >
        <ArrowUpRight size={20} />
      </span>
    </Tag>
  );
}

/** Small "0.1 / About" style section marker. */
export function Marker({ index, label, dark = false }: { index: string; label: string; dark?: boolean }) {
  return (
    <p className={`flex items-center gap-3 text-sm ${dark ? "text-mute-dark" : "text-mute"}`}>
      <span className="h-px w-8 bg-gold" aria-hidden="true" />
      {index} / {label}
    </p>
  );
}
