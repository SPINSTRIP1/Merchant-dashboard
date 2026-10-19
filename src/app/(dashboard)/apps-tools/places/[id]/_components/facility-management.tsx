"use client";

import { SHOW_SAMPLE_FEATURES } from "@/lib/features";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Building2, Check, Globe, Mail, MapPin, Pencil, Phone, Plus, X } from "lucide-react";
import EmptyState from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePlaceFacilities } from "@/hooks/use-places";
import {
  placeTagline,
  useRemoveFacility,
  useSetPlaceTagline,
} from "@/hooks/use-place-extras";
import { SinglePlace } from "../../_components/claim-places-steps/find-place";
import type { Facility } from "../../_schemas";
import { getOperatingHoursDisplay } from "../../_utils";
import SampleDataBadge from "@/components/sample-data-badge";
import FacilityCard from "./facility-card";
import FacilityModal from "./modals/facility-modal";
import OperatingHoursTable from "./operating-hours-table";

function TaglineEditor({ placeId, metadata, saved }: { placeId: string; metadata?: unknown; saved: string }) {
  const setTagline = useSetPlaceTagline();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(saved);

  useEffect(() => setDraft(saved), [saved]);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="group mt-0.5 flex items-center gap-1.5 text-left text-xs italic text-muted-foreground hover:text-foreground"
      >
        {saved ? <>&ldquo;{saved}&rdquo;</> : <span className="not-italic text-primary">Add a tagline</span>}
        <Pencil className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
    );
  }

  return (
    <div className="mt-1.5 flex items-center gap-1.5">
      <Input
        autoFocus
        value={draft}
        maxLength={120}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="e.g. A place of excellence"
        className="h-9 text-xs"
        onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
      />
      <button
        type="button"
        aria-label="Save tagline"
        onClick={async () => {
          try {
            await setTagline.mutateAsync({ placeId, metadata, tagline: draft });
            setEditing(false);
          } catch {
            // error toast shown by the hook; keep the editor open
          }
        }}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-primary hover:bg-primary/10"
      >
        <Check className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Cancel"
        onClick={() => setEditing(false)}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function FacilityManagement({ place }: { place: SinglePlace | undefined }) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [removing, setRemoving] = useState<Facility | null>(null);
  const { facilities: data, isLoading } = usePlaceFacilities(place?.id);
  const removeFacility = useRemoveFacility(place?.id ?? "");

  if (!place) {
    return <p className="text-center text-muted-foreground">Place not found.</p>;
  }

  const facilities = data ?? [];
  const amenities = (place.metadata?.amenities ?? "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  return (
    <>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-display text-sm font-bold text-foreground">Facilities</h3>
            <Button variant="brand" size="sm" onClick={() => setIsModalOpen(true)}>
              <Plus /> Add Facility
            </Button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-2xl" />
              ))}
            </div>
          ) : facilities.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {facilities.map((facility, index) => (
                <FacilityCard
                  key={facility.id ?? index}
                  title={facility.name}
                  description={facility.description}
                  imgUrl={facility.images?.[0] || ""}
                  facilityType={facility.facilityCategory}
                  accessType={facility.accessType || "N/A"}
                  price={facility.fees?.[0]?.amount ?? 0}
                  onRemove={facility.id ? () => setRemoving(facility) : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border bg-card">
              <EmptyState
                icon={<Building2 />}
                title="No facilities yet"
                description="Add facilities like pools, kitchens or private rooms."
              />
            </div>
          )}
        </section>

        {/* Beside the facility grid (xl), the place summary stays in view below the sticky navbar. */}
        <aside className="no-scrollbar space-y-4 xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:self-start xl:overflow-y-auto">
          <div className="overflow-hidden rounded-2xl border bg-card">
            {place.coverImage ? (
              <div className="relative h-40">
                <Image src={place.coverImage} alt={place.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="brand-gradient-soft grid h-40 place-items-center">
                <Building2 className="h-8 w-8 text-primary/60" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-base font-bold text-foreground">{place.name}</h3>
                {SHOW_SAMPLE_FEATURES && (
                  <SampleDataBadge label="Tagline saved on this device" className="shrink-0" />
                )}
              </div>
              {SHOW_SAMPLE_FEATURES && place.id && (
                <TaglineEditor placeId={place.id} metadata={place.metadata} saved={placeTagline(place)} />
              )}
              {place.description && (
                <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{place.description}</p>
              )}
              {amenities.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {amenities.map((a) => (
                    <span key={a} className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                      {a}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 space-y-1.5 border-t pt-3 text-xs text-muted-foreground">
                {!!place.phoneNumbers?.length && (
                  <p className="flex items-start gap-1.5">
                    <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> {place.phoneNumbers.join(", ")}
                  </p>
                )}
                {!!place.emails?.length && (
                  <p className="flex items-start gap-1.5 break-all">
                    <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> {place.emails.join(", ")}
                  </p>
                )}
                {place.address && (
                  <p className="flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    {[place.address, place.city, place.state].filter(Boolean).join(", ")}
                  </p>
                )}
                {place.website && (
                  <p className="flex items-center gap-1.5 truncate">
                    <Globe className="h-3.5 w-3.5 shrink-0 text-primary" /> {place.website}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-4">
            <h4 className="mb-3 font-display text-sm font-bold text-foreground">
              Opening hours (regular + special days)
            </h4>
            <OperatingHoursTable operatingHours={place.operatingHours} />
            <p className="mt-3 text-[11px] text-muted-foreground">
              {getOperatingHoursDisplay(place.operatingHours)}
            </p>
          </div>
        </aside>
      </div>

      <FacilityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} placeId={place.id!} />

      <Dialog open={!!removing} onOpenChange={(open) => !open && setRemoving(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {removing?.name}?</DialogTitle>
            <DialogDescription>
              It will no longer be listed for this place.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!removing?.id) return;
                await removeFacility.mutateAsync(removing.id);
                setRemoving(null);
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

