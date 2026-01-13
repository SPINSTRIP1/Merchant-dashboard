import SearchBar from "@/components/search-bar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import EmptyState from "@/components/empty-state";
import AddButton from "@/app/(dashboard)/_components/add-button";
import { GoogleSheetIcon } from "@hugeicons/core-free-icons";
import { useServerPagination } from "@/hooks/use-server-pagination";
import { SERVER_URL } from "@/constants";
import PaginationButton from "@/components/pagination-button";
import { useDebounce } from "../../_hooks/use-debounce";

type Availability = "Available" | "Blocked" | "Occupied" | "Maintenance";

export const statusColors: Record<Availability, string> = {
  Available: "text-[#34C759] bg-[#34C75926]",
  Maintenance: "text-[#FF8D28] bg-[#F6E9DD]",
  Blocked: "text-[#FF383C] bg-[#FF383C26]",
  Occupied: "text-[#0088FF] bg-[#0088FF26]",
};

interface Visitor {
  id: string;
  appointmentId: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  purpose: string;
}

export default function VisitorList() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { id } = useParams() as { id: string | undefined };
  const { items, currentPage, totalPages, isLoading, handlePageChange } =
    useServerPagination<Visitor>({
      queryKey: ["places-visitors", id || ""],
      endpoint: `${SERVER_URL}/places/${id}/visitors`,
      enabled: !!id,
      searchQuery: debouncedSearch,
      // filters: {
      //   stockStatus: statusFilter,
      //   sortBy: sortBy,
      // },
    });
  return (
    <section className="w-full mt-6">
      <div className="flex flex-col md:flex-row md:items-center gap-y-3 justify-between w-full">
        <h1 className="text-sm lg:text-base font-bold">Visitor List</h1>
        <SearchBar
          placeholder="Search"
          className="bg-[#F3F3F3] w-full max-w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {/* <div className="flex items-center gap-x-2">
          <Dropdown
            header=""
            options={["All", "In Stock", "Low Stock", "Out of Stock"]}
            placeholder="All"
            onSelect={() => {
              //   if (value === "All Status") {
              //     setStatusFilter("");
              //   } else if (value === "In Stock") {
              //     setStatusFilter("inStock");
              //   } else if (value === "Low Stock") {
              //     setStatusFilter("lowStock");
              //   } else if (value === "Out of Stock") {
              //     setStatusFilter("outOfStock");
              //   }
            }}
          />
          <Dropdown
            header=""
            options={["Name", "Price", "Stock", "Date Updated", "Date Created"]}
            placeholder="Sort by"
            onSelect={() => {
              //   switch (value) {
              //     case "Name":
              //       setSortBy("name");
              //       break;
              //     case "Price":
              //       setSortBy("price");
              //       break;
              //     case "Stock":
              //       setSortBy("stock");
              //       break;
              //     case "Date Updated":
              //       setSortBy("updated");
              //       break;
              //     case "Date Created":
              //       setSortBy("created");
              //       break;
              //   }
            }}
          />
        </div> */}
        <div className="flex items-center gap-x-2">
          <AddButton onClick={() => {}} title="Add Visitor" />
          <AddButton
            onClick={() => {}}
            icon={GoogleSheetIcon}
            title="Export Sheet"
            className="bg-primary-accent text-primary"
          />
        </div>
      </div>
      <div className="bg-foreground rounded-3xl p-4 mt-3">
        <Table>
          <TableHeader>
            <TableRow className="border-b-0">
              {["Name", "Email Address", "Phone Number", "Purpose"].map(
                (header) => (
                  <TableHead
                    key={header}
                    className="text-primary-text font-bold text-base"
                  >
                    {header}
                  </TableHead>
                )
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <p className="text-gray-500">Loading visitors...</p>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-0">
                  <EmptyState
                    // icon={<UsersRound className="h-16 w-16 text-primary" />}
                    title="No Visitors Added Yet"
                    description={
                      "There are no visitors added yet. Start by adding new visitors to manage and track them effectively."
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
                  <TableCell className="py-4 ">{item.visitorName}</TableCell>
                  <TableCell>{item.visitorEmail}</TableCell>
                  <TableCell>{item.visitorPhone}</TableCell>

                  <TableCell>{item.purpose}</TableCell>
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

      {/* <DeleteModal
        isOpen={action === "delete"}
        title={selectedItem?.name || "this item"}
        onClose={() => setAction(null)}
        onDeleteConfirm={() => deleteItem(selectedItem?.id || "")}
        secondaryText="Cancel"
        description="This product will be deleted permanently and cannot be recovered!"
      />  */}
    </section>
  );
}
