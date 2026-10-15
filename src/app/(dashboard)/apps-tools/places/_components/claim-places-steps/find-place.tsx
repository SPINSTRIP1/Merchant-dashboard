"use client";

import React from "react";
import Image from "next/image";
import { Building2, Clock, Eye, Globe, MapPin } from "lucide-react";
import SearchBar from "@/components/search-bar";
import EmptyState from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useServerPagination } from "@/hooks/use-server-pagination";
import { SERVER_URL } from "@/constants";
import { useDebounce } from "@/hooks/use-debounce";
import { Place } from "../../_schemas";
import { getOperatingHoursDisplay, getPlaceType } from "../../_utils";
import { usePlacesForm } from "../../_context";

export interface SinglePlace extends Omit<Place, "coverImage"> {
  coverImage: string;
  stats: {
    visitors: number;
    facilities: number;
    revenue: number;
    sales: number;
    reservations: number;
  };
}

export default function FindPlace() {
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { form, setCurrentStep } = usePlacesForm();
  const { items, isLoading } = useServerPagination<SinglePlace>({
    queryKey: "unclaimed-places",
    endpoint: `${SERVER_URL}/places/unclaimed`,
    searchQuery: debouncedSearchQuery,
  });

  return (
    <div className="space-y-4">
      <SearchBar
        placeholder="Search"
        className="max-w-full md:max-w-full"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : !items || items.length === 0 ? (
        <EmptyState
          icon={<Building2 />}
          title="No Places Found"
          description={
            searchQuery
              ? "No places match your search criteria. Please try again with different keywords."
              : "No places available to claim at the moment."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((place, index) => (
            <article key={index} className="flex flex-col overflow-hidden rounded-2xl border bg-card">
              {place.coverImage ? (
                <div className="relative h-32">
                  <Image src={place.coverImage} alt={place.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="brand-gradient-soft grid h-32 place-items-center">
                  <Building2 className="h-7 w-7 text-primary/60" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-4">
                <h3 className="truncate font-display text-base font-bold text-foreground">
                  {place.name} - {place.city}
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-wide text-primary">
                  {getPlaceType(place.placeType!)}
                </p>
                {place.description && (
                  <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{place.description}</p>
                )}
                <div className="mt-3 flex-1 space-y-1.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> {place.city}, {place.state}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    {getOperatingHoursDisplay(place.operatingHours)}
                  </p>
                  <p className="flex items-center gap-1.5 truncate">
                    <Globe className="h-3.5 w-3.5 shrink-0 text-primary" /> {place.website || "N/A"}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-primary" />
                    {place.views ? `${place.views.toLocaleString()} views` : "No views yet"}
                  </p>
                </div>
                <Button variant="brand" size="sm" className="mt-4 w-full" onClick={() => {
                    // Remember which place is being claimed; the final step posts to /places/{id}/claim
                    form.setValue("id", place.id);
                    setCurrentStep(2);
                  }}>
                  Claim
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
