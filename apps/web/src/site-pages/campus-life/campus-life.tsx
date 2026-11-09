import { ArrowUpRightIcon, CalendarDaysIcon, ClockIcon, MapPinIcon, UsersRoundIcon } from "lucide-react";
import type { AlbumSummary, NewsSummary } from "@maarif/contracts/content";
import type { Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { getAlbums, getClubs, getNewsPage, getTrips } from "@/lib/cms";
import { PageShell } from "@/components/site/page-shell";
import { PageSection } from "@/components/site/blocks";
import { Photo } from "@/components/site/photo";
import { RichText } from "@/components/site/rich-text";
import { EmptyState, formatDate, StageTags } from "@/components/site/cms-bits";
import { campusCopy, campusFigure } from "./copy";

// Campus life (wave 3, D2): every list comes from maarifcms through maarif-api, rendered on the
// server and refreshed when staff publish (ADR 007). Nothing is invented while a list is empty.

const base = (locale: Locale) => `/${locale}/campus-life`;
export const newsHref = (locale: Locale, slug: string) => `${base(locale)}/news/${slug}`;
export const albumHref = (locale: Locale, slug: string) => `${base(locale)}/gallery/${slug}`;

export function NewsCard({ locale, item }: { locale: Locale; item: NewsSummary }) {
  const c = campusCopy[locale];
  return (
    <a
      href={newsHref(locale, item.slug)}
      className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-plate)] bg-surface no-underline shadow-rest ring-1 ring-rule/70 transition-[box-shadow,translate] duration-200 hover:-translate-y-0.5 hover:shadow-rest-hover"
    >
      <span className="relative block aspect-[16/10] bg-turquoise-wash">
        {item.image ? (
          <Photo photo={item.image} locale={locale} decorative sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw" imgClassName="transition-transform duration-500 group-hover:scale-[1.03]" />
        ) : (
          <CalendarDaysIcon aria-hidden="true" className="absolute inset-0 m-auto size-12 text-heading/40" strokeWidth={1.5} />
        )}
      </span>
      <span className="flex flex-1 flex-col gap-2 p-6">
        <span className="text-sm font-medium text-turquoise-ink">
          <time dateTime={item.date}>{formatDate(locale, item.date)}</time>
        </span>
        <span className="font-heading text-xl font-bold text-balance text-heading">{item.title}</span>
        {item.summary ? <span className="line-clamp-3 text-slate">{item.summary}</span> : null}
        <span className="mt-auto inline-flex items-center gap-1 pt-2 font-medium text-turquoise-ink">
          {c.readMore}
          <ArrowUpRightIcon aria-hidden="true" className="size-4 rtl:-scale-x-100" />
        </span>
      </span>
    </a>
  );
}

function AlbumCard({ locale, album }: { locale: Locale; album: AlbumSummary }) {
  const c = campusCopy[locale];
  return (
    <a
      href={albumHref(locale, album.slug)}
      className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-[var(--radius-plate)] no-underline shadow-rest ring-1 ring-rule/70"
    >
      <Photo photo={album.cover} locale={locale} decorative sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw" imgClassName="transition-transform duration-500 group-hover:scale-[1.04]" />
      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/25 to-transparent" />
      <span className="relative flex flex-col gap-1 p-5 text-white">
        <span className="font-heading text-xl font-bold text-balance">{album.title}</span>
        <span className="text-sm text-on-plate-muted">
          {formatDate(locale, album.date)} Â· {c.photos(album.count)}
        </span>
      </span>
    </a>
  );
}

const grid = "grid gap-5 sm:grid-cols-2 lg:grid-cols-3";

function SeeAll({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="mt-8 inline-flex items-center gap-1 font-bold text-turquoise-ink">
      {label}
      <ArrowUpRightIcon aria-hidden="true" className="size-4 rtl:-scale-x-100" />
    </a>
  );
}

