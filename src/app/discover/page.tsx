"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, Compass, ExternalLink, Eye, MapPin, Search, UtensilsCrossed } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import PillGroup from "@/components/pill-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSelector } from "@/hooks/redux";
import { useDebounce } from "@/hooks/use-debounce";
import { selectIsAuthenticated } from "@/store/selectors";
import { eventPriceFrom, useDiscover } from "@/hooks/use-discover";
import { getPlaceType } from "@/app/(dashboard)/apps-tools/places/_utils";
import { publicEventUrl, publicHomeUrl, publicPlaceUrl, publicRestaurantUrl } from "@/lib/public-links";
import { fmtDateTime, formatNaira } from "@/utils";

const ALL = "All";

const SectionTitle = ({ children, count }: { children: React.ReactNode; count?: number }) => (
  <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-foreground">
    <span className="h-5 w-1 rounded-full bg-primary" /> {children}
    {!!count && <span className="text-sm font-medium text-muted-foreground">({count.toLocaleString()})</span>}
  </h2>
);

/** Listing photo from any host (merchant uploads aren't all on the allow-listed image domains). */
function Cover({ src, className }: { src?: string | null; className?: string }) {
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" loading="lazy" className={className ?? "absolute inset-0 h-full w-full object-cover"} />;
}

const cardClass =
  "group block overflow-hidden rounded-3xl border bg-card text-left shadow-sm transition-shadow hover:shadow-xl hover:shadow-primary/10";

function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-60 rounded-3xl" />
      ))}
    </div>
  );
}

const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">{children}</p>
);

export default function DiscoverPage() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState(ALL);
  const search = useDebounce(query, 400);
  const { places, placesTotal, events, eventsTotal, restaurants, cities, isLoading } = useDiscover({
    search,
    city: city === ALL ? "" : city,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/discover" aria-label="SpinStrip Discover">
            <Image src="/logo.svg" alt="SpinStrip" width={76} height={30} className="h-[30px] w-[76px]" />
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle className="rounded-full" />
            <Link
              href={isAuthenticated ? "/" : "/login"}
              className="brand-gradient inline-flex min-h-[40px] items-center rounded-full px-5 text-xs font-semibold text-white"
            >
              {isAuthenticated ? "Back to Dashboard" : "Merchant Login"}
            </Link>
          </div>
        </div>
      </header>

      <div className="brand-gradient relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="relative mx-auto max-w-5xl px-4 py-14 md:py-20">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl font-extrabold text-white md:text-6xl"
          >
            Discover what
            <br />
            moves you.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-3 max-w-md text-sm text-white/85 md:text-base"
          >
            Places, events and restaurants near you — all on SpinStrip.
          </motion.p>
          <motion.label
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex max-w-md items-center gap-2 rounded-full bg-white px-4 shadow-lg shadow-black/10"
          >
            <Search className="h-4 w-4 shrink-0 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search places, events, dishes…"
              aria-label="Search Discover"
              className="h-12 w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
          </motion.label>
          <a
            href={publicHomeUrl()}
            target="_blank"
            rel="noopener"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white"
          >
            <Compass className="h-4 w-4" /> Open places.spinstrip.com <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 pb-24">
        {cities.length > 0 && (
          <div className="mb-8">
            <PillGroup<string> options={[ALL, ...cities]} value={city} onChange={setCity} />
          </div>
        )}

        <SectionTitle count={placesTotal}>Places</SectionTitle>
        {isLoading ? (
          <CardGridSkeleton />
        ) : places.length === 0 ? (
          <Empty>No places match your search.</Empty>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((p, i) => (
              <motion.a
                key={p.id}
                href={publicPlaceUrl(p.id)}
                target="_blank"
                rel="noopener"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cardClass}
              >
                <div className="brand-gradient relative h-36">
                  <Cover src={p.coverImage || p.images?.[0]} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold text-white backdrop-blur">
                    {getPlaceType(p.placeType) ?? p.metadata?.businessCategory ?? "Place"}
                  </span>
                  <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 text-xs text-white/90">
                    <Eye className="h-3.5 w-3.5" /> {p.views ? p.views.toLocaleString() : "No views yet"}
                  </span>
                </div>
                <div className="p-5">
                  <p className="font-display text-lg font-bold text-foreground group-hover:text-primary">{p.name}</p>
                  <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" /> {[p.city, p.state].filter(Boolean).join(", ") || p.address}
                  </p>
                </div>
              </motion.a>
            ))}
          </div>
        )}

        <div className="mt-12">
          <SectionTitle count={eventsTotal}>Events</SectionTitle>
        </div>
        {isLoading ? (
          <CardGridSkeleton />
        ) : events.length === 0 ? (
          <Empty>No events match your search.</Empty>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e, i) => {
              const from = eventPriceFrom(e);
              return (
                <motion.a
                  key={e.id}
                  href={publicEventUrl(e.id)}
                  target="_blank"
                  rel="noopener"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={cardClass}
                >
                  <div className="relative h-36 bg-gradient-to-br from-fuchsia-500 to-primary">
                    <Cover src={e.images?.[0]} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {e.isFeatured && (
                      <span className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold text-white backdrop-blur">
                        Featured
                      </span>
                    )}
                    <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 text-xs text-white/90">
                      <CalendarDays className="h-3.5 w-3.5" /> {fmtDateTime(e.startDate)}
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="font-display text-lg font-bold text-foreground group-hover:text-primary">{e.name}</p>
                    <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" /> {e.city || e.location}
                      {from !== null && ` · ${from > 0 ? `from ${formatNaira(from)}` : "Free"}`}
                    </p>
                  </div>
                </motion.a>
              );
            })}
          </div>
        )}

        <div className="mt-12">
          <SectionTitle count={restaurants.length}>Restaurants</SectionTitle>
        </div>
        {isLoading ? (
          <CardGridSkeleton />
        ) : restaurants.length === 0 ? (
          <Empty>No restaurants match your search.</Empty>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((r, i) => (
              <motion.a
                key={r.merchantId}
                href={publicRestaurantUrl(r.merchantId)}
                target="_blank"
                rel="noopener"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cardClass}
              >
                <div className="relative h-36 bg-gradient-to-br from-amber-400 to-primary">
                  <Cover src={r.cover} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 text-xs text-white/90">
                    <UtensilsCrossed className="h-3.5 w-3.5" /> {r.dishCount} dish{r.dishCount === 1 ? "" : "es"}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-5">
                  {r.logo ? (
                    <Cover src={r.logo} className="h-10 w-10 shrink-0 rounded-full border object-cover" />
                  ) : (
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {r.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg font-bold text-foreground group-hover:text-primary">
                      {r.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[r.categories.slice(0, 2).join(" · "), r.minPrice ? `from ${formatNaira(r.minPrice)}` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        )}

        <div className="mt-14 flex flex-col items-center gap-3 rounded-3xl bg-primary/5 p-10 text-center">
          <UtensilsCrossed className="h-8 w-8 text-primary" />
          <p className="font-display text-xl font-bold text-foreground">Are you a business?</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            List your restaurant, place or event on SpinStrip and reach thousands of customers.
          </p>
          <Link
            href={isAuthenticated ? "/apps-tools/places" : "/register"}
            className="brand-gradient mt-2 inline-flex min-h-[44px] items-center rounded-full px-7 text-sm font-semibold text-white shadow-lg shadow-primary/30"
          >
            {isAuthenticated ? "List a Place" : "Open Merchant Suite"}
          </Link>
        </div>
      </div>
    </div>
  );
}
