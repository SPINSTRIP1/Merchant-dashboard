import SearchBar from "@/components/search-bar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Copy, Eye, EyeOff, Layers, MoreVertical, Package, PackagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import InventoryModal from "./modals/inventory-modal";
import PaginationButton from "@/components/pagination-button";
import { SERVER_URL } from "@/constants";
import { InventoryProduct, StockStatus } from "../_schemas";
import { formatAmount, timeAgo } from "@/utils";
import { useOptimisticDelete } from "@/hooks/use-optimistic-delete";
import DeleteModal from "@/components/modals/delete-modal";
import DuplicateModal from "@/components/modals/delete-modal";
import { useServerPagination } from "@/hooks/use-server-pagination";
import { useInventoryForm } from "../_context";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/axios-client";
import toast from "react-hot-toast";
import EmptyState from "@/components/empty-state";
import CatalogModal from "./modals/catalog-modal";
import StatusPill from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRestockItem } from "@/hooks/use-inventory-extras";

/** Stock-status pill colours, shared with the item page. */
export const statusColors: Record<StockStatus, string> = {
  IN_STOCK: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  LOW_STOCK: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  OUT_OF_STOCK: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export const STOCK_LABELS: Record<StockStatus, string> = {
  IN_STOCK: "In Stock",
  LOW_STOCK: "Low Stock",
  OUT_OF_STOCK: "Out of Stock",
};

/** Short product reference shown under the name, e.g. "SKU-4F07A2". */
export const productSku = (id: string) => `SKU-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;

const ALL = "all";
const STATUS_FILTERS = [
  { value: ALL, label: "All Status" },
  { value: "inStock", label: "In Stock" },
  { value: "lowStock", label: "Low Stock" },
  { value: "outOfStock", label: "Out of Stock" },
];
const SORT_OPTIONS = [
  { value: ALL, label: "Sort by" },
  { value: "updated", label: "Recently Updated" },
  { value: "name", label: "Name" },
  { value: "price", label: "Price" },
  { value: "stock", label: "Stock" },
  { value: "created", label: "Date Created" },
];

export default function InventoryTable() {
  const [selectedItem, setSelectedItem] = useState<InventoryProduct | null>(
    null,
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
    resetForm,
  } = useInventoryForm();
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();
  const queryClient = useQueryClient();
  const restock = useRestockItem();

  // Use server pagination hook with search and filters
  const { items, currentPage, totalPages, isLoading, handlePageChange } =
    useServerPagination<InventoryProduct>({
      queryKey: "inventory-products",
      endpoint: `${SERVER_URL}/inventory/products`,
      searchQuery: debouncedSearch,
      filters: {
        stockStatus: statusFilter,
        sortBy: sortBy,
      },
    });

  // Optimistic delete hook
  const { deleteItem } = useOptimisticDelete<InventoryProduct>({
    queryKey: ["inventory-products", currentPage],
    deleteEndpoint: `${SERVER_URL}/inventory/products`,
    successMessage: "Item deleted successfully",
    errorMessage: "Failed to delete item",
  });

  const handleDuplicate = async (id: string) => {
    try {
      await api.post(`${SERVER_URL}/inventory/products/${id}/duplicate`);
      queryClient.invalidateQueries({ queryKey: ["inventory-products"] });
    } catch (error) {
      console.log(error);
      toast.error("Failed to duplicate item");
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: "ACTIVE" | "INACTIVE",
  ) => {
    try {
      await api.patch(`${SERVER_URL}/inventory/products/${id}`, {
        status: newStatus,
      });
      queryClient.invalidateQueries({ queryKey: ["inventory-products"] });
      toast.success("Item status updated successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to change item status");
    }
  };

  const openEdit = (item: InventoryProduct) => {
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
      reorderThreshold: item.reorderThreshold || 0,
      discountPercentage:
        Number(item.discountPercentage) || 0,
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
  };

  const openCreate = () => {
    form.reset();
    setAction("add");
  };

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchBar
          placeholder="Search by item name, category…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select value={statusFilter || ALL} onValueChange={(v) => setStatusFilter(v === ALL ? "" : v)}>
          <SelectTrigger className="h-11 w-[140px] rounded-full text-xs font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy || ALL} onValueChange={(v) => setSortBy(v === ALL ? "" : v)}>
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
          <Button variant="outline" onClick={() => setShowModal(true)}>
            <Layers /> Create Catalog
          </Button>
          <Button variant="brand" onClick={openCreate}>
            <Plus /> Add Item
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Package />}
            title="No inventory items"
            description={
              searchQuery
                ? "No items match your search. Try adjusting your filters."
                : "Add your first item to start tracking stock."
            }
            action={
              !searchQuery ? (
                <Button variant="brand" onClick={openCreate}>
                  <Plus /> Add Your First Item
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Table className="min-w-[960px]">
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Catalog</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const stockStatus = (item.inventory.stockStatus as StockStatus) || "IN_STOCK";
                const visible = item.status === "ACTIVE";
                return (
                  <TableRow
                    onClick={() => router.push("/apps-tools/inventory/item?id=" + item.id)}
                    className="cursor-pointer"
                    key={item.id}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {item.media?.[0] ? (
                          <Image
                            src={item.media[0]}
                            alt=""
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                            <Package className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">{item.name}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">{productSku(item.id)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.catalog?.name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{item.category?.name ?? "—"}</TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {item.inventory.quantity?.toLocaleString() ?? item.inventory.stockLevel}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {formatAmount(item.sellingPrice || item.costPrice || 0)}
                    </TableCell>
                    <TableCell>
                      <StatusPill status={stockStatus} label={STOCK_LABELS[stockStatus]} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.updatedAt ? timeAgo(item.updatedAt) : "—"}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <label className="flex items-center gap-2 text-xs font-medium">
                        <Switch
                          showLabel={false}
                          checked={visible}
                          onCheckedChange={(checked) =>
                            handleStatusChange(item.id, checked ? "ACTIVE" : "INACTIVE")
                          }
                          aria-label={visible ? `Hide ${item.name}` : `Show ${item.name}`}
                        />
                        <span className={visible ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
                          {visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </span>
                      </label>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          aria-label={`Manage ${item.name}`}
                          className="inline-flex min-h-[36px] items-center gap-1 rounded-full border px-3 text-xs font-semibold outline-none hover:bg-muted"
                        >
                          Manage <MoreVertical className="h-3.5 w-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => openEdit(item)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit Item
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedItem(item);
                              setAction("duplicate");
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Restock
                          </DropdownMenuLabel>
                          {[50, 500].map((add) => (
                            <DropdownMenuItem
                              key={add}
                              className="cursor-pointer"
                              onClick={() =>
                                restock.mutate({
                                  id: item.id,
                                  currentQuantity: item.inventory.quantity || 0,
                                  add,
                                })
                              }
                            >
                              <PackagePlus className="mr-2 h-4 w-4" /> Restock +{add}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer text-rose-500 focus:text-rose-500"
                            onClick={() => {
                              setSelectedItem(item);
                              setAction("delete");
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        {!isLoading && totalPages > 1 && (
          <div className="border-t">
            <PaginationButton currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </div>

      <InventoryModal
        isOpen={action === "add" || action === "edit"}
        action={action}
        onClose={() => {
          resetForm();
          setAction(null);
        }}
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
      <CatalogModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          queryClient.invalidateQueries({ queryKey: ["inventory-catalogs"] });
        }}
      />
    </section>
  );
}