export async function CampusLifePage({ locale }: { locale: Locale }) {
  const c = campusCopy[locale];
  const [news, events, albums] = await Promise.all([getNewsPage(locale, "news", 1, false), getNewsPage(locale, "event", 1, true), getAlbums(locale)]);
  const latest = news?.items.slice(0, 3) ?? [];
  const upcoming = events?.items.slice(0, 3) ?? [];
  const someAlbums = (albums ?? []).slice(0, 3);
  return (
    <PageShell
      locale={locale}
      page="campus-life"
      lede={c.lede}
      figure={campusFigure(locale)}
      body={
        <>
          <PageSection id="news" title={c.latestNews}>
            {latest.length ? (
              <>
                <ul className={grid}>
                  {latest.map((item) => (
                    <li key={item.slug}>
                      <NewsCard locale={locale} item={item} />
                    </li>
                  ))}
                </ul>
                <SeeAll href={`${base(locale)}/news`} label={c.seeAll} />
              </>
            ) : (
              <EmptyState text={c.empty.news} socialLabel={c.social} />
            )}
          </PageSection>
          {upcoming.length ? (
            <PageSection id="events" tone="mist" title={c.upcoming}>
              <EventList locale={locale} items={upcoming} />
              <SeeAll href={`${base(locale)}/events`} label={c.seeAll} />
            </PageSection>
          ) : null}
          {someAlbums.length ? (
            <PageSection id="albums" title={c.albums}>
              <ul className={grid}>
                {someAlbums.map((album) => (
                  <li key={album.slug}>
                    <AlbumCard locale={locale} album={album} />
                  </li>
                ))}
              </ul>
              <SeeAll href={`${base(locale)}/gallery`} label={c.seeAll} />
            </PageSection>
          ) : null}
        </>
      }
    />
  );
}

