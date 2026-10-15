import SearchBar from "@/components/search-bar";
import DetailsModal from "./details-modal";
import AddEventsModal from "./add-events-modal";
import { useEventsForm } from "../_context";
import { useServerPagination } from "@/hooks/use-server-pagination";
import { SERVER_URL } from "@/constants";
import { Event } from "../_schemas";
import EmptyState from "@/components/empty-state";
// import { useOptimisticDelete } from "@/hooks/use-optimistic-delete";
import DeleteModal from "@/components/modals/delete-modal";
import { useEffect, useMemo, useState } from "react";
import { fmtDate, formatDateForInput } from "@/utils";
import { extractTimeFromDateTime } from "../_utils";
import api from "@/lib/api/axios-client";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { DEFAULT_EVENT_VALUES } from "../_constants";
import { motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BarChart3, CalendarDays, Eye, MapPin, PartyPopper, Pencil, Plus, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PaginationButton from "@/components/pagination-button";
import { usePlace } from "@/hooks/use-places";
import { useDeletedEventIds } from "@/hooks/use-event-extras";
import { cn } from "@/lib/utils";

const ALL = "all";
const STATUS_OPTIONS = [
  { value: ALL, label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Cancelled" },
  { value: "DRAFT", label: "Draft" },
];
const WHEN_OPTIONS = [
  { value: ALL, label: "Any time" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
];
const SORT_OPTIONS = [
  { value: ALL, label: "Sort by" },
  { value: "name", label: "Name" },
  { value: "startDate", label: "Start Date" },
  { value: "endDate", label: "End Date" },
  { value: "updated", label: "Date Updated" },
  { value: "created", label: "Date Created" },
];

/** New events default to Nigeria / Africa/Lagos; the merchant can change both. */
const NEW_EVENT_DEFAULTS = { ...DEFAULT_EVENT_VALUES, country: "Nigeria", timezone: "Africa/Lagos" };

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
  const { items, isLoading, refetch, currentPage, totalPages, handlePageChange } = useServerPagination<Event>({
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
    newStatus: "ACTIVE" | "INACTIVE",
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
  const [when, setWhen] = useState<string>(ALL);
  const deletedIds = useDeletedEventIds();

  const openEdit = (event: Event) => {
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
  };

  const openCreate = () => {
    form.reset(NEW_EVENT_DEFAULTS);
    setAction("add");
  };

  // Deep link from a place's "Add Event": /apps-tools/event-planner?create=1&placeId=…
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const createParam = searchParams.get("create");
  const placeIdParam = searchParams.get("placeId");
  const { place: linkedPlace, isLoading: isPlaceLoading } = usePlace(createParam ? placeIdParam : null);
  useEffect(() => {
    if (createParam !== "1" || (placeIdParam && isPlaceLoading)) return;
    form.reset({
      ...NEW_EVENT_DEFAULTS,
      ...(linkedPlace && {
        placeId: linkedPlace.id,
        location: linkedPlace.address || "",
        city: linkedPlace.city || "",
        state: linkedPlace.state || "",
        country: linkedPlace.country || "",
      }),
    });
    setAction("add");
    router.replace(pathname, { scroll: false });
  }, [createParam, placeIdParam, isPlaceLoading, linkedPlace, form, setAction, router, pathname]);

  const now = Date.now();
  const visibleEvents = useMemo(
    () =>
      (items ?? []).filter((event) => {
        if (event.id && deletedIds.includes(event.id)) return false;
        if (when === ALL) return true;
        const isPast = new Date(event.endDate || event.startDate).getTime() < now;
        return when === "past" ? isPast : !isPast;
      }),
    [items, deletedIds, when, now]
  );

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchBar
          placeholder="Search events…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select value={statusFilter || ALL} onValueChange={(v) => setStatusFilter(v === ALL ? "" : v)}>
          <SelectTrigger className="h-11 w-[140px] rounded-full text-xs font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={when} onValueChange={setWhen}>
          <SelectTrigger className="h-11 w-[130px] rounded-full text-xs font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WHEN_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy || ALL} onValueChange={(v) => setSortBy(v === ALL ? "" : v)}>
          <SelectTrigger className="h-11 w-[150px] rounded-full text-xs font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="brand" className="ml-auto" onClick={openCreate}>
          <Plus /> Create Event
        </Button>
      </div>

      <h2 className="mb-3 font-display text-base font-bold text-foreground">My Events</h2>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : visibleEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleEvents.map((event, index) => {
            const isCancelled = event.status === "INACTIVE";
            return (
              <motion.article
                key={event.id ?? index}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.35 }}
                className={cn(
                  "card-hover flex flex-col overflow-hidden rounded-2xl border bg-card",
                  isCancelled && "opacity-60"
                )}
              >
                <div className="relative h-40">
                  {event?.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element -- event images may come from hosts not in next.config
                    <img src={event.images[0]} alt={event.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="brand-gradient-soft grid h-full place-items-center">
                      <PartyPopper className="h-8 w-8 text-primary/60" />
                    </div>
                  )}
                  <div className="absolute left-3 top-3 flex gap-1.5">
                    {isCancelled && (
                      <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                        Cancelled
                      </span>
                    )}
                    {!isCancelled && event.isFeatured && (
                      <span className="brand-gradient inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                        <Star className="h-3 w-3" /> Featured
                      </span>
                    )}
                    {event.status === "DRAFT" && (
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase text-muted-foreground">
                        Draft
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="truncate font-display text-base font-bold text-foreground">{event.name}</h3>
                  <div className="mt-2 flex-1 space-y-1.5 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> {event.city}, {event.state}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-primary" /> {fmtDate(event.startDate)}
                      {extractTimeFromDateTime(event.startDate) && ` · ${extractTimeFromDateTime(event.startDate)}`}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 text-primary" />
                      {event.totalImpressions ? `${event.totalImpressions.toLocaleString()} views` : "No views yet"}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 border-t pt-3">
                    <Button size="sm" variant="outline" onClick={() => openEdit(event)}>
                      <Pencil /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="soft"
                      onClick={() => {
                        setSelectedEvent(event);
                        setAction("details");
                      }}
                    >
                      <BarChart3 /> Insights
                    </Button>
                    {!isCancelled && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEvent(event);
                          setAction("delete");
                        }}
                        className="ml-auto inline-flex min-h-[36px] items-center gap-1 rounded-full px-3 text-xs font-semibold text-rose-500 transition-colors hover:bg-rose-500/10"
                      >
                        <X className="h-3.5 w-3.5" /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border bg-card">
          <EmptyState
            icon={<PartyPopper />}
            title="No events found"
            description={
              searchQuery || statusFilter || when !== ALL
                ? "No events match your filters."
                : "Create your first event to start selling tickets."
            }
            action={
              <Button variant="brand" onClick={openCreate}>
                <Plus /> Create Event
              </Button>
            }
          />
        </div>
      )}
      {!isLoading && totalPages > 1 && (
        <PaginationButton currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
      <DetailsModal
        isOpen={action === "details"}
        event={selectedEvent}
        onClose={() => setAction(null)}
        onEdit={(event) => openEdit(event)}
        onCancelEvent={(event) => {
          setSelectedEvent(event);
          setAction("delete");
        }}
      />
      <AddEventsModal
        isOpen={action === "add" || action === "edit"}
        action={action === "edit" ? "edit" : "add"}
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
