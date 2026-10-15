"use client";
import { CalendarClock, CalendarDays, CalendarX2, PartyPopper } from "lucide-react";
import EventsTable from "./_components/events-table";
import { useEventStats } from "@/hooks/use-events";
import Breadcrumb from "@/components/breadcrumb";
import PageHeader from "@/components/page-header";
import StatCard from "@/components/stat-card";

export default function EventPlanner() {
  const { stats: data } = useEventStats();

  return (
    <div className="!overflow-x-clip">
      <Breadcrumb parent={{ label: "Tools", href: "/apps-tools" }} current="Event Planner" />
      <PageHeader
        title="Events"
        subtitle="Create events, sell tickets and track registrations from one place."
      />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard index={0} label="All Events" value={(data?.total || 0).toLocaleString()} icon={<PartyPopper />} />
        <StatCard
          index={1}
          label="Upcoming Events"
          value={(data?.upcoming || 0).toLocaleString()}
          icon={<CalendarClock />}
        />
        <StatCard index={2} label="Past Events" value={(data?.past || 0).toLocaleString()} icon={<CalendarDays />} />
        <StatCard
          index={3}
          label="Canceled Events"
          value={(data?.inactive || 0).toLocaleString()}
          icon={<CalendarX2 />}
        />
      </div>
      <EventsTable />
    </div>
  );
}
