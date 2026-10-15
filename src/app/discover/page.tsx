"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, Compass, Eye, MapPin, Search, Star, UtensilsCrossed } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import SampleDataBadge from "@/components/sample-data-badge";
import PillGroup from "@/components/pill-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useAppSelector } from "@/hooks/redux";
import { selectIsAuthenticated } from "@/store/selectors";
import { useDiscover } from "@/hooks/use-discover";
import { DISCOVER_CITIES, type DiscoverEvent, type DiscoverPlace } from "@/mocks/discover";
import { fmtDateTime, formatNaira } from "@/utils";

type City = "All" | (typeof DISCOVER_CITIES)[number];
type Selected = { kind: "place"; item: DiscoverPlace } | { kind: "event"; item: DiscoverEvent } | null;

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-foreground">
    <span className="h-5 w-1 rounded-full bg-primary" /> {children}
  </h2>
);

export default function DiscoverPage() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { places, events, isLoading } = useDiscover();
  const [city, setCity] = useState<City>("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Selected>(null);

  const matches = (text: string) => text.toLowerCase().includes(query.trim().toLowerCase());
  const visiblePlaces = useMemo(
    () =>
      places.filter(
        (p) => (city === "All" || p.city === city) && (!query || matches(`${p.name} ${p.type} ${p.area} ${p.tagline}`))
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [places, city, query]
  );
  const visibleEvents = useMemo(
    () =>
      events.filter(
        (e) => (city === "All" || e.city === city) && (!query || matches(`${e.name} ${e.kind} ${e.venue}`))
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events, city, query]
  );

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
            Restaurants, lounges, events and experiences near you — all on SpinStrip.
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
              placeholder="Search places, events, areas…"
              aria-label="Search Discover"
              className="h-12 w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
          </motion.label>
          <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white/90">
            <Compass className="h-4 w-4" /> {DISCOVER_CITIES.join(" · ")}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 pb-24">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <PillGroup<City>
            options={["All", ...DISCOVER_CITIES]}
            value={city}
            onChange={setCity}
          />
          <SampleDataBadge label="Sample listings" />
        </div>

        <SectionTitle>Places</SectionTitle>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-60 rounded-3xl" />
            ))}
          </div>
        ) : visiblePlaces.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No places match your search.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visiblePlaces.map((p, i) => (
              <motion.button
                key={p.id}
                type="button"
                onClick={() => setSelected({ kind: "place", item: p })}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group block overflow-hidden rounded-3xl border bg-card text-left shadow-sm transition-shadow hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="brand-gradient relative h-36">
                  <Image src={p.image} alt="" fill sizes="(min-width: 1024px) 320px, 100vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold text-white backdrop-blur">
                    {p.type}
                  </span>
                  <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 text-xs text-white/90">
                    <Eye className="h-3.5 w-3.5" /> {p.views > 0 ? p.views.toLocaleString() : "No views yet"}
                  </span>
                  <span className="absolute bottom-4 right-4 inline-flex items-center gap-1 text-xs font-semibold text-white">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {p.rating.toFixed(1)}
                  </span>
                </div>
                <div className="p-5">
                  <p className="font-display text-lg font-bold text-foreground group-hover:text-primary">{p.name}</p>
                  <p className="mt-0.5 truncate text-xs italic text-muted-foreground">“{p.tagline}”</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {p.area}, {p.city} · {"₦".repeat(p.priceLevel)}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        <div className="mt-12">
          <SectionTitle>Events</SectionTitle>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-60 rounded-3xl" />
            ))}
          </div>
        ) : visibleEvents.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No events match your search.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleEvents.map((e, i) => (
              <motion.button
                key={e.id}
                type="button"
                onClick={() => setSelected({ kind: "event", item: e })}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group block overflow-hidden rounded-3xl border bg-card text-left shadow-sm transition-shadow hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="relative h-36 bg-gradient-to-br from-fuchsia-500 to-primary">
                  <Image src={e.image} alt="" fill sizes="(min-width: 1024px) 320px, 100vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold text-white backdrop-blur">
                    {e.kind}
                  </span>
                  <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 text-xs text-white/90">
                    <CalendarDays className="h-3.5 w-3.5" /> {fmtDateTime(e.startsAt)}
                  </span>
                </div>
                <div className="p-5">
                  <p className="font-display text-lg font-bold text-foreground group-hover:text-primary">{e.name}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {e.venue}, {e.city} ·{" "}
                    {e.priceFrom ? `from ${formatNaira(e.priceFrom)}` : "Free"}
                  </p>
                </div>
              </motion.button>
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

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-md overflow-hidden p-0">
          {selected && (
            <>
              <div className="relative h-44">
                <Image src={selected.item.image} alt="" fill sizes="448px" className="object-cover" />
              </div>
              <div className="space-y-2 p-5">
                <DialogTitle className="font-display text-xl font-bold">{selected.item.name}</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {selected.kind === "place"
                    ? `${selected.item.type} in ${selected.item.area}, ${selected.item.city} — “${selected.item.tagline}”`
                    : `${selected.item.kind} at ${selected.item.venue}, ${selected.item.city} · ${fmtDateTime(selected.item.startsAt)}`}
                </DialogDescription>
                <p className="text-sm font-semibold text-foreground">
                  {selected.kind === "place"
                    ? `${selected.item.rating.toFixed(1)} ★ · ${"₦".repeat(selected.item.priceLevel)}`
                    : selected.item.priceFrom
                      ? `Tickets from ${formatNaira(selected.item.priceFrom)}`
                      : "Free entry"}
                </p>
                <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
                  This is a sample listing. Real places and events open their public page once Discover is
                  connected to live listings.
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
