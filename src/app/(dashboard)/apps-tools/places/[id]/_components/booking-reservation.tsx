import SearchBar from "@/components/search-bar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardList, FileSpreadsheet, MoreVertical, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useMemo, useState } from "react";
import { formatAmount } from "@/utils";
import EmptyState from "@/components/empty-state";
import StatusPill from "@/components/status-pill";
import SampleDataBadge from "@/components/sample-data-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useServerPagination } from "@/hooks/use-server-pagination";
import { SERVER_URL } from "@/constants";
import { useDebounce } from "@/hooks/use-debounce";
import PaginationButton from "@/components/pagination-button";
import { useOptimisticDelete } from "@/hooks/use-optimistic-delete";
import DeleteModal from "@/components/modals/delete-modal";
import { usePlaceFacilities } from "@/hooks/use-places";
import {
  BOOKING_STATUSES,
  useBookingStatusOverrides,
  useUpdateBookingStatus,
  visitorRef,
  type BookingStatus,
} from "@/hooks/use-place-extras";
import { exportCsv } from "@/utils";

type Status = "Pending" | "Confirmed" | "Cancelled" | "Completed" | "No-Show";

interface Booking {
  id: string;
  placeId: string;
  facilityId: string;
  feeId: string;
  appointmentType: string;
  scheduledDate: string;
  endDate: string;
  recurrencePattern: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  purpose: string;
  notes: string;
  status: Status;
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  NO_SHOW: "No-Show",
};
const ALL = "all";

export default function BookingReservation() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState("");
  const [action, setAction] = useState<"delete" | null>(null);
  const [selectedItem, setSelectedItem] = useState<Booking | null>(null);
  const { id } = useParams() as { id: string | undefined };
  const { items, currentPage, totalPages, isLoading, handlePageChange } =
    useServerPagination<Booking>({
      queryKey: ["places-bookings", id || ""],
      endpoint: `${SERVER_URL}/places/${id}/appointments`,
      enabled: !!id,
      searchQuery: debouncedSearch,
      filters: {
        status: statusFilter,
      },
    });

  const { deleteItem } = useOptimisticDelete<Booking>({
    queryKey: ["places-bookings", currentPage],
    deleteEndpoint: `${SERVER_URL}/places/appointments`,
    successMessage: "Item deleted successfully",
    errorMessage: "Failed to delete item",
  });

  // Display helpers: facility names and fee amounts come from the place's facilities.
  const { facilities } = usePlaceFacilities(id);
  const facilityById = useMemo(
    () => new Map(facilities.map((f) => [f.id, f])),
    [facilities]
  );
  const feeAmount = (booking: Booking) => {
    const facility = facilityById.get(booking.facilityId);
    const fee = facility?.fees?.find((f) => (f as { id?: string }).id === booking.feeId) ?? facility?.fees?.[0];
    return fee ? fee.amount : null;
  };

  // Status changes made in the dashboard (sample data until there's an update endpoint).
  const statusOverrides = useBookingStatusOverrides();
  const updateStatus = useUpdateBookingStatus();
  const statusOf = (booking: Booking) =>
    (statusOverrides[booking.id] as BookingStatus | undefined) ??
    (String(booking.status).toUpperCase().replace("-", "_") as BookingStatus);

  const rows = items ?? [];

  const handleExport = () =>
    exportCsv(
      "bookings.csv",
      ["Visitor Name", "Visitor ID", "Email", "Phone Number", "Facility", "Status", "Fee (NGN)"],
      rows.map((b) => [
        b.visitorName,
        visitorRef(b.id),
        b.visitorEmail,
        b.visitorPhone,
        facilityById.get(b.facilityId)?.name ?? "",
        STATUS_LABELS[statusOf(b)] ?? b.status,
        feeAmount(b) ?? "",
      ])
    );

  return (
    <section className="w-full">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchBar
          placeholder="Search bookings…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select value={statusFilter || ALL} onValueChange={(v) => setStatusFilter(v === ALL ? "" : v)}>
          <SelectTrigger className="h-11 w-[170px] rounded-full text-xs font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Statuses</SelectItem>
            {BOOKING_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" className="ml-auto" onClick={handleExport} disabled={!rows.length}>
          <FileSpreadsheet /> Export Sheet
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<ClipboardList />}
            title="No bookings yet"
            description={
              searchQuery || statusFilter
                ? "No bookings match your filters."
                : "Reservations for this place's facilities will appear here."
            }
          />
        ) : (
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead>Visitor Name</TableHead>
                <TableHead>Visitor ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Facility</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => {
                const status = statusOf(item);
                const fee = feeAmount(item);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold text-foreground">{item.visitorName}</TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">{visitorRef(item.id)}</TableCell>
                    <TableCell className="text-muted-foreground">{item.visitorEmail || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{item.visitorPhone || "—"}</TableCell>
                    <TableCell className="text-foreground">
                      {facilityById.get(item.facilityId)?.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5">
                        <StatusPill status={status} label={STATUS_LABELS[status] ?? String(item.status)} />
                        {statusOverrides[item.id] && <SampleDataBadge label="Changed" />}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {fee !== null ? formatAmount(fee) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          aria-label={`Actions for ${item.visitorName}`}
                          className="grid h-9 w-9 place-items-center rounded-full outline-none hover:bg-muted"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                          <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Set status
                          </DropdownMenuLabel>
                          {BOOKING_STATUSES.map((s) => (
                            <DropdownMenuItem
                              key={s}
                              className="cursor-pointer"
                              disabled={s === status}
                              onClick={() => updateStatus.mutate({ id: item.id, status: s })}
                            >
                              {STATUS_LABELS[s]}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer text-rose-500 focus:text-rose-500"
                            onClick={() => {
                              setSelectedItem(item);
                              setAction("delete");
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Booking
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        {!isLoading && totalPages > 1 && (
          <div className="border-t">
            <PaginationButton currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={action === "delete"}
        title="this appointment"
        onClose={() => setAction(null)}
        onDeleteConfirm={() => deleteItem(selectedItem?.id || "")}
        secondaryText="Cancel"
        description="This appointment will be deleted permanently and cannot be recovered!"
      />
    </section>
  );
}
