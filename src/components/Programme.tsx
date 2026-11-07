"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { phases } from "@/lib/content";
import { Marker, RiseHeading } from "./ui";

/** The 8 weeks as an interactive list: the open phase turns gold and shows its detail. */
export function Programme() {
  const [open, setOpen] = useState(0);
  return (
    <section id="programme" data-theme="dark" className="bg-night py-24 text-snow sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <Marker index="0.2" label="Programme" dark />
            <RiseHeading lines={["The 8 weeks"]} className="mt-6 text-5xl sm:text-7xl lg:text-8xl" />
          </div>
          <p className="max-w-xs text-mute-dark">
            Personal 1:1 live sessions, one hour each, with an expert mentor guiding every step.
          </p>
        </div>

        <ol className="mt-14 border-t border-rule-dark">
          {phases.map((p, i) => {
            const isOpen = open === i;
            return (
              <li key={p.title} className="border-b border-rule-dark">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`phase-${i}`}
                  // Click (and Enter/Space) only. Opening on hover made the
                  // list shift under the cursor as it crossed the page.
                  onClick={() => setOpen(open === i ? -1 : i)}
                  className={`grid w-full grid-cols-[1fr_auto] items-center gap-4 px-4 py-6 text-left transition-colors sm:px-6 md:grid-cols-[1.4fr_0.4fr_1fr] ${
                    isOpen ? "bg-gold text-night" : "hover:bg-night-2"
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <span className="wide text-xl font-light sm:text-3xl">{p.title}</span>
                    <ArrowRight
                      size={20}
                      className={`hidden shrink-0 transition-opacity sm:block ${isOpen ? "opacity-100" : "opacity-0"}`}
                      aria-hidden="true"
                    />
                  </span>
                  <span className={`text-sm ${isOpen ? "text-night" : "text-mute-dark"}`}>{p.weeks}</span>
                  <span className="hidden flex-wrap justify-end gap-1.5 md:flex">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className={`rounded-full border px-3 py-1 text-xs ${
                          isOpen ? "border-night/40" : "border-rule-dark text-mute-dark"
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </span>
                </button>
                <div
                  id={`phase-${i}`}
                  className={`grid transition-[grid-template-rows] duration-500 ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-xl px-4 py-6 text-lg leading-relaxed text-mute-dark sm:px-6">{p.detail}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
