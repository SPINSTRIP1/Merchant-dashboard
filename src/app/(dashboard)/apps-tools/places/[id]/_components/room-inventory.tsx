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
import {
  CancelCircleHalfDotIcon,
  CheckmarkCircle02Icon,
  CleanIcon,
  Delete02Icon,
  Edit02Icon,
  HourglassIcon,
  LocationUser02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { EllipsisVertical, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { formatAmount } from "@/utils";
import EmptyState from "@/components/empty-state";

type Availability = "Available" | "Blocked" | "Occupied" | "Maintenance";

export const statusColors: Record<Availability, string> = {
  Available: "text-[#34C759] bg-[#34C75926]",
  Maintenance: "text-[#FF8D28] bg-[#F6E9DD]",
  Blocked: "text-[#FF383C] bg-[#FF383C26]",
  Occupied: "text-[#0088FF] bg-[#0088FF26]",
};

interface Booking {
  id: string;
  roomNumber: number;
  roomType: "Standard" | "VIP" | "Suite";
  availability: Availability;
  price: number;
}

export default function RoomInventory() {
  const items: Booking[] = [
    {
      id: "1",
      roomNumber: 101,
      roomType: "Standard",
      availability: "Available",
      price: 100,
    },
    {
      id: "2",
      roomNumber: 102,
      roomType: "VIP",
      availability: "Occupied",
      price: 200,
    },
    {
      id: "3",
      roomNumber: 103,
      roomType: "Suite",
      availability: "Blocked",
      price: 300,
    },
  ];

  const router = useRouter();
  //   const queryClient = useQueryClient();

  // Use server pagination hook with search and filters
  //   const { items, currentPage, totalPages, isLoading, handlePageChange } =
  //     useServerPagination({
  //       queryKey: "inventory-products",
  //       endpoint: `${''}/products`,
  //     //   searchQuery: debouncedSearch,
  //     //   filters: {
  //     //     stockStatus: statusFilter,
  //     //     sortBy: sortBy,
  //     //   },
  //     });

  // Optimistic delete hook
  //   const { deleteItem } = useOptimisticDelete<InventoryProduct>({
  //     queryKey: ["inventory-products", currentPage],
  //     deleteEndpoint: `${INVENTORY_SERVER_URL}/products`,
  //     successMessage: "Item deleted successfully",
  //     errorMessage: "Failed to delete item",
  //   });

  //   const handleStatusChange = async (
  //     id: string,
  //     newStatus: "ACTIVE" | "INACTIVE"
  //   ) => {
  //     try {
  //       await api.patch(`${INVENTORY_SERVER_URL}/products/${id}`, {
  //         status: newStatus,
  //       });
  //       queryClient.invalidateQueries({ queryKey: ["inventory-products"] });
  //       toast.success("Item status updated successfully");
  //     } catch (error) {
  //       console.log(error);
  //       toast.error("Failed to change item status");
  //     }
  //   };
  const [searchQuery, setSearchQuery] = useState("");
  const isLoading = false;
  return (
    <section className="w-full mt-6">
      <div className="flex flex-col md:flex-row md:items-center gap-y-3 justify-between w-full">
        <h1 className="text-sm lg:text-base font-bold">Room Inventory</h1>
        <SearchBar
          placeholder="Search"
          className="bg-[#F3F3F3] w-full max-w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex items-center gap-x-2">
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
        </div>
      </div>
      <div className="bg-foreground rounded-3xl p-5 mt-4">
        <Table>
          <TableHeader>
            <TableRow className="border-b-0">
              {[
                "Room Number",
                "Room Type",
                "Availability",
                "Price",
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
                  <p className="text-gray-500">Loading inventory...</p>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-0">
                  <EmptyState
                    icon={<Package className="h-16 w-16 text-primary" />}
                    title="No Inventory Items"
                    description={
                      searchQuery
                        ? "No items match your search criteria. Try adjusting your filters."
                        : "You haven't added any inventory items yet. Add your first item to get started!"
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              items?.map((item) => (
                <TableRow
                  onClick={() =>
                    router.push("/apps-tools/inventory/item?id=" + item.id)
                  }
                  className="border-b-0 cursor-pointer hover:bg-neutral"
                  key={item.id}
                >
                  <TableCell>{item.roomNumber}</TableCell>
                  <TableCell>{item.roomType}</TableCell>
                  <TableCell className="w-[140px]">
                    <div
                      className={`${
                        statusColors[item.availability as Availability] ||
                        statusColors["Available"]
                      } w-[80px] flex items-center justify-center py-1 rounded-lg`}
                    >
                      <p className="font-semibold text-xs">
                        {item.availability}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{formatAmount(item.price)}</TableCell>

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
                            icon: CheckmarkCircle02Icon,
                            label: "Mark as Available",
                            onClick: () => {},
                          },
                          {
                            icon: LocationUser02Icon,
                            label: "Mark as Occupied",
                            onClick: () => {},
                          },
                          {
                            icon: HourglassIcon,
                            label: "Mark as Unavailable",
                            onClick: () => {},
                          },
                          {
                            icon: CancelCircleHalfDotIcon,
                            label: "Mark as Blocked",
                            onClick: () => {},
                          },
                          {
                            icon: CleanIcon,
                            label: "Mark as Under Maintenance",
                            onClick: () => {},
                          },
                          {
                            icon: Delete02Icon,
                            label: "Delete Item",
                            color: "#FF5F57",
                            onClick: () => {},
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

      {/* Pagination Component */}
      {/* {!isLoading && totalPages > 0 && (
        <PaginationButton
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )} */}

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
