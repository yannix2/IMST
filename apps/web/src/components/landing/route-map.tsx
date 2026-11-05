// Client code: rendered only inside LevelsExplorer (a client component), so no entry directive.
import { useEffect, useMemo, useRef, useState } from "react";
import { SchoolIcon } from "lucide-react";
import { localeDirection, type Locale } from "@maarif/contracts/locales";
import { campusOfGrade, gradeAges, grades, levelOfGrade, type Grade, type Level } from "@maarif/contracts/school";
import { messages } from "@/i18n/messages";
import { cn } from "@/lib/utils";

// The child's route from age 4 to 18 as one metro line that changes colour at each level and
// steps up a lane at 5 and at 11, across the two campus zones (Le Kram to Year 9, Charguia 2
// from Year 10). The line draws itself towards the pointer and follows it; on phones it turns
// vertical and draws as the page scrolls. Every station is a button; choosing one lights it,
// marks "You are here" and prefills the visit booking. The drawing is written straight to the
// SVG each frame (no React state per frame); under reduced motion it jumps to its target.

type Orient = "h" | "v";
type Pt = [number, number];

const AGE0 = 4;
const AGE1 = 18;
const lineColour: Record<Level, string> = {
  kindergarten: "var(--level-kindergarten)",
  primary: "var(--level-primary)",
  secondary: "var(--level-secondary)",
};
const lane: Record<Level, number> = { kindergarten: 0, primary: 1, secondary: 2 };
const order: Level[] = ["kindergarten", "primary", "secondary"];
const bounds: Record<Level, [number, number]> = { kindergarten: [4, 5], primary: [5, 11], secondary: [11, 18] };

const geometry = {
  h: { w: 1200, h: 360, lo: 70, hi: 1130, lane: (l: number) => 268 - l * 58, bend: 29, gap: 0 },
  // Phones: a gap at age 14 leaves room for the Charguia 2 sign between Year 9 and Year 10.
  v: { w: 360, h: 1110, lo: 110, hi: 990, lane: (l: number) => 84 + l * 52, bend: 26, gap: 60 },
} as const;

function layout(orient: Orient, rtl: boolean) {
  const g = geometry[orient];
  const scale = (g.hi - g.lo) / (AGE1 - AGE0);
  const along = (age: number) => g.lo + (age - AGE0) * scale + (age >= 14 ? g.gap : 0);
  const flip = (x: number) => (rtl ? g.w - x : x);
  const at = (age: number, l: number): Pt => (orient === "h" ? [flip(along(age)), g.lane(l)] : [flip(g.lane(l)), along(age)]);
  // Each level's stretch: from the middle of the bend that enters it to the middle of the one
  // that leaves it, so the three stretches join into one route.
  const segments = order.map((level, i) => {
    const [a0, a1] = bounds[level];
    const d = g.bend / scale;
    const pts: Pt[] = [];
    if (i > 0) pts.push(at(a0, i - 0.5), at(a0 + d, i));
    else pts.push(at(a0, i));
    if (i < order.length - 1) pts.push(at(a1 - d, i), at(a1, i + 0.5));
    else pts.push(at(a1, i));
    return { level, pts };
  });
  return { g, along, at, segments, scale };
}

const len = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const total = (pts: Pt[]) => pts.slice(1).reduce((s, p, i) => s + len(pts[i]!, p), 0);
const toPath = (pts: Pt[]) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");

/** Length along `pts` up to the point whose coordinate on the age axis reaches `target`. */
function lengthTo(pts: Pt[], axis: 0 | 1, target: number, rising: boolean): { length: number; point: Pt } {
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!, b = pts[i]!;
    const past = rising ? b[axis] >= target : b[axis] <= target;
    if (past) {
      const span = b[axis] - a[axis];
      const t = span === 0 ? 1 : Math.min(1, Math.max(0, (target - a[axis]) / span));
      return { length: acc + len(a, b) * t, point: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t] };
    }
    acc += len(a, b);
  }
  return { length: acc, point: pts[pts.length - 1]! };
}

const mid = (g: Grade) => (gradeAges[g][0] + gradeAges[g][1]) / 2;

type Props = { locale: Locale; grade: Grade | null; onChoose: (grade: Grade) => void };

