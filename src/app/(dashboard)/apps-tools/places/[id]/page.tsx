"use client";

import React from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  CalendarCheck,
  CalendarPlus,
  ClipboardList,
  Globe,
  MessageSquare,
  ShoppingBag,
  Users,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import Loader from "@/components/loader";
import EmptyState from "@/components/empty-state";
import Breadcrumb from "@/components/breadcrumb";
import StatCard from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlace } from "@/hooks/use-places";
import { cn } from "@/lib/utils";
import { formatNaira } from "@/utils";
import { getPlaceType } from "../_utils";
import FacilityManagement from "./_components/facility-management";
import BookingReservation from "./_components/booking-reservation";
import VisitorList from "./_components/visitor-list";
import ActivitiesExperience from "./_components/activities-experience";
import Reviews from "./_components/reviews";

const TABS = [
  { value: "facilities", label: "Facility Management" },
  { value: "visitors", label: "Visitor Management" },
  { value: "bookings", label: "Bookings & Reservations" },
  { value: "activities", label: "Activities & Experiences" },
  { value: "reviews", label: "Reviews" },
] as const;

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  PUBLISHED: { label: "Published", className: "text-emerald-600 dark:text-emerald-400" },
  UNPUBLISHED: { label: "Review Pending", className: "text-amber-600 dark:text-amber-400" },
  DRAFT: { label: "Draft", className: "text-muted-foreground" },
  REJECTED: { label: "Rejected", className: "text-rose-600 dark:text-rose-400" },
};

export default function Page() {
  const { id } = useParams();
  const { place, isLoading } = usePlace(id as string);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab = TABS.some((t) => t.value === tabParam) ? (tabParam as string) : "facilities";

  const setTab = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "facilities") params.delete("tab");
    else params.set("tab", next);
    params.delete("page");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!place) {
    return (
      <div className="rounded-2xl border bg-card">
        <EmptyState
          icon={<Building2 />}
          title="Place not found"
          description="This place may have been deleted, or the link is wrong."
          action={
            <Button variant="brand" asChild>
              <Link href="/apps-tools/places">Back to Places</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const status = STATUS_LABEL[place.status ?? "UNPUBLISHED"] ?? STATUS_LABEL.UNPUBLISHED;

  return (
    <div>
      <Breadcrumb parent={{ label: "Places", href: "/apps-tools/places" }} current={place.name} />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {place.name} - {place.city}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {getPlaceType(place.placeType)} ·{" "}
            <span className={cn("font-semibold", status.className)}>{status.label}</span>
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/preview/places?id=${place.id}`} target="_blank" rel="noopener">
            <Globe /> Preview Public Page
          </Link>
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard index={0} label="Visitors" value={(place.stats?.visitors ?? 0).toLocaleString()} icon={<Users />} />
        <StatCard
          index={1}
          label="Facilities"
          value={(place.stats?.facilities ?? 0).toLocaleString()}
          icon={<Building2 />}
        />
        <StatCard
          index={2}
          accent
          label="Revenue"
          value={formatNaira(place.stats?.revenue ?? 0, true)}
          icon={<Wallet />}
        />
        <StatCard index={3} label="Sales" value={(place.stats?.sales ?? 0).toLocaleString()} icon={<ShoppingBag />} />
        <StatCard
          index={4}
          label="Reservations"
          value={(place.stats?.reservations ?? 0).toLocaleString()}
          icon={<CalendarCheck />}
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant="brand" size="sm" asChild>
          <Link href={`/apps-tools/event-planner?create=1&placeId=${place.id}`}>
            <CalendarPlus /> Add Event
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/apps-tools/menu">
            <UtensilsCrossed /> Update Menu/Services
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={() => setTab("reviews")}>
          <MessageSquare /> Manage Reviews
        </Button>
        <Button variant="outline" size="sm" onClick={() => setTab("bookings")}>
          <ClipboardList /> Manage Bookings
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="facilities">
          <FacilityManagement place={place} />
        </TabsContent>
        <TabsContent value="visitors">
          <VisitorList />
        </TabsContent>
        <TabsContent value="bookings">
          <BookingReservation />
        </TabsContent>
        <TabsContent value="activities">
          <ActivitiesExperience placeId={place.id} />
        </TabsContent>
        <TabsContent value="reviews">
          <Reviews placeId={place.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
