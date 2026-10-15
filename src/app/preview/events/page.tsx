"use client";
import { Suspense, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Bell, CalendarDays, Clock, Eye, Mail, MapPin, PartyPopper, Phone, Ticket, Users } from "lucide-react";
import CheckOutModal from "./_components/modals/checkout";
import EmptyState from "@/components/empty-state";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { usePublicEvent } from "@/hooks/use-events";
import { fmtDate, formatAmount } from "@/utils";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5">
      <h2 className="mb-4 font-display text-lg font-bold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function HeroChip({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
      <Icon className="h-3.5 w-3.5" /> {children}
    </span>
  );
}

function PublicEventPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const id = useSearchParams().get("id");
  const { event, isLoading: loading } = usePublicEvent(id);

  if (loading) return <Loader />;
  if (!event) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-4">
        <EmptyState icon={<PartyPopper />} title="Event not found" description="This event may no longer be listed." />
      </div>
    );
  }

  const tiers = event.ticketTiers ?? [];
  const fromPrice = tiers.length ? Math.min(...tiers.map((t) => t.price)) : 0;
  const startTime = new Date(event.startDate).toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const follow = () => toast.success(`You're now following ${event.name}`);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="truncate text-sm font-bold">{event.name}</span>
          <Image src="/logo.svg" alt="SpinStrip" width={76} height={30} className="h-[30px] w-[76px]" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-4 pb-28 pt-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-64 overflow-hidden rounded-3xl md:h-80"
        >
          {event.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element -- event images may come from hosts not in next.config
            <img src={event.images[0]} alt={event.name} className="h-full w-full object-cover" />
          ) : (
            <div className="brand-gradient h-full w-full" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          <button
            type="button"
            onClick={follow}
            className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-gray-900 shadow"
          >
            <Bell className="h-3.5 w-3.5" /> Follow
          </button>
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
            <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              {event.frequency === "RECURRING" ? "Recurring" : "One Off"}
            </span>
            <h1 className="mt-2 font-display text-3xl font-extrabold text-white md:text-5xl">{event.name}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <HeroChip icon={MapPin}>
                {event.city}, {event.state}
              </HeroChip>
              <HeroChip icon={CalendarDays}>
                {fmtDate(event.startDate)}
                {event.endDate && event.endDate.slice(0, 10) !== event.startDate.slice(0, 10)
                  ? ` — ${fmtDate(event.endDate)}`
                  : ""}
              </HeroChip>
              <HeroChip icon={Clock}>
                {startTime} ({event.timezone})
              </HeroChip>
              {event.expectedGuests > 0 && (
                <HeroChip icon={Users}>{event.expectedGuests.toLocaleString()} expected</HeroChip>
              )}
              <HeroChip icon={Eye}>
                {event.totalImpressions ? `${event.totalImpressions.toLocaleString()} views` : "No views yet"}
              </HeroChip>
            </div>
          </div>
        </motion.div>

        {event.images?.length > 1 && (
          <div className="grid grid-cols-3 gap-3">
            {event.images.slice(1, 4).map((image, index) => (
              // eslint-disable-next-line @next/next/no-img-element -- event images may come from hosts not in next.config
              <img key={index} src={image} alt="" className="h-28 w-full rounded-2xl object-cover md:h-36" />
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4">
          <div>
            <p className="font-display text-xl font-bold">
              {tiers.length && fromPrice > 0 ? `From ${formatAmount(fromPrice)}` : "Free entry"}
            </p>
            <p className="text-xs text-muted-foreground">Starts {fmtDate(event.startDate)} · {startTime}</p>
          </div>
          <Button variant="brand" onClick={() => setIsModalOpen(true)}>
            Reserve a Spot
          </Button>
        </div>

        <Section title="Overview">
          <p className="whitespace-pre-line text-sm text-muted-foreground">
            {event.description ||
              `${event.name} is happening in ${event.city}, ${event.state}. Reserve your spot before it sells out.`}
          </p>
        </Section>

        <Section title="Tickets">
          {tiers.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {tiers.map((tier) => (
                <div key={tier.id} className="flex flex-col rounded-2xl border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 font-display font-bold">
                        <Ticket className="h-4 w-4 text-primary" /> {tier.name}
                      </p>
                      {tier.description && <p className="mt-0.5 text-xs text-muted-foreground">{tier.description}</p>}
                    </div>
                    <p className="font-display font-bold text-primary">
                      {tier.price > 0 ? formatAmount(tier.price) : "Free"}
                    </p>
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {tier.quantityAvailable.toLocaleString()} available
                  </p>
                  <Button variant="soft" size="sm" className="mt-3" onClick={() => setIsModalOpen(true)}>
                    Get tickets
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4">
              <div>
                <p className="font-display font-bold">General Admission</p>
                <p className="text-xs text-muted-foreground">Free entry</p>
              </div>
              <Button variant="soft" size="sm" onClick={() => setIsModalOpen(true)}>
                Reserve
              </Button>
            </div>
          )}
        </Section>

        {event.images?.length > 0 && (
          <Section title="Gallery">
            <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1">
              {event.images.map((image, index) => (
                // eslint-disable-next-line @next/next/no-img-element -- event images may come from hosts not in next.config
                <img key={index} src={image} alt={event.name} className="h-44 w-64 shrink-0 rounded-2xl object-cover" />
              ))}
            </div>
          </Section>
        )}

        <Section title="Location & Contact">
          <div className="space-y-2 text-sm text-muted-foreground">
            {event.location && (
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {[event.location, event.city, event.state].filter(Boolean).join(", ")}
              </p>
            )}
            {event.contactPhone && (
              <p className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {event.contactPhone}
              </p>
            )}
            {event.contactEmail && (
              <p className="flex items-start gap-2 break-all">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {event.contactEmail}
              </p>
            )}
          </div>
          {event.location && (
            <div className="mt-4 h-[200px] overflow-hidden rounded-2xl border">
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(event.location)}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Event location map"
              />
            </div>
          )}
        </Section>
      </main>

      <div className="fixed inset-x-0 bottom-4 z-30 mx-auto w-[calc(100%-2rem)] max-w-xl md:hidden">
        <Button
          variant="brand"
          className="h-14 w-full justify-between px-6 shadow-2xl shadow-primary/40"
          onClick={() => setIsModalOpen(true)}
        >
          <span>{tiers.length && fromPrice > 0 ? `From ${formatAmount(fromPrice)}` : "Free entry"}</span>
          <span>Reserve</span>
        </Button>
      </div>

      <CheckOutModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} event={event} />
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<Loader />}>
      <PublicEventPage />
    </Suspense>
  );
}
