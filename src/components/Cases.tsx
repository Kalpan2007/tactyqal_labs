"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { projects } from "@/lib/content";
import { AppScreen } from "./AppScreen";
import { LineArt, Marker, RiseHeading } from "./ui";

/** Student projects as "cases": tabs on the left, the selected app on the right. */
export function Cases() {
  const [i, setI] = useState(0);
  const p = projects[i];
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  /**
   * Arrow keys move between tabs, Home/End jump to the ends. Combined with the
   * roving tabIndex below, this is the WAI-ARIA tabs pattern: one tab stop for
   * the whole set, then arrows to choose.
   */
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();

    const last = projects.length - 1;
    const next =
      event.key === "ArrowRight" ? (i === last ? 0 : i + 1)
      : event.key === "ArrowLeft" ? (i === 0 ? last : i - 1)
      : event.key === "Home" ? 0
      : last;

    setI(next);
    tabRefs.current[next]?.focus();
  }
  return (
    <section id="projects" data-theme="dark" className="bg-night pb-24 text-snow sm:pb-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-10">
        <div className="flex flex-wrap items-start justify-between gap-8 border-t border-rule-dark pt-24 sm:pt-32">
          <div>
            <Marker index="0.3" label="Student projects" dark />
            <div
              role="tablist"
              aria-label="Student projects"
              onKeyDown={onKeyDown}
              className="mt-6 flex max-w-xl flex-wrap gap-x-5 gap-y-2"
            >
              {projects.map((proj, idx) => (
                <button
                  key={proj.name}
                  type="button"
                  role="tab"
                  id={`tab-${idx}`}
                  ref={(el) => {
                    tabRefs.current[idx] = el;
                  }}
                  aria-selected={i === idx}
                  aria-controls="case-panel"
                  tabIndex={i === idx ? 0 : -1}
                  onClick={() => setI(idx)}
                  className={`border-b py-1 text-sm transition-colors ${
                    i === idx ? "border-gold text-snow" : "border-transparent text-mute-dark hover:text-snow"
                  }`}
                >
                  {proj.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-start gap-6">
            <RiseHeading lines={["Cases"]} className="text-6xl sm:text-8xl" />
            <div className="hidden pt-3 text-xs leading-relaxed text-mute-dark sm:block">
              <LineArt variant="arrow" className="mb-2 w-14 text-gold" />
              Built by students,
              <br />
              used by real people
            </div>
          </div>
        </div>

        <div
          id="case-panel"
          role="tabpanel"
          aria-labelledby={`tab-${i}`}
          tabIndex={0}
          className="mt-14 grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]"
        >
          <div key={p.name} className="animate-[fadein_.5s_ease]">
            <p className="text-sm text-gold">{p.category}</p>
            <h3 className="wide mt-3 text-3xl leading-tight font-light sm:text-4xl">{p.name}</h3>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-mute-dark">{p.summary}</p>
            <dl className="mt-8 grid max-w-md grid-cols-2 border-t border-rule-dark">
              {p.founder && (
                <div className="border-r border-rule-dark py-4 pr-4">
                  <dt className="text-xs text-mute-dark">Founder</dt>
                  <dd className="mt-1">{p.founder}</dd>
                </div>
              )}
              {p.result && (
                <div className="py-4 pl-4">
                  <dt className="text-xs text-mute-dark">Result</dt>
                  <dd className="mt-1 text-gold">{p.result}</dd>
                </div>
              )}
            </dl>
            <a href="#contact" className="group mt-8 inline-flex items-center gap-3 text-sm">
              Start a project like this
              <span className="relative h-px w-20 bg-gold transition-all group-hover:w-28" aria-hidden="true">
                <span className="absolute -top-[3px] right-0 h-px w-2 rotate-45 bg-gold" />
              </span>
            </a>
          </div>
          <AppScreen key={`s-${p.name}`} project={p} variant={i} className="aspect-[16/10] w-full" />
        </div>
      </div>
    </section>
  );
}
