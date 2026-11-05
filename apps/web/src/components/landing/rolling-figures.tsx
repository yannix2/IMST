"use client";

import { useEffect, useRef } from "react";

// The school's figures as small sign plates. Each digit is an odometer wheel: once the row is
// seen the wheels spin up to their value, and while the row stays on screen one figure rolls
// over again every few seconds, so the numbers catch the eye without moving all the time.
// No library: CSS translate per digit (globals.css, .digit-col). Without JavaScript or under
// reduced motion the values simply show.

type Figure = { value: string; label: string };

function Digits({ text, index }: { text: string; index: number }) {
  let d = 0;
  // Each number is one left-to-right run of wheels, so "64" never reads "46" in Arabic; the
  // words between numbers ("to", "إلى") keep the page's direction.
  return (
    <>
      {text.split(/(\d+)/).map((part, i) =>
        /^\d+$/.test(part) ? (
          <span key={i} dir="ltr" className="inline-flex">
            {[...part].map((ch, j) => {
              const delay = index * 120 + d++ * 90;
              return (
                <span key={j} className="digit-col">
                  <span className="digit-strip" style={{ "--d": Number(ch) + 10, "--delay": `${delay}ms` } as React.CSSProperties}>
                    {Array.from({ length: 20 }, (_, k) => (
                      <span key={k}>{k % 10}</span>
                    ))}
                  </span>
                </span>
              );
            })}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function RollingFigures({ figures, label }: { figures: Figure[]; label: string }) {
  const host = useRef<HTMLDListElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cols = () => [...el.querySelectorAll<HTMLElement>(".digit-col")];
    if (still) {
      cols().forEach((c) => c.setAttribute("data-ready", ""));
      return;
    }
    let timer = 0;
    let turn = 0;
    // Roll one figure over: snap its wheels back one turn without animation, then spin forward.
    const roll = () => {
      const plates = [...el.querySelectorAll<HTMLElement>("[data-figure]")];
      const plate = plates[turn++ % plates.length];
      plate?.querySelectorAll<HTMLElement>(".digit-strip").forEach((strip) => {
        const d = Number(strip.style.getPropertyValue("--d"));
        strip.setAttribute("data-snap", "");
        strip.style.setProperty("--d", String(d - 10));
        strip.style.setProperty("--delay", "0ms");
        void strip.offsetHeight;
        strip.removeAttribute("data-snap");
        strip.style.setProperty("--d", String(d));
      });
    };
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          cols().forEach((c) => c.setAttribute("data-ready", ""));
          window.clearInterval(timer);
          timer = window.setInterval(roll, 4200);
        } else {
          window.clearInterval(timer);
        }
      },
      { threshold: 0.6 },
    );
    watch.observe(el);
    return () => {
      watch.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  return (
    <dl ref={host} aria-label={label} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {figures.map((item, i) => (
        <div
          key={item.label}
          data-figure
          className="flex flex-col gap-1.5 rounded-[var(--radius-tile)] bg-surface p-4 shadow-rest ring-1 ring-rule/70"
        >
          <dt className="order-2 text-sm leading-snug text-slate">{item.label}</dt>
          <dd className="tabular font-heading order-1 text-3xl leading-none font-bold whitespace-nowrap text-heading">
            <span className="sr-only">{item.value}</span>
            <span aria-hidden="true">
              <Digits text={item.value} index={i} />
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
