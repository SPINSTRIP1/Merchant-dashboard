"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, CalendarPlus, MapPin, Sparkles } from "lucide-react";
import EmptyState from "@/components/empty-state";
import StatusPill from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlaceEvents } from "@/hooks/use-place-extras";
import { fmtDate } from "@/utils";

/** Events linked to this place (via the event's "Add a place" field). */
export default function ActivitiesExperience({ placeId }: { placeId?: string }) {
  const { events, isLoading } = usePlaceEvents(placeId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="rounded-2xl border bg-card">
        <EmptyState
          icon={<Sparkles />}
          title="No activities yet"
          description="Events and experiences you create at this place will appear here."
          action={
            <Button variant="brand" asChild>
              <Link href={`/apps-tools/event-planner?create=1&placeId=${placeId}`}>
                <CalendarPlus /> Add Event
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {events.map((event, i) => (
        <motion.article
          key={event.id ?? i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="card-hover overflow-hidden rounded-2xl border bg-card"
        >
          {event.images?.[0] ? (
            <div className="relative h-36">
              <Image src={event.images[0]} alt="" fill className="object-cover" />
            </div>
          ) : (
            <div className="brand-gradient-soft grid h-36 place-items-center">
              <CalendarDays className="h-7 w-7 text-primary/60" />
            </div>
          )}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="truncate font-display font-bold text-foreground">{event.name}</p>
              <StatusPill
                status={event.status ?? "draft"}
                label={event.status === "INACTIVE" ? "Cancelled" : undefined}
              />
            </div>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" /> {event.city}, {event.state}
              </p>
              <p className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-primary" /> {fmtDate(event.startDate)}
              </p>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
