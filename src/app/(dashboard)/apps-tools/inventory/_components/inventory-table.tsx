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
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { EllipsisVertical, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import InventoryModal from "./modals/inventory-modal";
import PaginationButton from "@/components/pagination-button";
import { INVENTORY_SERVER_URL } from "@/constants";
import { InventoryProduct, StockStatus } from "../_schemas";
import { formatAmount, formatISODate } from "@/utils";
import { useOptimisticDelete } from "@/hooks/use-optimistic-delete";
import DeleteModal from "../../deals/_components/modals/delete-modal";
import DuplicateModal from "../../deals/_components/modals/delete-modal";
import { useServerPagination } from "@/hooks/use-server-pagination";
import { useInventoryForm } from "../_context";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/axios-client";
import toast from "react-hot-toast";
import EmptyState from "@/components/empty-state";

export const statusColors: Record<StockStatus, string> = {
  IN_STOCK: "text-[#34C759] bg-[#34C75926]",
  LOW_STOCK: "text-[#FF8D28] bg-[#F6E9DD]",
  OUT_OF_STOCK: "text-red-600 bg-red-100",
};

export default function InventoryTable() {
  const [selectedItem, setSelectedItem] = useState<InventoryProduct | null>(
    null
  );
  const {
    form,
    debouncedSearch,
    statusFilter,
    sortBy,
    setSearchQuery,
    setStatusFilter,
    setSortBy,
    searchQuery,
    setAction,
    action,
  } = useInventoryForm();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Use server pagination hook with search and filters
  const { items, currentPage, totalPages, isLoading, handlePageChange } =
    useServerPagination<InventoryProduct>({
      queryKey: "inventory-products",
      endpoint: `${INVENTORY_SERVER_URL}/products`,
      searchQuery: debouncedSearch,
      filters: {
        stockStatus: statusFilter,
        sortBy: sortBy,
      },
    });

  // Optimistic delete hook
  const { deleteItem } = useOptimisticDelete<InventoryProduct>({
    queryKey: ["inventory-products", currentPage],
    deleteEndpoint: `${INVENTORY_SERVER_URL}/products`,
    successMessage: "Item deleted successfully",
    errorMessage: "Failed to delete item",
  });

  const handleDuplicate = async (id: string) => {
    try {
      await api.post(`${INVENTORY_SERVER_URL}/products/${id}/duplicate`);
      queryClient.invalidateQueries({ queryKey: ["inventory-products"] });
    } catch (error) {
      console.log(error);
      toast.error("Failed to duplicate item");
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: "ACTIVE" | "INACTIVE"
  ) => {
    try {
      await api.patch(`${INVENTORY_SERVER_URL}/products/${id}`, {
        status: newStatus,
      });
      queryClient.invalidateQueries({ queryKey: ["inventory-products"] });
      toast.success("Item status updated successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to change item status");
    }
  };
  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-center gap-y-3 justify-between w-full">
        <h1 className="text-sm lg:text-base font-bold">Inventory</h1>
        <SearchBar
          placeholder="Search by item name, category..."
          className="bg-[#F3F3F3] w-full max-w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex items-center gap-x-2">
          <Dropdown
            header=""
            options={["All Status", "In Stock", "Low Stock", "Out of Stock"]}
            placeholder="All Status"
            onSelect={(value) => {
              if (value === "All Status") {
                setStatusFilter("");
              } else if (value === "In Stock") {
                setStatusFilter("inStock");
              } else if (value === "Low Stock") {
                setStatusFilter("lowStock");
              } else if (value === "Out of Stock") {
                setStatusFilter("outOfStock");
              }
            }}
          />
          <Dropdown
            header=""
            options={["Name", "Price", "Stock", "Date Updated", "Date Created"]}
            placeholder="Sort by"
            onSelect={(value) => {
              switch (value) {
                case "Name":
                  setSortBy("name");
                  break;
                case "Price":
                  setSortBy("price");
                  break;
                case "Stock":
                  setSortBy("stock");
                  break;
                case "Date Updated":
                  setSortBy("updated");
                  break;
                case "Date Created":
                  setSortBy("created");
                  break;
              }
            }}
          />
        </div>
        <button
          onClick={() => {
            form.reset();
            setAction("add");
          }}
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
                "Catalog",
                "Category",
                "Stock Level",
                "Price",
                "Status",
                "Updated",
                "Visibility",
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
                    action={
                      !searchQuery ? (
                        <button
                          onClick={() => {
                            form.reset();
                            setAction("add");
                          }}
                          className="rounded-2xl bg-primary h-10 text-white flex justify-center items-center gap-2 px-4"
                        >
                          <HugeiconsIcon
                            icon={PlusSignSquareIcon}
                            size={20}
                            color="#FFFFFF"
                          />
                          <p className="font-normal">Add Your First Item</p>
                        </button>
                      ) : undefined
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
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.catalog.name}</TableCell>

                  <TableCell>{item.category.name}</TableCell>
                  <TableCell>{item.inventory.stockLevel}</TableCell>
                  <TableCell>{formatAmount(item.sellingPrice)}</TableCell>
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
                  <TableCell>{formatISODate(item.updatedAt!)}</TableCell>
                  <TableCell className="pl-6">
                    <HugeiconsIcon
                      icon={
                        item.status === "ACTIVE" ? EyeIcon : ViewOffSlashIcon
                      }
                      size={24}
                      color={"#6F6D6D"}
                    />
                  </TableCell>
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
                            onClick: (e: React.MouseEvent) => {
                              e.stopPropagation();
                              form.reset({
                                id: item.id,
                                name: item.name,
                                description: item.description || "",
                                categoryId: item.categoryId,
                                catalogId: item.catalogId,
                                tags: item.tags || [],
                                brand: item.brand || "",
                                productType: item.productType || "",
                                sellingPrice: Number(item.sellingPrice) || 0,
                                costPrice: Number(item.costPrice) || 0,
                                taxPercentage: Number(item.taxPercentage) || 0,
                                quantity: item.inventory.quantity || 0,
                                maxStockLevel:
                                  item.inventory.maxStockLevel || 0,
                                // minStockLevelPercentage:
                                //   item.inventory.minStockLevel || 0,
                                showInMenu: item.showInMenu,
                                isFeatured: item.isFeatured,
                                variant: item.variant || undefined,
                                slotConfig: item.slotConfig || undefined,
                                dealIds: item.dealIds || [],
                                media: item.media || [],
                              });
                              setAction("edit");
                            },
                          },
                          {
                            icon: Copy01Icon,
                            label: "Duplicate Item",
                            onClick: (e: React.MouseEvent) => {
                              e.stopPropagation();
                              setSelectedItem(item);
                              setAction("duplicate");
                            },
                          },
                          {
                            icon: Exchange01Icon,
                            label: "Restock Item",
                            onClick: (e: React.MouseEvent) => {
                              e.stopPropagation();
                            },
                          },
                          {
                            icon:
                              item.status === "ACTIVE"
                                ? EyeIcon
                                : ViewOffSlashIcon,
                            label:
                              item.status === "ACTIVE"
                                ? "Hide Item"
                                : "Show Item",
                            onClick: (e: React.MouseEvent) => {
                              e.stopPropagation();
                              handleStatusChange(
                                item.id,
                                item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
                              );
                            },
                          },
                          {
                            icon: Delete02Icon,
                            label: "Delete Item",
                            color: "#FF5F57",
                            onClick: (e: React.MouseEvent) => {
                              e.stopPropagation();
                              setSelectedItem(item);
                              setAction("delete");
                            },
                          },
                        ].map(({ icon, label, color, onClick }) => (
                          <DropdownMenuItem
                            key={label}
                            onClick={(e) => {
                              onClick(e);
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
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
      <InventoryModal
        isOpen={action === "add" || action === "edit"}
        action={action}
        onClose={() => setAction(null)}
      />
      <DeleteModal
        isOpen={action === "delete"}
        title={selectedItem?.name || "this item"}
        onClose={() => setAction(null)}
        onDeleteConfirm={() => deleteItem(selectedItem?.id || "")}
        secondaryText="Cancel"
        description="This product will be deleted permanently and cannot be recovered!"
      />
      <DuplicateModal
        isOpen={action === "duplicate"}
        title={selectedItem?.name || "this item"}
        onClose={() => setAction(null)}
        onDeleteConfirm={() => handleDuplicate(selectedItem?.id || "")}
        secondaryText="Cancel"
        primaryText="Duplicate"
        description="This product will be duplicated!"
        successMessage="This product has been duplicated successfully."
        headTitle={`Are you sure you want to duplicate ${
          selectedItem?.name || "this item"
        }?`}
      />
    </section>
  );
}
