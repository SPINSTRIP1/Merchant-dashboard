"use client";

import { PLACES_SERVER_URL } from "@/constants";
import { useServerPagination } from "@/hooks/use-server-pagination";
import PlacesModal from "./_components/modals/create-places-modal";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePlacesForm } from "./_context";
import Loader from "@/components/loader";
import Places from "./_components/places";
import DeleteModal from "../deals/_components/modals/delete-modal";
import { useCallback, useState } from "react";
import { useOptimisticDelete } from "@/hooks/use-optimistic-delete";
import { DEFAULT_PLACES_VALUES } from "./_constants";
import SelectModal from "./_components/modals/select-modal";
import ClaimPlacesModal from "./_components/modals/claim-places-modal";
import { SinglePlace } from "./_components/claim-places-steps/find-place";

export default function PlacesPage() {
  const { items, isLoading } = useServerPagination<SinglePlace>({
    queryKey: "places",
    endpoint: `${PLACES_SERVER_URL}/places`,
  });
  const { action, setAction, form, handleReset } = usePlacesForm();
  const [selectedPlace, setSelectedPlace] = useState<SinglePlace | null>(null);
  const { deleteItem } = useOptimisticDelete<SinglePlace & { id: string }>({
    queryKey: ["places"],
    deleteEndpoint: `${PLACES_SERVER_URL}/places`,
    successMessage: "Place deleted successfully",
    errorMessage: "Failed to delete place",
  });
  const pendingPlaces = items?.filter((place) => place.status !== "PUBLISHED");
  const publishedPlaces = items?.filter(
    (place) => place.status === "PUBLISHED"
  );
  const onAdd = useCallback(() => {
    form.reset(DEFAULT_PLACES_VALUES);
    setAction("select");
  }, [form, setAction]);
  const onEdit = useCallback(
    (place: SinglePlace) => {
      //@ts-expect-error: TS not able to infer correctly here
      form.reset(place);
      setAction("edit");
    },
    [form, setAction]
  );

  const onDelete = useCallback(
    (place: SinglePlace) => {
      setSelectedPlace(place);
      setAction("delete");
    },
    [setAction]
  );

  if (isLoading) return <Loader />;
  return (
    <div>
      {items && items.length > 0 ? (
        <div className="space-y-6">
          <Places
            title="Pending Places"
            places={pendingPlaces}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
          />
          <Places
            title="Published Places"
            places={publishedPlaces}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
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
            onClick={onAdd}
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
      <SelectModal
        isOpen={action === "select"}
        onClose={(value) => setAction(value === "new" ? "add" : value)}
      />
      <ClaimPlacesModal isOpen={action === "claim"} onClose={handleReset} />
    </div>
  );
}
