"use client";
import { SHOW_SAMPLE_FEATURES } from "@/lib/features";
import { useState } from "react";
import { publicEventUrl } from "@/lib/public-links";
import PublicPreviewDialog from "@/components/public-preview-dialog";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, Globe, PartyPopper, Percent, Tag, Target, Ticket, Users } from "lucide-react";
import RegistrationChart from "./_components/registration-chart";
import RegistrationTable from "./_components/table";
import TicketSalesChart from "./_components/ticket-sales-chart";
import { useEventRegistrations } from "@/hooks/use-event-registrations";
import { useEvent } from "@/hooks/use-events";
import { useEventViaDealSales } from "@/hooks/use-event-extras";
import Loader from "@/components/loader";
import Breadcrumb from "@/components/breadcrumb";
import EmptyState from "@/components/empty-state";
import StatCard from "@/components/stat-card";
import ChartCard from "@/components/chart-card";
import ReviewsList from "@/components/reviews-list";
import { Button } from "@/components/ui/button";
import { fmtDate, formatNaira } from "@/utils";

function SalesAndRegistrationContent() {
  const id = useSearchParams().get("id");
  const { event, isLoading } = useEvent(id);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { stats } = useEventRegistrations({ eventId: id, limit: 1 });

  const totalTicketsSold = stats?.ticketTiers?.reduce((acc, t) => acc + t.sold, 0) ?? 0;
  const viaDeal = useEventViaDealSales(id, totalTicketsSold);

  if (isLoading) return <Loader />;
  if (!event) {
    return (
      <div className="rounded-2xl border bg-card">
        <EmptyState
          icon={<PartyPopper />}
          title="Event not found"
          description="This event may have been removed."
          action={
            <Button variant="brand" asChild>
              <Link href="/apps-tools/event-planner">Back to Events</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb parent={{ label: "Events", href: "/apps-tools/event-planner" }} current="Sales & Registrations" />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">{event.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sales &amp; Registrations · {fmtDate(event.startDate)} · {event.city}, {event.state}
          </p>
        </div>
        <Button variant="outline" onClick={() => setPreviewOpen(true)}>
          <Globe /> Preview Public Page
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          index={0}
          label="Total Registrations"
          value={(event.totalTransactions ?? 0).toLocaleString()}
          icon={<Users />}
        />
        <StatCard index={1} accent label="Total Tickets Sales" value={totalTicketsSold.toLocaleString()} icon={<Ticket />} />
        {SHOW_SAMPLE_FEATURES && (
          <StatCard index={2} sample label="Ticket Sales Via Deal" value={viaDeal.toLocaleString()} icon={<Tag />} />
        )}
        <StatCard
          index={3}
          label="Sold Out Threshold"
          value={`${event.soldOutThreshold ?? 0}`}
          sub="tickets"
          icon={<Target />}
        />
        <StatCard
          index={4}
          label="Event Impressions"
          value={(event.totalImpressions ?? 0).toLocaleString()}
          sub="views"
          icon={<Eye />}
        />
        <StatCard
          index={5}
          label="Checkout Drop Off"
          value={`${event.dropOffRate ?? 0}%`}
          icon={<Percent />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <ChartCard title="Registrations" subtitle="Registrations per month">
          <RegistrationChart eventId={id} totalRegistrations={event.totalTransactions ?? 0} />
        </ChartCard>
        <ChartCard
          title="Ticket Sales"
          subtitle="Revenue and tickets by tier"
          action={
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
              {formatNaira(Number(stats?.totalRevenue) || 0, true)} revenue
            </span>
          }
          delay={0.05}
        >
          <TicketSalesChart stats={stats} />
        </ChartCard>
      </div>

      <RegistrationTable eventId={id} eventName={event.name} />

      <section className="mt-8">
        <h2 className="mb-4 font-display text-base font-bold text-foreground">Reviews</h2>
        <ReviewsList
          source="events"
          subjectId={event.id}
          emptyDescription="Attendees can review this event on its public page after buying a ticket."
        />
      </section>
      {event.id && (
        <PublicPreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          title={event.name}
          url={publicEventUrl(event.id)}
          kind="event"
          id={event.id}
          data={event}
          notice={
            event.status === "ACTIVE"
              ? undefined
              : "This event isn't live, so customers can't see it yet — this is how it will look once it's active."
          }
        />
      )}
    </div>
  );
}

export default function SalesAndRegistration() {
  return (
    <Suspense fallback={<Loader />}>
      <SalesAndRegistrationContent />
    </Suspense>
  );
}
