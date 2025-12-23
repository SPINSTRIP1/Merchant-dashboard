"use client";

import { PLACES_SERVER_URL } from "@/constants";
import { useServerPagination } from "@/hooks/use-server-pagination";
import PlacesModal from "./_components/modals/places-modal";
import { Place } from "./_schemas";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePlacesForm } from "./_context";
import Loader from "@/components/loader";
import Places from "./_components/places";
import DeleteModal from "../deals/_components/modals/delete-modal";
import { useState } from "react";
import { useOptimisticDelete } from "@/hooks/use-optimistic-delete";
import { DEFAULT_PLACES_VALUES } from "./_constants";

export default function PlacesPage() {
  const { items, isLoading } = useServerPagination<
    Place & { coverImage?: string }
  >({
    queryKey: "places",
    endpoint: `${PLACES_SERVER_URL}/places`,
  });
  const { action, setAction, form, handleReset } = usePlacesForm();
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const { deleteItem } = useOptimisticDelete<Place & { id: string }>({
    queryKey: ["places"],
    deleteEndpoint: `${PLACES_SERVER_URL}/places`,
    successMessage: "Place deleted successfully",
    errorMessage: "Failed to delete place",
  });
  const pendingPlaces = items?.filter((place) => place.status !== "PUBLISHED");
  const publishedPlaces = items?.filter(
    (place) => place.status === "PUBLISHED"
  );
  if (isLoading) return <Loader />;
  return (
    <div>
      {items && items.length > 0 ? (
        <div className="space-y-6">
          <Places
            title="Pending Places"
            places={pendingPlaces}
            onAdd={() => {
              form.reset(DEFAULT_PLACES_VALUES);
              setAction("add");
            }}
            onEdit={(place) => {
              form.reset(place);
              setAction("edit");
            }}
            onDelete={(place) => {
              setSelectedPlace(place);
              setAction("delete");
            }}
          />
          <Places
            title="Published Places"
            places={publishedPlaces}
            onAdd={() => {
              form.reset(DEFAULT_PLACES_VALUES);
              setAction("add");
            }}
            onEdit={(place) => {
              form.reset(place);
              setAction("edit");
            }}
            onDelete={(place) => {
              setSelectedPlace(place);
              setAction("delete");
            }}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center flex-col gap-y-1.5 flex-1 mt-52">
          <Image
            src={"/icons/work-in-progress.svg"}
            width={600}
            height={400}
            className="w-[174px] h-[106px]"
            alt="Empty state"
          />
          <h1 className="font-bold text-primary-text">Welcome to Places</h1>
          <p className="text-sm">
            Set up Places tto get the most out of your facility
          </p>
          <Button
            onClick={() => setAction("add")}
            size={"lg"}
            className="w-[368px] mt-2 h-[51px]"
          >
            Get Started
          </Button>
        </div>
      )}
      <PlacesModal
        isOpen={action === "add" || action === "edit"}
        onClose={handleReset}
        action={action}
      />
      <DeleteModal
        isOpen={action === "delete"}
        onClose={() => setAction(null)}
        title={selectedPlace?.name || ""}
        description="This place will be deleted permanently and cannot be recovered"
        secondaryText="Cancel"
        onDeleteConfirm={() => deleteItem(selectedPlace?.id || "")}
      />
    </div>
  );
}
