import Dropdown from "@/components/dropdown";
import SearchBar from "@/components/search-bar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Delete02Icon, Edit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { EllipsisVertical } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { formatAmount } from "@/utils";
import EmptyState from "@/components/empty-state";
import { useServerPagination } from "@/hooks/use-server-pagination";
import { SERVER_URL } from "@/constants";
import { useDebounce } from "@/hooks/use-debounce";
import PaginationButton from "@/components/pagination-button";
import { useOptimisticDelete } from "@/hooks/use-optimistic-delete";
import DeleteModal from "@/components/modals/delete-modal";

type Status = "Pending" | "Confirmed" | "Cancelled" | "Completed" | "No-Show";

export const statusColors: Record<Status, string> = {
  Completed: "text-[#34C759] bg-[#34C75926]",
  Pending: "text-[#FF8D28] bg-[#F6E9DD]",
  Cancelled: "text-[#FF383C] bg-[#FF383C26]",
  "No-Show": "text-[#0088FF] bg-[#0088FF26]",
  Confirmed: "text-[#FFD60A] bg-[#FFD60A26]",
};

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

  return (
    <section className="w-full mt-6">
      <div className="flex flex-col md:flex-row md:items-center gap-y-3 justify-between w-full">
        <h1 className="text-sm lg:text-base font-bold">
          Bookings & Reservation
        </h1>
        <SearchBar
          placeholder="Search"
          className="bg-[#F3F3F3] w-full max-w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Dropdown
          header=""
          options={[
            "Pending",
            "Confirmed",
            "Cancelled",
            "Completed",
            "No-Show",
          ]}
          placeholder="Filter by Status"
          onSelect={(value) => {
            switch (value) {
              case "Pending":
                setStatusFilter("PENDING");
                break;
              case "Confirmed":
                setStatusFilter("CONFIRMED");
                break;
              case "Cancelled":
                setStatusFilter("CANCELLED");
                break;
              case "Completed":
                setStatusFilter("COMPLETED");
                break;
              case "No-Show":
                setStatusFilter("NO_SHOW");
                break;
            }
          }}
        />
      </div>
      <div className="bg-foreground rounded-3xl p-5 mt-4">
        <Table>
          <TableHeader>
            <TableRow className="border-b-0">
              {[
                "Visitor Name",
                "Visitor ID",
                "Email",
                "Phone Number",
                "Facility",
                "Status",
                "Fee",

                "Actions",
              ].map((header) => (
                <TableHead
                  key={header}
                  className="text-primary-text font-bold text-base"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <p className="text-gray-500">
                    Loading bookings & reservations...
                  </p>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-0">
                  <EmptyState
                    // icon={<Package className="h-16 w-16 text-primary" />}
                    title="No Bookings & Reservations Added Yet"
                    description={
                      searchQuery
                        ? "No items match your search criteria. Try adjusting your filters."
                        : "You haven't added any bookings or reservations yet. Add your first one to get started!"
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              items?.map((item) => (
                <TableRow
                  className="border-b-0 cursor-pointer hover:bg-neutral"
                  key={item.id}
                >
                  <TableCell>{item.visitorName}</TableCell>
                  <TableCell>{item.visitorName}</TableCell>
                  <TableCell>{item.visitorEmail}</TableCell>
                  <TableCell>{item.visitorPhone}</TableCell>
                  <TableCell>{item.facilityId}</TableCell>
                  <TableCell className="w-[140px]">
                    <div
                      className={`${
                        statusColors[item.status] || statusColors["Pending"]
                      } w-[80px] flex items-center justify-center py-1 rounded-lg`}
                    >
                      <p className="font-semibold text-xs">{item.status}</p>
                    </div>
                  </TableCell>
                  <TableCell>{formatAmount(item.feeId)}</TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="pl-4 outline-none">
                        <EllipsisVertical />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[190px] py-2.5 px-2 mr-5 md:mr-0 bg-neutral border rounded-2xl shadow-none border-neutral-accent">
                        {[
                          {
                            icon: Edit02Icon,
                            label: "Edit Item",
                            onClick: () => {},
                          },

                          {
                            icon: Delete02Icon,
                            label: "Delete Item",
                            color: "#FF5F57",
                            onClick: () => {
                              setSelectedItem(item);
                              setAction("delete");
                            },
                          },
                        ].map(({ icon, label, color, onClick }) => (
                          <DropdownMenuItem
                            key={label}
                            // onClick={(e) => {
                            //   onClick();
                            // }}
                            onClick={onClick}
                            className="flex items-center cursor-pointer gap-2"
                          >
                            <HugeiconsIcon
                              icon={icon}
                              size={24}
                              color={color || "#6F6D6D"}
                            />
                            <p
                              style={{ color: color || "#6F6D6D" }}
                              className=" text-sm"
                            >
                              {" "}
                              {label}
                            </p>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && totalPages > 0 && (
        <PaginationButton
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

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
