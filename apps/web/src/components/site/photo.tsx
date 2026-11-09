import type { Locale } from "@maarif/contracts/locales";
import { mediaWidths, type SitePhoto } from "@maarif/contracts/content";
import { photos, type PhotoId } from "@/content/media";
import { cn } from "@/lib/utils";

// One photo, as <picture>: AVIF with a WebP fallback, sized for the layout (`sizes`), cropped on
// its subject (object-position), on a placeholder so nothing moves when it arrives (CLS 0).
// Server component, no JavaScript.
//
// Two sources (wave 3, owner decision 2026-11-09: every photo is managed in maarifcms):
//  - a CMS photo (SitePhoto from lib/cms.ts): resized by maarif-api (?w=&f=, Cloudflare Images);
//  - a built-in photo id (content/media.ts, wave 2): the fallback while maarifcms has none.
// The box is sized by the parent (`fill`, the default) or by the photo's own ratio (`fill={false}`).

type Source = SitePhoto | PhotoId;

type Props = {
  photo: Source;
  locale: Locale;
  /** Layout width hint, e.g. "(min-width: 1024px) 25vw, 80vw". */
  sizes: string;
  className?: string;
  imgClassName?: string;
  fill?: boolean;
  priority?: boolean;
  /** Decorative use (the words around it say it all): empty alt. */
  decorative?: boolean;
};

type Resolved = { avif: string; webp: string; fallback: string; width: number; height: number; alt: string; focus: readonly [number, number]; blur: string | null };

function resolve(source: Source, locale: Locale): Resolved {
  if (typeof source === "string") {
    const p = photos[source];
    const set = (ext: string) => p.widths.map((w) => `/media/photos/${p.id}-${w}.${ext} ${w}w`).join(", ");
    return {
      avif: set("avif"),
      webp: set("webp"),
      fallback: `/media/photos/${p.id}-${p.widths[p.widths.length - 1]}.webp`,
      width: p.width,
      height: p.height,
      alt: p.alt[locale],
      focus: [p.focus[0] * 100, p.focus[1] * 100],
      blur: p.blur,
    };
  }
  // Never ask for a size larger than the original.
  const widths = mediaWidths.filter((w, i) => i === 0 || !source.width || w <= source.width);
  const set = (f: string) => widths.map((w) => `${source.src}?w=${w}&f=${f} ${w}w`).join(", ");
  return {
    avif: set("avif"),
    webp: set("webp"),
    fallback: `${source.src}?w=${widths[widths.length - 1]}&f=webp`,
    width: source.width ?? 1600,
    height: source.height ?? 1067,
    alt: source.alt,
    focus: source.focus,
    blur: null,
  };
}

export function Photo({ photo, locale, sizes, className, imgClassName, fill = true, priority = false, decorative = false }: Props) {
  const p = resolve(photo, locale);
  return (
    <picture
      className={cn("block overflow-hidden bg-mist bg-cover bg-center", fill ? "absolute inset-0" : "relative", className)}
      style={{ backgroundImage: p.blur ? `url("${p.blur}")` : undefined, aspectRatio: fill ? undefined : `${p.width} / ${p.height}` }}
    >
      <source type="image/avif" srcSet={p.avif} sizes={sizes} />
      <img
        src={p.fallback}
        srcSet={p.webp}
        sizes={sizes}
        width={p.width}
        height={p.height}
        alt={decorative ? "" : p.alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={cn("size-full object-cover", imgClassName)}
        style={{ objectPosition: `${p.focus[0]}% ${p.focus[1]}%` }}
      />
    </picture>
  );
}

/** A page slot's photo: the CMS one when published, else the built-in fallback (or nothing). */
export function slotPhoto(visual: { slots: Record<string, SitePhoto> } | null | undefined, slot: string, fallback?: PhotoId): Source | null {
  return visual?.slots[slot] ?? fallback ?? null;
}
