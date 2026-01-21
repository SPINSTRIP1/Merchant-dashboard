import Dropdown from "@/components/dropdown";
import SearchBar from "@/components/search-bar";
import {
  Calendar03Icon,
  Chart03Icon,
  Edit02Icon,
  Location01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import DetailsModal from "./details-modal";
import AddEventsModal from "./add-events-modal";
import { useEventsForm } from "../_context";
import { useServerPagination } from "@/hooks/use-server-pagination";
import { SERVER_URL } from "@/constants";
import { Event } from "../_schemas";
import Loader from "@/components/loader";
import EmptyState from "@/components/empty-state";
import AddButton from "@/app/(dashboard)/_components/add-button";
// import { useOptimisticDelete } from "@/hooks/use-optimistic-delete";
import DeleteModal from "../../deals/_components/modals/delete-modal";
import { useState } from "react";
import { formatDateDisplay, formatDateForInput } from "@/utils";
import { extractTimeFromDateTime } from "../_utils";
import api from "@/lib/api/axios-client";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useDebounce } from "../../places/_hooks/use-debounce";
import { DEFAULT_EVENT_VALUES } from "../_constants";
import StatusBadge from "@/components/status-badge";
import ImpressionsStack from "./impressions-stack";
import { X } from "lucide-react";

