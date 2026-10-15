"use client";
import Image from "next/image";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Bell, Building2, Clock, Eye, Globe, Mail, MapPin, Phone, Star } from "lucide-react";
import CheckOutModal from "./_components/modals/checkout";
import FacilityCard from "@/app/(dashboard)/apps-tools/places/[id]/_components/facility-card";
import OperatingHoursTable from "@/app/(dashboard)/apps-tools/places/[id]/_components/operating-hours-table";
import { Stars } from "@/app/(dashboard)/apps-tools/places/[id]/_components/reviews";
import { getPlaceType } from "@/app/(dashboard)/apps-tools/places/_utils";
import { getOperatingHoursDisplay } from "@/app/(dashboard)/apps-tools/places/_utils";
import Loader from "@/components/loader";
import EmptyState from "@/components/empty-state";
import SampleDataBadge from "@/components/sample-data-badge";
import { Button } from "@/components/ui/button";
import { usePublicPlace } from "@/hooks/use-places";
import { usePlaceReviews, usePlaceTaglines } from "@/hooks/use-place-extras";
import { fmtDate, formatAmount } from "@/utils";

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
        {action}
      </div>
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

function PublicPlacePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const id = useSearchParams().get("id");
  const { place, isLoading: loading } = usePublicPlace(id);
  const taglines = usePlaceTaglines();
  const { reviews, average } = usePlaceReviews(id ?? undefined);

  if (loading) return <Loader />;
  if (!place) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-4">
        <EmptyState icon={<Building2 />} title="Place not found" description="This place may no longer be listed." />
      </div>
    );
  }

  const tagline = id ? taglines[id] : undefined;
  const facilities = place.facilities ?? [];
  const fees = facilities.flatMap((f) => (f.fees ?? []).map((fee) => fee.amount)).filter((a) => a > 0);
  const fromPrice = fees.length ? Math.min(...fees) : null;
  const amenities = (place.metadata?.amenities ?? "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="truncate text-sm font-bold">{place.name}</span>
          <Image src="/logo.svg" alt="SpinStrip" width={76} height={30} className="h-[30px] w-[76px]" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-4 pb-28 pt-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-64 overflow-hidden rounded-3xl md:h-80"
        >
          {place.coverImage ? (
            <Image src={place.coverImage} alt={place.name} fill priority className="object-cover" />
          ) : (
            <div className="brand-gradient h-full w-full" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          <button
            type="button"
            onClick={() => toast.success(`You're now following ${place.name}`)}
            className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-gray-900 shadow"
          >
            <Bell className="h-3.5 w-3.5" /> Follow
          </button>
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
            <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              {getPlaceType(place.placeType)}
            </span>
            <h1 className="mt-2 font-display text-3xl font-extrabold text-white md:text-5xl">{place.name}</h1>
            {tagline && <p className="mt-1 text-sm italic text-white/85">&ldquo;{tagline}&rdquo;</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <HeroChip icon={MapPin}>
                {place.city}, {place.state}
              </HeroChip>
              <HeroChip icon={Clock}>{getOperatingHoursDisplay(place.operatingHours)}</HeroChip>
              {place.website && <HeroChip icon={Globe}>{place.website.replace(/^https?:\/\//, "")}</HeroChip>}
              <HeroChip icon={Eye}>{place.views ? `${place.views.toLocaleString()} views` : "No views yet"}</HeroChip>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4">
          <div>
            <p className="font-display text-base font-bold">
              {facilities.length ? "Bookings open" : "Not bookable yet"}
            </p>
            <p className="text-xs text-muted-foreground">
              {facilities.length
                ? fromPrice !== null
                  ? `Reserve a facility from ${formatAmount(fromPrice)}`
                  : "Reserve a facility instantly"
                : "Follow this place to hear when reservations open"}
            </p>
          </div>
          {facilities.length ? (
            <Button variant="brand" onClick={() => setIsModalOpen(true)}>
              Book a facility
            </Button>
          ) : (
            <Button variant="outline" onClick={() => toast.success(`You're now following ${place.name}`)}>
              <Bell /> Follow
            </Button>
          )}
        </div>

        {(place.description || amenities.length > 0) && (
          <Section title="About">
            {place.description && (
              <p className="whitespace-pre-line text-sm text-muted-foreground">{place.description}</p>
            )}
            {amenities.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {amenities.map((a) => (
                  <span key={a} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {a}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-4 space-y-1.5 border-t pt-4 text-sm text-muted-foreground">
              {place.address && (
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {[place.address, place.city, place.state].filter(Boolean).join(", ")}
                </p>
              )}
              {!!place.phoneNumbers?.length && (
                <p className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {place.phoneNumbers.join(" · ")}
                </p>
              )}
              {!!place.emails?.length && (
                <p className="flex items-start gap-2 break-all">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {place.emails.join(" · ")}
                </p>
              )}
            </div>
          </Section>
        )}

        <Section title="Facilities">
          {facilities.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {facilities.map((facility, index) => (
                <FacilityCard
                  key={index}
                  title={facility.name}
                  description={facility.description}
                  imgUrl={facility.images?.[0] || ""}
                  facilityType={facility.facilityCategory}
                  accessType={facility.accessType || "N/A"}
                  price={facility.fees?.[0]?.amount ?? 0}
                  onClick={() => setIsModalOpen(true)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              This place hasn&apos;t published any facilities yet. Follow it to hear when reservations open.
            </p>
          )}
        </Section>

        {!!place.images?.length && (
          <Section title="Gallery">
            <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1">
              {place.images.map((image, index) => (
                <div key={index} className="relative h-44 w-64 shrink-0 overflow-hidden rounded-2xl">
                  <Image src={image} alt={place.name} fill className="object-cover" />
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section title="Opening Hours">
          <OperatingHoursTable operatingHours={place.operatingHours} />
        </Section>

        <Section
          title="Reviews"
          action={
            reviews.length ? (
              <span className="flex items-center gap-2 text-sm">
                <span className="font-bold">{average.toFixed(1)}</span>
                <Stars rating={average} />
                <SampleDataBadge />
              </span>
            ) : undefined
          }
        >
          {reviews.length ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {reviews.slice(0, 10).map((review) => (
                <article key={review.id} className="rounded-2xl bg-muted/40 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{review.author}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {review.rating}/5
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{review.comment}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground/80">{fmtDate(review.createdAt)}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No reviews have been shared about this place yet.</p>
          )}
        </Section>
      </main>

      {facilities.length > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-30 mx-auto w-[calc(100%-2rem)] max-w-xl md:hidden">
          <Button
            variant="brand"
            className="h-14 w-full justify-between px-6 shadow-2xl shadow-primary/40"
            onClick={() => setIsModalOpen(true)}
          >
            <span>{fromPrice !== null ? `From ${formatAmount(fromPrice)}` : "Reserve a facility"}</span>
            <span>Book</span>
          </Button>
        </div>
      )}

      <CheckOutModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} place={place} />
    </div>
  );
}

export default function PlacesPage() {
  return (
    <Suspense fallback={<Loader />}>
      <PublicPlacePage />
    </Suspense>
  );
}
