"use client";
import Dropdown from "@/components/dropdown";
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
import { formatDateDisplay } from "@/utils";
import { Users } from "lucide-react";
import React, { useState } from "react";

const SERVICE_OPTIONS: Record<string, CustomerService | "All"> = {
  "All Services": "All",
  Menu: "MENU",
  Events: "EVENTS",
  Places: "PLACES",
};

const SORT_OPTIONS: Record<string, CustomerSort> = {
  "Total Visits": "totalCount",
  "Menu Orders": "menuCount",
  "Events Attended": "eventsCount",
  "Places Visits": "placesCount",
};

const HEADERS = [
  "Name",
  "Email Address",
  "Phone",
  "Menu",
  "Events",
  "Places",
  "Total",
  "Last Visit",
];

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [service, setService] = useState<CustomerService | "All">("All");
  const [sort, setSort] = useState<CustomerSort>("totalCount");

  const {
    customers,
    currentPage,
    totalPages,
    totalItems,
    isLoading,
    handlePageChange,
  } = useCustomers({ service, sort });

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

  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-center gap-y-3 justify-between w-full">
        <h1 className="text-sm lg:text-base font-bold">
          Customers
          {!isLoading && (
            <span className="text-secondary-text font-normal ml-2">
              ({totalItems.toLocaleString()})
            </span>
          )}
        </h1>
        <SearchBar
          placeholder="Search by name, email or phone"
          className="bg-[#F3F3F3] w-full max-w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex items-center gap-x-2">
          <Dropdown
            header=""
            options={Object.keys(SERVICE_OPTIONS)}
            placeholder="All Services"
            onSelect={(value) => {
              setService(SERVICE_OPTIONS[value] ?? "All");
              handlePageChange(1);
            }}
          />
          <Dropdown
            header=""
            options={Object.keys(SORT_OPTIONS)}
            placeholder="Sort by"
            onSelect={(value) => {
              setSort(SORT_OPTIONS[value] ?? "totalCount");
              handlePageChange(1);
            }}
          />
        </div>
      </div>

      <div className="bg-foreground rounded-3xl p-5 mt-8">
        <Table>
          <TableHeader>
            <TableRow className="border-b-0">
              {HEADERS.map((header) => (
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
                <TableCell colSpan={HEADERS.length}>
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={HEADERS.length} className="py-0">
                  <EmptyState
                    icon={<Users className="h-16 w-16 text-primary" />}
                    title="No Customers Yet"
                    description={
                      searchQuery || service !== "All"
                        ? "No customers match your search criteria. Try adjusting your filters."
                        : "Customers who use your menu, events or places will appear here."
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((item) => (
                <TableRow
                  className="border-b-0 hover:bg-neutral"
                  key={item.id}
                >
                  <TableCell>{item.name || "—"}</TableCell>
                  <TableCell>{item.email || "—"}</TableCell>
                  <TableCell>{item.phone || "—"}</TableCell>
                  <TableCell>{item.menuCount}</TableCell>
                  <TableCell>{item.eventsCount}</TableCell>
                  <TableCell>{item.placesCount}</TableCell>
                  <TableCell className="font-bold">{item.totalCount}</TableCell>
                  <TableCell>
                    {formatDateDisplay(item.lastPatronizedAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && totalPages > 1 && (
        <PaginationButton
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalPages={totalPages}
        />
      )}
    </section>
  );
}
