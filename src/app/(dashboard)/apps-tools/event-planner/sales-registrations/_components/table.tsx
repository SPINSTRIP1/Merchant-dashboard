import SearchBar from "@/components/search-bar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useState } from "react";
import { FileSpreadsheet, Ticket } from "lucide-react";
import PaginationButton from "@/components/pagination-button";
import EmptyState from "@/components/empty-state";
import StatusPill from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportCsv, fmtDate, formatAmount } from "@/utils";
import {
  TicketTransaction,
  useEventRegistrations,
} from "@/hooks/use-event-registrations";

const STATUS_OPTIONS = ["All", "COMPLETED", "PENDING", "FAILED", "REFUNDED"];

export default function RegistrationTable({
  eventId,
  eventName,
}: {
  eventId: string | null;
  eventName?: string;
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

  const handleExport = () =>
    exportCsv(
      `${(eventName || "event").replace(/[^\w-]+/g, "-").toLowerCase()}-ticket-sales.csv`,
      ["Name", "Email Address", "Ticket", "Amount (NGN)", "Status", "Date"],
      currentItems.map((item) => [
        `${item.firstName} ${item.lastName}`,
        item.email,
        formatTickets(item.ticketTransactions),
        Number(item.totalAmount) || 0,
        item.status,
        fmtDate(item.createdAt),
      ])
    );

  return (
    <section className="mt-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="mr-2 font-display text-base font-bold text-foreground">Ticket Sales</h2>
        <SearchBar
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="h-11 w-[150px] rounded-full text-xs font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {status === "All" ? "All Statuses" : status.charAt(0) + status.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" className="ml-auto" onClick={handleExport} disabled={!currentItems.length}>
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
        ) : currentItems.length === 0 ? (
          <EmptyState
            icon={<Ticket />}
            title="No ticket sales yet"
            description={
              searchQuery || statusFilter !== "All"
                ? "No registrations match your search or filter."
                : "Registrations from the public event page will appear here."
            }
          />
        ) : (
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead>Ticket</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold text-foreground">
                    {item.firstName} {item.lastName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.email}</TableCell>
                  <TableCell className="text-foreground">{formatTickets(item.ticketTransactions)}</TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {formatAmount(Number(item.totalAmount) || 0)}
                  </TableCell>
                  <TableCell>
                    <StatusPill status={item.status} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{fmtDate(item.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {totalPages > 1 && (
          <div className="border-t">
            <PaginationButton currentPage={currentPage} onPageChange={setCurrentPage} totalPages={totalPages} />
          </div>
        )}
      </div>
    </section>
  );
}
