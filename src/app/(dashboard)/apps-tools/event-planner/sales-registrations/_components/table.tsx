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

interface Ticket {
  name: string;
  email: string;
  phoneNumber: string;
  ticket: string;
  date: string;
}
const items: Ticket[] = [];

export default function RegistrationTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Calculate pagination values
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = items.slice(startIndex, endIndex);

  return (
    <section className="mt-5">
      <div className="flex flex-col md:flex-row md:items-center gap-y-3 justify-between w-full">
        <h1 className="text-sm lg:text-base font-bold">Ticket Sales</h1>
        <SearchBar
          placeholder="Search"
          className="bg-[#F3F3F3] w-full max-w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex items-center justify-between md:justify-start gap-x-2">
          <div className="flex items-center gap-x-2">
            <Dropdown header="" options={["All", "Some"]} placeholder="All" />
            <Dropdown
              header=""
              options={["All", "Some"]}
              placeholder="Sort by"
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
                "Phone Number",
                "Ticket",
                ,
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
            {currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-0">
                  <EmptyState
                    // icon={<Package className="h-16 w-16 text-primary" />}
                    title="No Tickets Sold Yet"
                    description={
                      searchQuery
                        ? "No items match your search criteria. Try adjusting your filters."
                        : "Tickets will appear here once people start registering for your events."
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((item, index) => (
                <TableRow
                  className="border-b-0 cursor-pointer hover:bg-neutral"
                  key={index}
                >
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.phoneNumber}</TableCell>
                  <TableCell>{item.ticket}</TableCell>

                  <TableCell>{item.date}</TableCell>
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