function RouteDrawing({ orient, locale, grade, onChoose }: Props & { orient: Orient }) {
  const t = messages[locale];
  const rtl = localeDirection[locale] === "rtl";
  const { g, along, at, segments, scale } = useMemo(() => layout(orient, rtl), [orient, rtl]);
  const host = useRef<HTMLDivElement>(null);
  const lines = useRef<(SVGPathElement | null)[]>([]);
  const head = useRef<SVGCircleElement>(null);
  const stations = useRef<(HTMLButtonElement | null)[]>([]);
  const [hover, setHover] = useState<Grade | null>(null);
  const restAge = grade ? mid(grade) : AGE1;
  const rest = useRef(restAge);
  rest.current = restAge;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const axis = orient === "h" ? 0 : 1;
    const rising = orient === "v" || !rtl;
    const lengths = segments.map((s) => total(s.pts));
    let current = still ? rest.current : AGE0;
    let target = current;
    let pointing = false;
    let seen = false;
    let raf = 0;

    const paint = (age: number) => {
      const coord = orient === "h" ? at(age, 0)[0] : along(age);
      let tip: Pt | null = null;
      segments.forEach((s, i) => {
        const path = lines.current[i];
        if (!path) return;
        const [a0, a1] = bounds[s.level];
        const full = lengths[i]!;
        let drawn = 0;
        if (age >= a1) drawn = full;
        else if (age > a0 || i === 0) {
          const r = lengthTo(s.pts, axis, coord, rising);
          drawn = r.length;
          tip = r.point;
        }
        path.style.strokeDasharray = `${full} ${full}`;
        path.style.strokeDashoffset = String(full - drawn);
      });
      if (!tip) tip = segments[2]!.pts[segments[2]!.pts.length - 1]!;
      const end = tip as Pt;
      head.current?.setAttribute("cx", end[0].toFixed(1));
      head.current?.setAttribute("cy", end[1].toFixed(1));
      stations.current.forEach((b, i) => b?.toggleAttribute("data-reached", mid(grades[i]!) <= age + 0.01));
    };

    const tick = () => {
      raf = 0;
      current += (target - current) * 0.14;
      if (Math.abs(target - current) < 0.004) current = target;
      paint(current);
      if (current !== target) raf = requestAnimationFrame(tick);
    };
    const go = (age: number) => {
      target = Math.min(AGE1, Math.max(AGE0, age));
      if (still) {
        current = target;
        paint(current);
      } else if (!raf) raf = requestAnimationFrame(tick);
    };
    const ageAtPointer = (event: PointerEvent) => {
      const box = el.getBoundingClientRect();
      const frac = orient === "h" ? (event.clientX - box.left) / box.width : (event.clientY - box.top) / box.height;
      const svgCoord = frac * (orient === "h" ? g.w : g.h);
      const c = orient === "h" && rtl ? g.w - svgCoord : svgCoord;
      const raw = AGE0 + (c - g.lo) / scale;
      return orient === "v" && raw > 14 ? Math.max(14, AGE0 + (c - g.lo - g.gap) / scale) : raw;
    };
    const nearest = (age: number) => {
      let best: Grade | null = null, gap = 0.55;
      for (const gr of grades) {
        const d = Math.abs(mid(gr) - age);
        if (d < gap) { gap = d; best = gr; }
      }
      return best;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" && orient === "v") return;
      pointing = true;
      const age = ageAtPointer(event);
      setHover(nearest(age));
      go(age);
    };
    const onLeave = () => {
      pointing = false;
      setHover(null);
      go(rest.current);
    };
    // Phones: the line draws as the map travels up the screen.
    const onScroll = () => {
      if (orient !== "v" || pointing) return;
      const box = el.getBoundingClientRect();
      const frac = (innerHeight * 0.72 - box.top) / box.height;
      go(Math.min(rest.current, AGE0 + frac * (AGE1 - AGE0) + 0.4));
    };
    // The one authored entrance: the first time the map is seen, the route draws to its rest.
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || seen) return;
        seen = true;
        if (orient === "v") onScroll();
        else go(rest.current);
      },
      { threshold: 0.35 },
    );

    paint(current);
    watch.observe(el);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    (el as HTMLDivElement & { __rest?: () => void }).__rest = () => !pointing && go(rest.current);
    return () => {
      watch.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [orient, rtl, segments, at, along, g, scale]);

  // A new choice moves the resting point of the drawing.
  useEffect(() => {
    (host.current as (HTMLDivElement & { __rest?: () => void }) | null)?.__rest?.();
  }, [restAge]);

  const pct = (p: Pt) => ({ left: `${(p[0] / g.w) * 100}%`, top: `${(p[1] / g.h) * 100}%` });
  const split = 14; // Le Kram to Year 9 (ages 4 to 14), Charguia 2 from Year 10.
  const zone = (from: number, to: number) => {
    if (orient === "h") {
      const x0 = at(from, 0)[0], x1 = at(to, 0)[0];
      return { x: Math.min(x0, x1), y: 26, w: Math.abs(x1 - x0), h: g.h - 52 };
    }
    // Phones: Charguia 2 starts right after Year 9, so its sign sits in the gap above Year 10.
    const y0 = from >= 14 ? g.lo + (14 - AGE0) * scale + 6 : along(from);
    return { x: 14, y: y0, w: g.w - 28, h: along(to) - y0 };
  };
  const zones = [
    { key: "schools" as const, box: zone(AGE0 - 0.62, split - 0.06) },
    { key: "highSchool" as const, box: zone(split + 0.06, AGE1 + 0.62) },
  ];

  return (
    <div
      ref={host}
      className="relative w-full touch-pan-y select-none"
      style={{ aspectRatio: `${g.w} / ${g.h}` }}
      // The drawing is decoration; the stations below carry the content.
    >
      <svg viewBox={`0 0 ${g.w} ${g.h}`} aria-hidden="true" className="absolute inset-0 size-full overflow-visible">
        {zones.map(({ key, box }) => (
          <rect key={key} x={box.x} y={box.y} width={box.w} height={box.h} rx={28} className="fill-mist stroke-rule" strokeWidth={1} />
        ))}
        {/* The whole route, faint: where the line will go. */}
        {segments.map((s) => (
          <path key={`track-${s.level}`} d={toPath(s.pts)} fill="none" className="stroke-rule" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {segments.map((s, i) => (
          <path
            key={s.level}
            ref={(node) => {
              lines.current[i] = node;
            }}
            d={toPath(s.pts)}
            fill="none"
            stroke={lineColour[s.level]}
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        <circle ref={head} r={9} className="fill-turquoise stroke-ground" strokeWidth={4} />
      </svg>

      {zones.map(({ key, box }) => {
        const anchor: Pt = [box.x + (rtl ? box.w - 16 : 16), box.y + (orient === "h" ? 16 : 8)];
        return (
          <div
            key={key}
            className={cn("pointer-events-none absolute z-10 flex w-max items-center gap-2.5 rounded-[var(--radius-tile)] bg-surface py-1.5 ps-1.5 pe-3.5 whitespace-nowrap shadow-rest ring-1 ring-rule/70", rtl && "-translate-x-full")}
            style={pct(anchor)}
          >
            <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-[var(--radius-tile)] bg-navy text-white">
              <SchoolIcon className="size-5" strokeWidth={2} />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-bold text-heading">{key === "schools" ? t.campuses.schools : t.campuses.highSchool}</span>
              <span className="text-xs text-slate">
                {t.route.places[key]} · {t.route.campusLevels[key]}
              </span>
            </span>
          </div>
        );
      })}

      {grades.map((gr, i) => {
        const level = levelOfGrade(gr);
        const p = at(mid(gr), lane[level]);
        const here = grade === gr;
        const name = gr === "kg" ? t.grade("kg") : t.grade(Number(gr.slice(5)));
        const [a0, a1] = gradeAges[gr];
        const short = gr === "kg" ? t.levels.kindergarten : String(gr.slice(5));
        const labelSide = orient === "h" ? "top-full mt-1 -translate-x-1/2 left-1/2" : rtl ? "end-full me-2 top-1/2 -translate-y-1/2" : "start-full ms-2 top-1/2 -translate-y-1/2";
        return (
          <button
            key={gr}
            ref={(node) => {
              stations.current[i] = node;
            }}
            type="button"
            onClick={() => onChoose(gr)}
            onFocus={() => setHover(gr)}
            onBlur={() => setHover(null)}
            aria-pressed={here}
            aria-label={`${name}, ${t.levels.ages(a0, a1)}, ${t.campuses[campusOfGrade(gr)]}`}
            className="group absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
            style={{ ...pct(p), ["--line" as string]: lineColour[level] }}
          >
            <span
              aria-hidden="true"
              className={cn(
                "block rounded-full border-[3px] border-[color:var(--line)] bg-ground transition-[width,height,background-color,box-shadow] duration-300",
                "group-data-[reached]:bg-[color:var(--line)] group-hover:size-6",
                here ? "size-6 bg-turquoise! border-ground shadow-station" : "size-[18px]",
              )}
            />
            <span aria-hidden="true" className={cn("pointer-events-none absolute text-xs font-bold whitespace-nowrap text-slate tabular", labelSide)}>
              {orient === "h" ? short : name}
            </span>
            {here || hover === gr ? (
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute bottom-full mb-2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold shadow-station",
                  here ? "bg-turquoise text-night" : "bg-navy text-white",
                )}
              >
                {here ? `${t.station.youAreHere} · ${name}` : `${name} · ${t.levels.ages(a0, a1)}`}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function RouteMap(props: Props) {
  const t = messages[props.locale];
  return (
    <div role="group" aria-label={t.levels.title} className="flex flex-col gap-4">
      <div className="hidden md:block">
        <RouteDrawing {...props} orient="h" />
      </div>
      <div className="mx-auto w-full max-w-sm md:hidden">
        <RouteDrawing {...props} orient="v" />
      </div>
      {/* The three lines, named with their ages: the colour is never the only label. */}
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {order.map((level) => {
          const [a0, a1] = bounds[level];
          return (
            <li key={level} className="flex items-center gap-2.5">
              <span aria-hidden="true" className="h-2.5 w-7 rounded-full" style={{ background: lineColour[level] }} />
              <span className="font-bold text-heading">{t.levels[level]}</span>
              <span className="tabular text-sm text-slate">{t.levels.ages(a0, a1)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
