"use client";

import { SERVER_URL } from "@/constants";
import { useServerPagination } from "@/hooks/use-server-pagination";
import PlacesModal from "./_components/modals/create-places-modal";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlacesForm } from "./_context";
import Places from "./_components/places";
import DeleteModal from "@/components/modals/delete-modal";
import { useCallback, useState } from "react";
import { useOptimisticDelete } from "@/hooks/use-optimistic-delete";
import { DEFAULT_PLACES_VALUES } from "./_constants";
import SelectModal from "./_components/modals/select-modal";
import ClaimPlacesModal from "./_components/modals/claim-places-modal";
import { SinglePlace } from "./_components/claim-places-steps/find-place";
import PageHeader from "@/components/page-header";
import Breadcrumb from "@/components/breadcrumb";
import EmptyState from "@/components/empty-state";
import PaginationButton from "@/components/pagination-button";

export default function PlacesPage() {
  const { items, isLoading, currentPage, totalPages, handlePageChange } =
    useServerPagination<SinglePlace>({
      queryKey: "places",
      endpoint: `${SERVER_URL}/places`,
    });
  const { action, setAction, form, handleReset } = usePlacesForm();
  const [selectedPlace, setSelectedPlace] = useState<SinglePlace | null>(null);
  const { deleteItem } = useOptimisticDelete<SinglePlace & { id: string }>({
    queryKey: ["places"],
    deleteEndpoint: `${SERVER_URL}/places`,
    successMessage: "Place deleted successfully",
    errorMessage: "Failed to delete place",
  });
  const pendingPlaces = items?.filter((place) => place.status !== "PUBLISHED");
  const publishedPlaces = items?.filter(
    (place) => place.status === "PUBLISHED",
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
    [form, setAction],
  );

  const onDelete = useCallback(
    (place: SinglePlace) => {
      setSelectedPlace(place);
      setAction("delete");
    },
    [setAction],
  );

  return (
    <div>
      <Breadcrumb parent={{ label: "Tools", href: "/apps-tools" }} current="Places" />
      <PageHeader
        title="Places"
        subtitle="Publish short lets, venues and hubs — each place gets a public page, facilities, visitors and bookings."
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[420px] rounded-2xl" />
          ))}
        </div>
      ) : items && items.length > 0 ? (
        <div className="space-y-8">
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
          {totalPages > 1 && (
            <PaginationButton
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      ) : (
        <div className="rounded-2xl border bg-card">
          <EmptyState
            icon={<Building2 />}
            title="Welcome to Places"
            description="Set up Places to get the most out of your facility."
            action={
              <Button variant="brand" onClick={onAdd}>
                <Plus /> Get Started
              </Button>
            }
          />
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
