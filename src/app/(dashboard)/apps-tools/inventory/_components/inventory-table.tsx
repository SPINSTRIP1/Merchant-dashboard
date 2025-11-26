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
  Copy01Icon,
  Delete02Icon,
  Edit02Icon,
  Exchange01Icon,
  EyeIcon,
  PlusSignSquareIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { EllipsisVertical } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import InventoryModal from "./inventory-modal";
import PaginationButton from "@/components/pagination-button";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/axios-client";
import { INVENTORY_SERVER_URL } from "@/constants";
import { InventoryProduct, StockStatus } from "../_schemas";
import { formatAmount, formatISODate } from "@/utils";

interface PaginatedResponse {
  data: {
    count: number;
    currentpage: number;
    data: InventoryProduct[];
    lastpage: number;
    nextpage: number | null;
    prevpage: number | null;
  };
}

export const statusColors: Record<StockStatus, string> = {
  IN_STOCK: "text-[#34C759] bg-[#34C75926]",
  LOW_STOCK: "text-[#FF8D28] bg-[#F6E9DD]",
  OUT_OF_STOCK: "text-red-600 bg-red-100",
};

export default function InventoryTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [action, setAction] = useState<"add" | "edit" | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current page from URL or default to 1
  const currentPage = Number(searchParams.get("page")) || 1;

  // Fetch paginated data from server
  const { data, isLoading } = useQuery({
    queryKey: ["inventory-products", currentPage],
    queryFn: async () => {
      try {
        const response = await api.get<PaginatedResponse>(
          `${INVENTORY_SERVER_URL}/products?page=${currentPage}`
        );
        return response.data.data;
      } catch (error) {
        console.log("Error fetching inventory products:", error);
        return null;
      }
    },
  });

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const items = data?.data || [];
  const totalPages = data?.lastpage || 1;
  console.log(items);
  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-center gap-y-3 justify-between w-full">
        <h1 className="text-sm lg:text-base font-bold">Inventory</h1>
        <SearchBar
          placeholder="Search by item name, SKU or category..."
          className="bg-[#F3F3F3] w-full max-w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex items-center gap-x-2">
          <Dropdown header="" options={["All", "Some"]} placeholder="All" />
          <Dropdown header="" options={["All", "Some"]} placeholder="Sort by" />
        </div>
        <button
          onClick={() => setAction("add")}
          className="rounded-2xl bg-primary h-12 md:h-10 text-white flex justify-center items-center gap-2 px-7"
        >
          <HugeiconsIcon icon={PlusSignSquareIcon} size={24} color="#FFFFFF" />
          <p className="font-normal">Add Item</p>
        </button>
      </div>
      <div className="bg-foreground rounded-3xl p-5 mt-8">
        <Table>
          <TableHeader>
            <TableRow className="border-b-0">
              {[
                "Item",
                "Category",
                "Stock Level",
                "Price",
                "Status",
                "Updated",
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
                <TableCell colSpan={7} className="text-center py-10">
                  <p className="text-gray-500">No items found</p>
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
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category.name}</TableCell>
                  <TableCell>{item.inventory.stockLevel}</TableCell>
                  <TableCell>
                    {formatAmount(Number(item.sellingPrice))}
                  </TableCell>
                  <TableCell className="w-[140px]">
                    <div
                      className={`${
                        statusColors[
                          item.inventory.stockStatus as StockStatus
                        ] || statusColors["IN_STOCK"]
                      } w-[80px] flex items-center justify-center py-1 rounded-lg`}
                    >
                      <p className="font-semibold uppercase text-xxs">
                        {item.inventory.stockStatus === "IN_STOCK"
                          ? "In Stock"
                          : item.inventory.stockStatus === "LOW_STOCK"
                          ? "Low Stock"
                          : "Out of Stock"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{formatISODate(item.updatedAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="pl-4 outline-none">
                        <EllipsisVertical />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[144px] py-3 px-2 mr-5 md:mr-0 bg-neutral border rounded-2xl shadow-none border-neutral-accent">
                        {[
                          {
                            icon: Edit02Icon,
                            label: "Edit Item",
                            onClick: () => setAction("edit"),
                          },
                          {
                            icon: Copy01Icon,
                            label: "Duplicate Item",
                            onClick: () => {},
                          },
                          {
                            icon: Exchange01Icon,
                            label: "Restock Item",
                            onClick: () => {},
                          },
                          {
                            icon: EyeIcon,
                            label: "Hide Item",
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
                            onClick={(e) => {
                              e.stopPropagation();
                              onClick();
                            }}
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
      {!isLoading && totalPages > 0 && (
        <PaginationButton
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalPages={totalPages}
        />
      )}
      <InventoryModal
        isOpen={action !== null}
        action={action}
        onClose={() => setAction(null)}
      />
    </section>
  );
}
