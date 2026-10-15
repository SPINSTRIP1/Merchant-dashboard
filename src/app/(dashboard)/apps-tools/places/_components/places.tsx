"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Clock, Eye, Globe, Hourglass, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SinglePlace } from "./claim-places-steps/find-place";
import { usePlaceTaglines } from "@/hooks/use-place-extras";
import { cn } from "@/lib/utils";
import { getOperatingHoursDisplay, getPlaceType } from "../_utils";

const STATUS = {
  PUBLISHED: { label: "Published", text: "text-emerald-600 dark:text-emerald-400", bar: "w-full bg-emerald-500" },
  UNPUBLISHED: { label: "Review Pending", text: "text-amber-600 dark:text-amber-400", bar: "w-1/2 brand-gradient" },
  DRAFT: { label: "Draft", text: "text-muted-foreground", bar: "w-1/4 bg-muted-foreground/40" },
  REJECTED: { label: "Rejected", text: "text-rose-600 dark:text-rose-400", bar: "w-1/4 bg-rose-500" },
} as const;

function PlaceCard({
  place,
  tagline,
  index,
  onEdit,
  onDelete,
}: {
  place: SinglePlace;
  tagline?: string;
  index: number;
  onEdit: (place: SinglePlace) => void;
  onDelete: (place: SinglePlace) => void;
}) {
  const status = STATUS[place.status ?? "UNPUBLISHED"] ?? STATUS.UNPUBLISHED;
  const edit = () =>
    onEdit({
      ...place,
      // @ts-expect-error - URL strings are passed instead of File objects for editing
      environmentalSafetyPolicy: place.environmentalSafetyPolicyUrl || undefined,
      // @ts-expect-error - URL strings are passed instead of File objects for editing
      privacyPolicy: place.privacyPolicyUrl || undefined,
      // @ts-expect-error - URL strings are passed instead of File objects for editing
      disclaimers: place.disclaimersUrl || undefined,
      // @ts-expect-error - URL strings are passed instead of File objects for editing
      ownershipDocument: place.ownershipDocumentUrl || undefined,
      // @ts-expect-error - URL strings are passed instead of File objects for editing
      ownershipVideo: place.ownershipVideoUrl || undefined,
    });

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="card-hover flex flex-col overflow-hidden rounded-2xl border bg-card"
    >
      {place.coverImage ? (
        <div className="relative h-36">
          <Image src={place.coverImage} alt="" fill className="object-cover" />
        </div>
      ) : (
        <div className="brand-gradient-soft grid h-36 place-items-center">
          <Building2 className="h-8 w-8 text-primary/60" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-display text-base font-bold text-foreground">
              {place.name} - {place.city}
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-wide text-primary">
              {getPlaceType(place.placeType)}
            </p>
          </div>
          <Button size="sm" variant="outline" asChild className="shrink-0">
            <Link href={`/apps-tools/places/${place.id}`}>
              View Place <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        {tagline && <p className="mt-1.5 truncate text-xs italic text-muted-foreground">&ldquo;{tagline}&rdquo;</p>}

        <div className="mt-3 flex-1 space-y-1.5 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" /> {place.city}, {place.state}
          </p>
          <p className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" /> {getOperatingHoursDisplay(place.operatingHours)}
          </p>
          {place.website && (
            <p className="flex items-center gap-1.5 truncate">
              <Globe className="h-3.5 w-3.5 shrink-0 text-primary" /> {place.website}
            </p>
          )}
          <p className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-primary" />
            {place.views ? `${place.views.toLocaleString()} views` : "No views yet"}
          </p>
        </div>

        <div className="mt-4 border-t pt-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-muted-foreground">
              Approval Status: <span className={cn("font-bold", status.text)}>{status.label}</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={edit}
                aria-label={`Edit ${place.name}`}
                className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(place)}
                aria-label={`Delete ${place.name}`}
                className="grid h-9 w-9 place-items-center rounded-full text-rose-500 transition-colors hover:bg-rose-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full rounded-full", status.bar)} />
          </div>
          {place.status === "REJECTED" && place.rejectionReason && (
            <p className="mt-2 rounded-xl bg-rose-500/10 px-3 py-2 text-[11px] text-rose-600 dark:text-rose-400">
              {place.rejectionReason}
            </p>
          )}

          {place.status === "PUBLISHED" ? (
            <Button size="sm" variant="soft" className="mt-3 w-full" onClick={edit}>
              Edit Place
            </Button>
          ) : place.status === "REJECTED" ? (
            <Button size="sm" variant="brand" className="mt-3 w-full" onClick={edit}>
              Fix &amp; Resubmit <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : place.status === "DRAFT" ? (
            <Button size="sm" variant="brand" className="mt-3 w-full" onClick={edit}>
              Continue Setup <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <p
              className="mt-3 flex min-h-[36px] items-center justify-center gap-1.5 rounded-full bg-amber-500/10 text-xs font-semibold text-amber-600 dark:text-amber-400"
              title="SpinStrip is reviewing this place. You'll be notified once it's published."
            >
              <Hourglass className="h-3.5 w-3.5" /> Awaiting review
            </p>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/** A titled grid of place cards ("Pending Places", "Published Places"). */
export default function Places({
  title,
  places,
  onEdit,
  onDelete,
  onAdd,
}: {
  title: string;
  places: SinglePlace[];
  onEdit: (place: SinglePlace) => void;
  onDelete: (place: SinglePlace) => void;
  onAdd: () => void;
}) {
  const taglines = usePlaceTaglines();
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
        <Button variant="brand" size="sm" onClick={onAdd}>
          <Plus /> Add Place
        </Button>
      </div>
      {places.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card/50 py-10 text-center text-sm text-muted-foreground">
          No {title.toLowerCase()} right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {places.map((place, i) => (
            <PlaceCard key={place.id} place={place} tagline={taglines[place.id ?? ""]} index={i} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </section>
  );
}
