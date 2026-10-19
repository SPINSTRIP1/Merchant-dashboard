"use client";
import EmptyState from "@/components/empty-state";
import PaginationButton from "@/components/pagination-button";
import SearchBar from "@/components/search-bar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CustomerService,
  CustomerSort,
  useCustomers,
} from "@/hooks/use-customers";
import { useCustomerSpend } from "@/hooks/use-customer-extras";
import { exportCsv, fmtDate, formatNaira } from "@/utils";
import { FileSpreadsheet, Users } from "lucide-react";
import React, { useState } from "react";
import Breadcrumb from "@/components/breadcrumb";
import PageHeader from "@/components/page-header";
import SampleDataBadge from "@/components/sample-data-badge";
import { getInitials } from "@/components/sidebar-content";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { cn } from "@/lib/utils";

const SERVICE_OPTIONS: { value: CustomerService | "All"; label: string }[] = [
  { value: "All", label: "All Services" },
  { value: "MENU", label: "Restaurant" },
  { value: "EVENTS", label: "Events" },
  { value: "PLACES", label: "Places" },
];

const SORT_OPTIONS: { value: CustomerSort; label: string }[] = [
  { value: "totalCount", label: "Total Visits" },
  { value: "menuCount", label: "Restaurant Orders" },
  { value: "eventsCount", label: "Events Attended" },
  { value: "placesCount", label: "Places Visits" },
];

type View = "visits" | "spend";

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [service, setService] = useState<CustomerService | "All">("All");
  const [sort, setSort] = useState<CustomerSort>("totalCount");
  const [view, setView] = useState<View>("visits");

  const {
    customers,
    currentPage,
    totalPages,
    totalItems,
    isLoading,
    handlePageChange,
  } = useCustomers({ service, sort });
  const spend = useCustomerSpend(customers);

  // Search filters the current page client-side (API has no search param)
  const currentItems = customers.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (item.name ?? "").toLowerCase().includes(query) ||
      (item.email ?? "").toLowerCase().includes(query) ||
      (item.phone ?? "").toLowerCase().includes(query)
    );
  });

  const handleExport = () =>
    exportCsv(
      "customers.csv",
      [
        "Name",
        "Email Address",
        "Phone",
        "Restaurant visits",
        "Event visits",
        "Place visits",
        "Total visits",
        "Last Visit",
      ],
      currentItems.map((c) => [
        c.name,
        c.email,
        c.phone,
        c.menuCount,
        c.eventsCount,
        c.placesCount,
        c.totalCount,
        c.lastPatronizedAt ? fmtDate(c.lastPatronizedAt) : "",
      ]),
    );

  const cell = (count: number, amount: number | undefined) =>
    view === "spend"
      ? amount
        ? formatNaira(amount)
        : "—"
      : count
        ? count.toLocaleString()
        : "—";

  return (
    <section>
      <Breadcrumb
        parent={{ label: "Tools", href: "/apps-tools" }}
        current="Customers"
      />
      <PageHeader
        title={
          <>
            Customers
            {!isLoading && (
              <span className="ml-2 align-middle text-base font-medium text-muted-foreground">
                ({totalItems.toLocaleString()})
              </span>
            )}
          </>
        }
        subtitle="Everyone who has ordered from your menu, events or places."
        actions={
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={!currentItems.length}
          >
            <FileSpreadsheet /> Export Sheet
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchBar
          placeholder="Search by name, email or phone"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select
          value={service}
          onValueChange={(value) => {
            setService(value as CustomerService | "All");
            handlePageChange(1);
          }}
        >
          <SelectTrigger className="h-11 w-[150px] rounded-full text-xs font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={sort}
          onValueChange={(value) => {
            setSort(value as CustomerSort);
            handlePageChange(1);
          }}
        >
          <SelectTrigger className="h-11 w-[160px] rounded-full text-xs font-semibold">
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
        <div className="ml-auto flex items-center gap-2">
          {view === "spend" && <SampleDataBadge label="Sample spend" />}
          {/* <div className="flex rounded-full border bg-card p-1" role="tablist" aria-label="Show visits or spend">
            {(["visits", "spend"] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={cn(
                  "min-h-[34px] rounded-full px-4 text-xs font-semibold capitalize transition-colors",
                  view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {v}
              </button>
            ))}
          </div> */}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-11" />
            ))}
          </div>
        ) : currentItems.length === 0 ? (
          <EmptyState
            icon={<Users />}
            title="No customers yet"
            description={
              searchQuery || service !== "All"
                ? "No customers match your search or filters."
                : "Customers who use your menu, events or places will appear here."
            }
          />
        ) : (
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Places</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Last Visit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((item) => {
                const s = spend[item.id];
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                          {getInitials(item.name ?? item.email ?? "")}
                        </span>
                        <span className="font-semibold text-foreground">
                          {item.name || "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.email || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.phone || "—"}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {cell(item.menuCount, s?.menu)}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {cell(item.eventsCount, s?.events)}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {cell(item.placesCount, s?.places)}
                    </TableCell>
                    <TableCell className="font-display font-bold text-primary">
                      {cell(item.totalCount, s?.total)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.lastPatronizedAt
                        ? fmtDate(item.lastPatronizedAt)
                        : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        {!isLoading && totalPages > 1 && (
          <div className="border-t">
            <PaginationButton
              currentPage={currentPage}
              onPageChange={handlePageChange}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>
    </section>
  );
}
