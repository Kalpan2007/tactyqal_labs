import Link from "next/link";
import { Check } from "lucide-react";
import { heroPoints, pricing, projects, stats } from "@/lib/content";
import { AppScreen } from "./AppScreen";
import { LineArt, PillButton, RiseHeading } from "./ui";

export function Hero() {
  const strip = [...projects, ...projects];

  return (
    <section id="top" data-theme="dark" className="relative overflow-hidden bg-night pt-[72px] text-snow">
      <div className="mx-auto max-w-7xl px-5 pt-14 sm:px-10 sm:pt-20">
        {/*
          The right column used to be empty at desktop widths, which read as a
          layout bug. It now carries the proof points and the price, so the
          headline is balanced and the offer is visible without scrolling.
        */}
        <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16">
          <div className="@container min-w-0">
            <p className="flex items-center gap-3 text-sm text-mute-dark">
              <span className="h-px w-8 bg-gold" aria-hidden="true" />
              1:1 startup mentoring for teens
            </p>

            {/*
              Sized against its own column, not the viewport, so the longest
              line ("Your teen builds") can never wrap at any width. 12.9cqw is
              the measured ratio of that line's width to the column it sits in.
            */}
            <RiseHeading
              as="h1"
              lines={["Your teen builds", "a real app", "in 8 weeks."]}
              className="mt-7 text-[min(12.9cqw,5.25rem)]"
            />

            <p className="mt-8 max-w-lg text-lg leading-relaxed text-mute-dark">
              From a first idea to a launched product, guided by one mentor the whole way. No prior coding needed.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
              <PillButton href="#contact">Book a free consultation</PillButton>
              <Link
                href="#projects"
                className="group inline-flex items-center gap-3 text-sm text-mute-dark transition-colors hover:text-snow"
              >
                See what students built
                <span className="h-px w-12 bg-gold transition-all group-hover:w-20" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="lg:pb-2">
            <ul className="border-t border-rule-dark">
              {heroPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 border-b border-rule-dark py-3.5 text-[15px]">
                  <Check size={16} className="mt-1 shrink-0 text-gold" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-end justify-between gap-5">
              <p>
                <span className="block text-xs text-mute-dark">8-week programme, limited-time price</span>
                <span className="mt-2 flex items-baseline gap-3">
                  <span className="display text-4xl text-gold sm:text-5xl">{pricing.price}</span>
                  <span className="text-base text-mute-dark line-through">{pricing.was}</span>
                </span>
              </p>
              <LineArt variant="arrow" className="hidden w-20 shrink-0 text-gold sm:block" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 grid max-w-7xl gap-10 px-5 pb-16 sm:mt-20 sm:px-10 lg:grid-cols-[0.3fr_1fr] lg:items-end">
        <dl className="grid grid-cols-3 gap-6 lg:grid-cols-1 lg:gap-5">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse">
              <dt className="text-xs text-mute-dark">{s.label}</dt>
              <dd className="wide text-2xl font-light sm:text-3xl">{s.value}</dd>
            </div>
          ))}
        </dl>

        {/*
          Bleeds to the right edge of the viewport. `100vw` would include the
          scrollbar and push the page sideways, so the container's own box is
          measured instead via a right margin that only ever pulls outward.
        */}
        <div className="-mr-5 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%)] sm:-mr-10">
          <ul className="marquee flex w-max gap-3" aria-label="Apps built by students">
            {strip.map((p, i) => (
              <li key={`${p.name}-${i}`} aria-hidden={i >= projects.length ? "true" : undefined}>
                <AppScreen project={p} variant={i} className="h-44 w-72 sm:h-52 sm:w-80" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
