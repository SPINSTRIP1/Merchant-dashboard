"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CalendarCheck, FileSpreadsheet, XCircle } from "lucide-react";
import SearchBar from "@/components/search-bar";
import EmptyState from "@/components/empty-state";
import StatusPill from "@/components/status-pill";
import PaginationButton from "@/components/pagination-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CUSTOMER_BOOKING_STATUSES,
  useCancelBooking,
  usePlaceBookings,
  type CustomerBooking,
} from "@/hooks/use-place-extras";
import { exportCsv, fmtDate, formatAmount } from "@/utils";

const ALL = "all";
const STATUS_LABELS: Record<string, string> = {
  PENDING: "Awaiting payment",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  REFUNDED: "Refunded",
};

const guestName = (b: CustomerBooking) => [b.firstName, b.lastName].filter(Boolean).join(" ") || b.email;
const stay = (b: CustomerBooking) =>
  b.checkOutDate ? `${fmtDate(b.checkInDate)} → ${fmtDate(b.checkOutDate)}` : fmtDate(b.checkInDate);

/** Facility bookings customers made and paid for on the public site (places.spinstrip.com). */
export default function CustomerBookings() {
  const { id } = useParams() as { id: string | undefined };
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [cancelling, setCancelling] = useState<CustomerBooking | null>(null);
  const { items, totalPages, total, isLoading } = usePlaceBookings({ placeId: id, page, status });
  const cancelBooking = useCancelBooking();

  // The endpoint has no search parameter, so search filters the loaded page.
  const rows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((b) =>
      [guestName(b), b.email, b.phone, b.facility?.name, b.transactionRef].some((v) => (v ?? "").toLowerCase().includes(q))
    );
  }, [items, searchQuery]);

  const handleExport = () =>
    exportCsv(
      "place-bookings.csv",
      ["Guest", "Email", "Phone", "Facility", "Tier", "Check-in", "Check-out", "Amount (NGN)", "Status", "Reference"],
      rows.map((b) => [
        guestName(b),
        b.email,
        b.phone,
        b.facility?.name ?? "",
        b.fee?.name ?? "",
        fmtDate(b.checkInDate),
        b.checkOutDate ? fmtDate(b.checkOutDate) : "",
        b.totalAmount,
        STATUS_LABELS[b.status] ?? b.status,
        b.transactionRef ?? "",
      ])
    );

  const confirmCancel = async () => {
    if (!cancelling) return;
    try {
      await cancelBooking.mutateAsync(cancelling.id);
      setCancelling(null);
    } catch {
      // error toast shown by the hook
    }
  };

  return (
    <section className="w-full">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchBar
          placeholder="Search guest, facility, reference…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select
          value={status || ALL}
          onValueChange={(v) => {
            setStatus(v === ALL ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-11 w-[170px] rounded-full text-xs font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Statuses</SelectItem>
            {CUSTOMER_BOOKING_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {total > 0 && <span className="text-xs text-muted-foreground">{total.toLocaleString()} bookings</span>}
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
            icon={<CalendarCheck />}
            title="No bookings yet"
            description={
              searchQuery || status
                ? "No bookings match your filters."
                : "When customers book a facility on your public page, their bookings show up here."
            }
          />
        ) : (
          <Table className="min-w-[980px]">
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Facility</TableHead>
                <TableHead>Stay</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Booked</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((b) => {
                const cancellable = b.status === "PENDING" || b.status === "CONFIRMED";
                return (
                  <TableRow key={b.id}>
                    <TableCell>
                      <p className="font-semibold text-foreground">{guestName(b)}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {b.email}
                        {b.phone ? ` · ${b.phone}` : ""}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-foreground">{b.facility?.name ?? "—"}</p>
                      {b.fee?.name && <p className="text-[11px] text-muted-foreground">{b.fee.name}</p>}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{stay(b)}</TableCell>
                    <TableCell className="font-semibold text-foreground">{formatAmount(Number(b.totalAmount) || 0)}</TableCell>
                    <TableCell>
                      <StatusPill status={b.status} label={STATUS_LABELS[b.status]} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{fmtDate(b.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {cancellable ? (
                        <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-600" onClick={() => setCancelling(b)}>
                          <XCircle /> Cancel
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        {!isLoading && totalPages > 1 && (
          <div className="border-t">
            <PaginationButton currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <Dialog open={!!cancelling} onOpenChange={(open) => !open && setCancelling(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this booking?</DialogTitle>
            <DialogDescription>
              {cancelling &&
                `${guestName(cancelling)}'s booking for ${cancelling.facility?.name ?? "this facility"} (${stay(cancelling)}) will be cancelled.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelling(null)}>
              Keep Booking
            </Button>
            <Button variant="destructive" onClick={confirmCancel} disabled={cancelBooking.isPending}>
              {cancelBooking.isPending ? "Cancelling…" : "Cancel Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