export default function EventsTable() {
  const {
    searchQuery,
    setSearchQuery,
    action,
    setAction,
    form,
    statusFilter,
    sortBy,
    setSortBy,
    setStatusFilter,
  } = useEventsForm();
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { items, isLoading, refetch } = useServerPagination<Event>({
    queryKey: "events",
    endpoint: `${SERVER_URL}/events`,
    searchQuery: debouncedSearch,
    filters: {
      status: statusFilter,
      sortBy,
    },
  });
  // const { deleteItem } = useOptimisticDelete<Event & { id: string }>({
  //   queryKey: ["events"],
  //   deleteEndpoint: `${SERVER_URL}/events`,
  //   successMessage: "Event deleted successfully",
  //   errorMessage: "Failed to delete event",
  // });
  const queryClient = useQueryClient();
  const handleStatusChange = async (
    id: string,
    newStatus: "ACTIVE" | "INACTIVE"
  ) => {
    try {
      await api.patch(`${SERVER_URL}/events/${id}`, {
        status: newStatus,
      });
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["events-stats"] });
      toast.success("Event cancelled successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to change event status");
    }
  };
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-center gap-y-3 justify-between w-full">
        <h1 className="text-sm lg:text-base text-primary-text font-bold">
          Events
        </h1>
        <SearchBar
          placeholder="Search events"
          className="bg-[#F3F3F3]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex items-center justify-between md:justify-start gap-x-3">
          <div className="flex gap-x-3 items-center">
            <Dropdown
              header=""
              options={["All Status", "Active", "Cancelled", "Draft"]}
              placeholder="All Status"
              onSelect={(value) => {
                if (value === "All Status") {
                  setStatusFilter("");
                } else if (value === "Active") {
                  setStatusFilter("ACTIVE");
                } else if (value === "Cancelled") {
                  setStatusFilter("INACTIVE");
                } else if (value === "Draft") {
                  setStatusFilter("DRAFT");
                }
              }}
            />
            <Dropdown
              header=""
              options={[
                "Name",
                "Price",
                "Stock",
                "Date Updated",
                "Date Created",
              ]}
              placeholder="Sort by"
              onSelect={(value) => {
                switch (value) {
                  case "Name":
                    setSortBy("name");
                    break;
                  case "Start Date":
                    setSortBy("startDate");
                    break;
                  case "End Date":
                    setSortBy("endDate");
                    break;
                  case "Date Updated":
                    setSortBy("updated");
                    break;
                  case "Date Created":
                    setSortBy("created");
                    break;
                }
              }}
            />
          </div>

          <AddButton
            title="Create Event"
            onClick={() => {
              form.reset(DEFAULT_EVENT_VALUES);
              setAction("add");
            }}
          />
        </div>
      </div>
      <h2 className="text-sm mt-5 lg:text-base text-primary-text font-bold">
        My Events
      </h2>
      {isLoading ? (
        <Loader />
      ) : items && items.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {items.map((event, index) => (
            <div
              key={index}
              className="mt-5 flex flex-col gap-y-2 min-w-[348px] max-w-[348px] w-full"
            >
              <div className="w-full h-[206px]">
                <Image
                  src={event?.images?.[0] || ""}
                  alt={event.name}
                  width={400}
                  height={600}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
              <h2 className="text-sm lg:text-base font-bold">{event.name}</h2>
              {/* <div className="flex items-center gap-x-2">
                <Image
                  src={event?.images?.[0] || ""}
                  alt={event.name}
                  width={40}
                  height={40}
                  className="w-5 h-5 object-cover rounded-full"
                />
                <p className="text-sm">{event.tagline || ""}</p>
              </div> */}
              <div className="flex items-center gap-x-2">
                <div className="flex items-center gap-x-2">
                  <HugeiconsIcon
                    icon={Location01Icon}
                    size={24}
                    color="#6F6D6D"
                  />
                  <p className="text-sm">
                    {event.city}, {event.state}
                  </p>
                </div>
                <div className="flex items-center gap-x-2">
                  <HugeiconsIcon
                    icon={Calendar03Icon}
                    size={24}
                    color="#6F6D6D"
                  />
                  <p className="text-sm">
                    {formatDateDisplay(event.startDate)}
                  </p>
                </div>
              </div>
              <ImpressionsStack impressions={event.totalImpressions ?? 0} />
              <div className="flex justify-between w-full">
                <div className="flex items-center gap-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      form.reset({
                        name: event.name,
                        description: event.description,
                        location: event.location,
                        startDate: formatDateForInput(event.startDate),
                        endDate: formatDateForInput(event.endDate),
                        frequency: event.frequency,
                        recurringPattern: event.recurringPattern,
                        customRecurrenceDays: event.customRecurrenceDays,
                        images: event.images,
                        id: event.id,
                        contactEmail: event.contactEmail,
                        contactPhone: event.contactPhone,
                        city: event.city,
                        country: event.country,
                        dealId: event.dealId,
                        placeId: event.placeId,
                        isFeatured: event.isFeatured,
                        soldOutThreshold: event.soldOutThreshold,
                        ticketTiers: event.ticketTiers,
                        expectedGuests: event.expectedGuests,
                        startTime: extractTimeFromDateTime(event.startDate),
                        endTime: extractTimeFromDateTime(event.endDate),
                        state: event.state,
                        timezone: event.timezone,
                      });
                      setAction("edit");
                    }}
                    className="rounded-2xl bg-primary h-[35px] px-2 text-white flex justify-center items-center gap-2"
                  >
                    <HugeiconsIcon
                      icon={Edit02Icon}
                      size={16}
                      color="#FFFFFF"
                    />
                    <p className="font-normal text-sm">Edit</p>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setAction("details");
                    }}
                    className="rounded-2xl text-primary bg-primary-accent h-[35px] px-2 flex justify-center items-center gap-2"
                  >
                    <HugeiconsIcon
                      icon={Chart03Icon}
                      color="#6932E2"
                      size={16}
                    />
                    <p className="font-normal text-sm">Insights</p>
                  </button>
                </div>

                {event.status === "INACTIVE" ? (
                  <StatusBadge status="REJECTED" title="CANCELLED" />
                ) : (
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setAction("delete");
                    }}
                    className="rounded-2xl text-[#FF383C] bg-[#F6DDDD] h-[35px] px-2 flex justify-center items-center gap-2"
                  >
                    <X size={16} className="text-[#FF383C]" color="#FF383C" />
                    <p className="font-normal text-sm">Cancel</p>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Events Found"
          description="You have not created any events yet. Click the button below to create your first event."
        />
      )}
      <DetailsModal
        isOpen={action === "details"}
        event={selectedEvent}
        onClose={() => setAction(null)}
      />
      <AddEventsModal
        isOpen={action === "add" || action === "edit"}
        onClose={() => setAction(null)}
      />
      <DeleteModal
        isOpen={action === "delete"}
        onClose={() => setAction(null)}
        title={selectedEvent?.name || ""}
        description="Are you sure you want to cancel this event?"
        primaryText="Cancel"
        secondaryText="Back"
        onDeleteConfirm={() =>
          handleStatusChange(selectedEvent?.id || "", "INACTIVE")
        }
      />
    </section>
  );
}
