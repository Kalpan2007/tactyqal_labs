"use client";

import { AppScreen } from "./AppScreen";
import { LineArt, Marker, useInView } from "./ui";

const WORD = "Tactyqal";

export function About() {
  const [ref, inView] = useInView<HTMLParagraphElement>(0.3);
  return (
    <section id="about" data-theme="light" className="overflow-hidden bg-snow py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-10">
        <p
          ref={ref}
          className={`wordmark display text-[18vw] leading-[0.85] whitespace-nowrap lg:text-[15rem] ${inView ? "is-in" : ""}`}
          aria-hidden="true"
        >
          {WORD.split("").map((ch, i) => (
            <span key={i} style={{ transitionDelay: `${i * 0.06}s` }}>
              {ch}
            </span>
          ))}
        </p>

        <div className="mt-16 grid gap-12 lg:grid-cols-[0.8fr_1fr_0.6fr]">
          <div>
            <Marker index="0.1" label="About" />
            <h2 className="wide mt-6 max-w-sm text-2xl leading-snug font-light">
              We help young builders turn ideas into real-world products.
            </h2>
            <LineArt className="mt-12 hidden w-40 text-gold lg:block" />
          </div>

          <div>
            <AppScreen project={{ name: "KrishiDrishti", category: "AgriTech" }} variant={0} className="h-64 w-full" />
            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              <div>
                <p className="flex items-center gap-3 font-medium">
                  <span className="h-px w-8 bg-gold" aria-hidden="true" />
                  Our mission
                </p>
                <p className="mt-3 leading-relaxed text-mute">
                  Through mentoring and product development, we take aspiring entrepreneurs from ideation and
                  prototyping all the way to building and launching a working product.
                </p>
              </div>
              <div>
                <p className="flex items-center gap-3 font-medium">
                  <span className="h-px w-8 bg-gold" aria-hidden="true" />
                  Who it’s for
                </p>
                <p className="mt-3 leading-relaxed text-mute">
                  Teens with an idea and the drive to build it. No coding background is needed, only curiosity and
                  the will to see it through.
                </p>
              </div>
            </div>
          </div>

          <figure className="self-end border-l border-gold pl-6">
            <blockquote className="wide text-lg leading-snug font-light">
              “Learn to sell. Learn to build. If you can do both, you will be unstoppable.”
            </blockquote>
            <figcaption className="mt-3 text-sm text-mute">Naval Ravikant</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
