"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { BarChart3, CalendarDays, Clock, FileText, MapPin, Pencil, PartyPopper, Trash2, Users, X } from "lucide-react";
import { Event } from "../_schemas";
import { fmtDate, formatAmount } from "@/utils";
import { extractTimeFromDateTime } from "../_utils";
import StatusPill from "@/components/status-pill";
import SampleDataBadge from "@/components/sample-data-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteEvent } from "@/hooks/use-event-extras";

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{children}</span>
    </div>
  );
}

export default function DetailsModal({
  isOpen,
  onClose,
  event,
  onEdit,
  onCancelEvent,
}: {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onEdit: (event: Event) => void;
  onCancelEvent: (event: Event) => void;
}) {
  const deleteEvent = useDeleteEvent();
  const [confirmDelete, setConfirmDelete] = useState(false);
  if (!event) return null;

  const location = [event.location, event.city, event.state].filter(Boolean).join(", ");

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-2xl">
          {event.images?.length ? (
            <div className="grid grid-cols-3 gap-2">
              {event.images.slice(0, 3).map((image, index) => (
                // eslint-disable-next-line @next/next/no-img-element -- event images may come from hosts not in next.config
                <img
                  key={index}
                  src={image}
                  alt={event.name}
                  className={index === 0 ? "col-span-3 h-44 w-full rounded-2xl object-cover" : "h-24 w-full rounded-xl object-cover"}
                />
              ))}
            </div>
          ) : (
            <div className="brand-gradient-soft grid h-32 place-items-center rounded-2xl">
              <PartyPopper className="h-8 w-8 text-primary/60" />
            </div>
          )}

          <DialogHeader>
            <DialogTitle className="text-2xl">{event.name}</DialogTitle>
            {event.description && <DialogDescription className="line-clamp-3">{event.description}</DialogDescription>}
          </DialogHeader>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" /> {event.city}, {event.state}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" /> {extractTimeFromDateTime(event.startDate)} ({event.timezone})
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-primary" /> {fmtDate(event.startDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" />
              {event.totalTransactions ? `${event.totalTransactions} registered` : "No attendees yet"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="brand" onClick={() => onEdit(event)}>
              <Pencil /> Edit
            </Button>
            <Button variant="soft" asChild>
              <Link href={`/apps-tools/event-planner/sales-registrations?id=${event.id}`}>
                <BarChart3 /> Sales and Registrations
              </Link>
            </Button>
            <Button variant="outline" onClick={() => toast("Form Builder is coming soon.")}>
              <FileText /> Form Builder
            </Button>
            {event.status === "INACTIVE" ? (
              <Button
                variant="outline"
                className="text-rose-500 hover:text-rose-600"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 /> Delete
              </Button>
            ) : (
              <Button
                variant="outline"
                className="text-rose-500 hover:text-rose-600"
                onClick={() => onCancelEvent(event)}
              >
                <X /> Cancel Event
              </Button>
            )}
          </div>

          <div className="divide-y rounded-2xl border px-4">
            <Detail label="Status">
              <StatusPill
                status={event.status ?? "draft"}
                label={event.status === "INACTIVE" ? "Cancelled" : undefined}
              />
            </Detail>
            <Detail label="Tickets">
              {event.ticketTiers?.length ? (
                <span className="flex flex-wrap justify-end gap-1.5">
                  {event.ticketTiers.map((tier) => (
                    <span
                      key={tier.name}
                      className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary"
                    >
                      {tier.name} {formatAmount(tier.price)}
                    </span>
                  ))}
                </span>
              ) : (
                "Free"
              )}
            </Detail>
            <Detail label="Validity Period">
              {fmtDate(event.startDate)} → {fmtDate(event.endDate)}
            </Detail>
            <Detail label="Sold Out Threshold">{event.soldOutThreshold ?? 0} Tickets</Detail>
            <Detail label="Contact Phone">{event.contactPhone || "—"}</Detail>
            <Detail label="Contact Email">{event.contactEmail || "—"}</Detail>
            <Detail label="Location">{location || "—"}</Detail>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>Delete {event.name}?</DialogTitle>
              <SampleDataBadge label="Sample" />
            </div>
            <DialogDescription>It will be removed from your events list.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Keep Event
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!event.id) return;
                await deleteEvent.mutateAsync(event.id);
                setConfirmDelete(false);
                onClose();
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