function EventList({ locale, items }: { locale: Locale; items: NewsSummary[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => {
        const d = new Date(item.date);
        const day = new Intl.DateTimeFormat("en", { day: "2-digit", timeZone: "Africa/Tunis" }).format(d);
        const month = new Intl.DateTimeFormat(locale === "ar" ? "ar-TN-u-nu-latn" : locale, { month: "short", timeZone: "Africa/Tunis" }).format(d);
        return (
          <li key={item.slug}>
            <a
              href={newsHref(locale, item.slug)}
              className="group flex items-center gap-5 rounded-[var(--radius-plate)] bg-surface p-4 no-underline shadow-rest ring-1 ring-rule/70 transition-shadow hover:shadow-rest-hover sm:p-5"
            >
              <span className="grid size-16 shrink-0 place-items-center rounded-[var(--radius-tile)] bg-turquoise text-on-turquoise">
                <span className="flex flex-col items-center leading-none">
                  <span className="font-heading text-2xl font-bold tabular">{day}</span>
                  <span className="text-xs font-bold uppercase">{month}</span>
                </span>
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="font-heading text-lg font-bold text-heading">{item.title}</span>
                {item.summary ? <span className="line-clamp-2 text-slate">{item.summary}</span> : null}
              </span>
              <ArrowUpRightIcon aria-hidden="true" className="ms-auto size-5 shrink-0 text-turquoise-ink rtl:-scale-x-100" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export async function NewsListPage({ locale }: { locale: Locale }) {
  const c = campusCopy[locale];
  const news = await getNewsPage(locale, "news", 1, false);
  const items = news?.items ?? [];
  return (
    <PageShell
      locale={locale}
      page="campus-life/news"
      lede={c.ledes.news}
      figure={campusFigure(locale)}
      body={
        <PageSection id="news-list" tone="mist">
          {items.length ? (
            <ul className={grid}>
              {items.map((item) => (
                <li key={item.slug}>
                  <NewsCard locale={locale} item={item} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState text={c.empty.news} socialLabel={c.social} />
          )}
        </PageSection>
      }
    />
  );
}

export async function EventsPage({ locale }: { locale: Locale }) {
  const c = campusCopy[locale];
  const events = await getNewsPage(locale, "event", 1, true);
  const items = events?.items ?? [];
  return (
    <PageShell
      locale={locale}
      page="campus-life/events"
      lede={c.ledes.events}
      figure={campusFigure(locale)}
      body={
        <PageSection id="events-list" tone="mist">
          {items.length ? <EventList locale={locale} items={items} /> : <EmptyState text={c.empty.events} socialLabel={c.social} />}
        </PageSection>
      }
    />
  );
}

export async function GalleryPage({ locale }: { locale: Locale }) {
  const c = campusCopy[locale];
  const albums = (await getAlbums(locale)) ?? [];
  return (
    <PageShell
      locale={locale}
      page="campus-life/gallery"
      lede={c.ledes.gallery}
      figure={campusFigure(locale)}
      band={albums.length === 0}
      body={
        <PageSection id="albums-list" tone="mist">
          {albums.length ? (
            <ul className={grid}>
              {albums.map((album) => (
                <li key={album.slug}>
                  <AlbumCard locale={locale} album={album} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState text={c.empty.albums} socialLabel={c.social} />
          )}
        </PageSection>
      }
    />
  );
}

export async function ClubsPage({ locale }: { locale: Locale }) {
  const c = campusCopy[locale];
  const t = messages[locale];
  const clubs = (await getClubs(locale)) ?? [];
  return (
    <PageShell
      locale={locale}
      page="campus-life/clubs"
      lede={c.ledes.clubs}
      figure={campusFigure(locale)}
      body={
        <PageSection id="clubs-list" tone="mist">
          {clubs.length ? (
            <ul className="grid gap-5 lg:grid-cols-2">
              {clubs.map((club) => (
                <li key={club.slug} id={club.slug} className="flex scroll-mt-24 flex-col overflow-hidden rounded-[var(--radius-plate)] bg-surface shadow-rest ring-1 ring-rule/70 sm:flex-row">
                  {club.photo ? (
                    <div className="relative aspect-[4/3] sm:aspect-auto sm:w-2/5 sm:shrink-0">
                      <Photo photo={club.photo} locale={locale} sizes="(min-width: 1024px) 20vw, (min-width: 640px) 40vw, 92vw" />
                    </div>
                  ) : null}
                  <div className="flex flex-col gap-3 p-6">
                    <h2 className="font-heading text-2xl font-bold text-heading">{club.name}</h2>
                    <StageTags locale={locale} list={club.stages} />
                    {club.summary ? <p className="text-slate">{club.summary}</p> : null}
                    <dl className="flex flex-col gap-1.5 text-ink">
                      {club.schedule ? (
                        <div className="flex items-start gap-2">
                          <dt className="sr-only">{c.schedule}</dt>
                          <ClockIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-turquoise-ink" />
                          <dd>{club.schedule}</dd>
                        </div>
                      ) : null}
                      {club.campus ? (
                        <div className="flex items-start gap-2">
                          <dt className="sr-only">{c.where}</dt>
                          <MapPinIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-turquoise-ink" />
                          <dd>{t.route.places[club.campus as keyof typeof t.route.places] ?? club.campus}</dd>
                        </div>
                      ) : null}
                      {club.partner ? (
                        <div className="flex items-start gap-2">
                          <dt className="sr-only">{c.partner}</dt>
                          <UsersRoundIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-turquoise-ink" />
                          <dd>{club.partner}</dd>
                        </div>
                      ) : null}
                    </dl>
                    <RichText blocks={club.body} className="text-base" />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState text={c.empty.clubs} socialLabel={c.social} />
          )}
        </PageSection>
      }
    />
  );
}

export async function TripsPage({ locale }: { locale: Locale }) {
  const c = campusCopy[locale];
  const trips = (await getTrips(locale)) ?? [];
  return (
    <PageShell
      locale={locale}
      page="campus-life/trips"
      lede={c.ledes.trips}
      figure={campusFigure(locale)}
      body={
        <PageSection id="trips-list" tone="mist">
          {trips.length ? (
            <ul className={grid}>
              {trips.map((trip) => (
                <li key={trip.slug} className="flex flex-col overflow-hidden rounded-[var(--radius-plate)] bg-surface shadow-rest ring-1 ring-rule/70">
                  {trip.photo ? (
                    <div className="relative aspect-[16/10]">
                      <Photo photo={trip.photo} locale={locale} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw" />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <h2 className="font-heading text-xl font-bold text-heading">{trip.destination}</h2>
                    {trip.place ? (
                      <p className="flex items-center gap-2 text-slate">
                        <MapPinIcon aria-hidden="true" className="size-4 shrink-0 text-turquoise-ink" />
                        {trip.place}
                      </p>
                    ) : null}
                    <StageTags locale={locale} list={trip.stages} />
                    {trip.summary ? <p className="text-ink">{trip.summary}</p> : null}
                    {trip.lastVisit ? (
                      <p className="mt-auto text-sm text-slate">
                        {c.lastVisit}: {formatDate(locale, trip.lastVisit)}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState text={c.empty.trips} socialLabel={c.social} />
          )}
        </PageSection>
      }
    />
  );
}

export const descriptions = {
  overview: (locale: Locale) => campusCopy[locale].lede,
  news: (locale: Locale) => campusCopy[locale].ledes.news,
  events: (locale: Locale) => campusCopy[locale].ledes.events,
  gallery: (locale: Locale) => campusCopy[locale].ledes.gallery,
  clubs: (locale: Locale) => campusCopy[locale].ledes.clubs,
  trips: (locale: Locale) => campusCopy[locale].ledes.trips,
};
