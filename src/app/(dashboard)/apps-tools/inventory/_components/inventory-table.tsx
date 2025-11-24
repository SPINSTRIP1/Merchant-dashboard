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
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import InventoryModal from "./inventory-modal";
import PaginationButton from "@/components/pagination-button";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/axios-client";
import { INVENTORY_SERVER_URL } from "@/constants";

type Status = "In Stock" | "Low Stock" | "Out of Stock";
interface InventoryItem {
  item: string;
  category: string;
  stockLevel: number;
  totalQuantity: number;
  price: string;
  status: Status;
  updated: string;
}
const items: InventoryItem[] = [
  {
    item: "Jollof Rice",
    category: "Food",
    stockLevel: 120,
    totalQuantity: 200,
    price: "5000",
    status: "In Stock",
    updated: "2 days ago",
  },
  {
    item: "Grilled Chicken",
    category: "Food",
    stockLevel: 120,
    totalQuantity: 200,
    price: "5000",
    status: "Out of Stock",
    updated: "2 days ago",
  },
  {
    item: "Chapman",
    category: "Drinks",
    stockLevel: 200,
    totalQuantity: 200,
    price: "5000",
    status: "Low Stock",
    updated: "2 days ago",
  },
];

export const statusColors: Record<Status, string> = {
  "In Stock": "text-[#34C759] bg-[#34C75926]",
  "Low Stock": "text-[#FF8D28] bg-[#F6E9DD]",
  "Out of Stock": "text-red-600 bg-red-100",
};

export default function InventoryTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [action, setAction] = useState<"add" | "edit" | null>(null);
  const router = useRouter();
  const itemsPerPage = 15;

  // Calculate pagination values
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = items.slice(startIndex, endIndex);
  const { data } = useQuery({
    queryKey: ["inventory-products"],
    queryFn: async () => {
      try {
        const response = await api.get<InventoryItem[]>(
          INVENTORY_SERVER_URL + "/products"
        );
        return response.data;
      } catch (error) {
        console.log("Error fetching compliance status:", error);
        return null;
      }
    },
  });
  console.log(data);
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
            {currentItems.map((item) => (
              <TableRow
                onClick={() =>
                  router.push("/apps-tools/inventory/item?id=" + item.item)
                }
                className="border-b-0 cursor-pointer hover:bg-neutral"
                key={item.item}
              >
                <TableCell>{item.item}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  {item.stockLevel}/{item.totalQuantity}
                </TableCell>
                <TableCell>{item.price}</TableCell>
                <TableCell className="w-[140px]">
                  <div
                    className={`${
                      statusColors[item.status]
                    } w-[80px] flex items-center justify-center py-1 rounded-lg`}
                  >
                    <p className="font-semibold uppercase text-xxs">
                      {item.status}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{item.updated}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Component */}
      <PaginationButton
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        totalPages={totalPages}
      />
      <InventoryModal
        isOpen={action !== null}
        action={action}
        onClose={() => setAction(null)}
      />
    </section>
  );
}
