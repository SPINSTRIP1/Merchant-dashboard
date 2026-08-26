import Dropdown from "@/components/dropdown";
import SearchBar from "@/components/search-bar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GoogleSheetIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React, { useState } from "react";
import PaginationButton from "@/components/pagination-button";
import EmptyState from "@/components/empty-state";
import { formatDateDisplay } from "@/utils";
import {
  TicketTransaction,
  useEventRegistrations,
} from "@/hooks/use-event-registrations";

const statusStyles: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  FAILED: "bg-red-100 text-red-600",
};

const STATUS_OPTIONS = ["All", "COMPLETED", "PENDING", "FAILED", "REFUNDED"];

export default function RegistrationTable({
  eventId,
}: {
  eventId: string | null;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const { registrations, pagination, isLoading } = useEventRegistrations({
    eventId,
    page: currentPage,
    limit: 15,
    status: statusFilter,
  });

  const totalPages = pagination?.totalPages ?? 1;

  // Search filters the current page client-side (API has no search param)
  const currentItems = registrations.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      `${item.firstName} ${item.lastName}`.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query)
    );
  });

  const formatTickets = (transactions: TicketTransaction[]) => {
    if (!transactions?.length) return "—";
    return transactions
      .map((t) => `${t.quantity} x ${t.ticketTier?.name ?? "Ticket"}`)
      .join(", ");
  };

  return (
    <section className="mt-5">
      <div className="flex flex-col md:flex-row md:items-center gap-y-3 justify-between w-full">
        <h1 className="text-sm lg:text-base font-bold">Ticket Sales</h1>
        <SearchBar
          placeholder="Search by name or email"
          className="bg-[#F3F3F3] w-full max-w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex items-center justify-between md:justify-start gap-x-2">
          <div className="flex items-center gap-x-2">
            <Dropdown
              header=""
              options={STATUS_OPTIONS}
              placeholder="All"
              onSelect={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button className="rounded-2xl bg-primary h-12 md:h-10 text-white flex justify-center items-center gap-2 px-4">
            <HugeiconsIcon icon={GoogleSheetIcon} size={24} color="#FFFFFF" />
            <p className="font-normal">Export Sheet</p>
          </button>
        </div>
      </div>
      <div className="bg-foreground rounded-3xl p-5 mt-8">
        <Table>
          <TableHeader>
            <TableRow className="border-b-0">
              {[
                "Name",
                "Email Address",
                "Ticket",
                "Amount",
                "Status",
                "Date",
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
                <TableCell colSpan={6}>
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-0">
                  <EmptyState
                    title="No Registrations Yet"
                    description={
                      searchQuery || statusFilter !== "All"
                        ? "No registrations match your search criteria. Try adjusting your filters."
                        : "Registrations will appear here once people start registering for your event."
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((item) => (
                <TableRow
                  className="border-b-0 cursor-pointer hover:bg-neutral"
                  key={item.id}
                >
                  <TableCell>
                    {item.firstName} {item.lastName}
                  </TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>
                    {formatTickets(item.ticketTransactions)}
                  </TableCell>
                  <TableCell>
                    ₦{(Number(item.totalAmount) || 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        statusStyles[item.status] ??
                        "bg-neutral text-primary-text"
                      }`}
                    >
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell>{formatDateDisplay(item.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Component */}
      <PaginationButton
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        totalPages={totalPages}
      />
    </section>
  );
}
