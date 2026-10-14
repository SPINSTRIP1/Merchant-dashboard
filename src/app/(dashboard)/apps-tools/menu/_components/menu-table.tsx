"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Copy, Eye, EyeOff, MoreVertical, Pencil, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import SearchBar from "@/components/search-bar";
import EmptyState from "@/components/empty-state";
import PaginationButton from "@/components/pagination-button";
import DeleteModal from "@/components/modals/delete-modal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { categoryLabel, useMenuCategories, useMenuItemActions, useMenuItems } from "@/hooks/use-menu";
import { formatAmount } from "@/utils";
import { Menu } from "../_schemas";
import { useMenuForm } from "../_context";
import MenuModal from "./modals/menu-modal";
import DetailsModal from "./modals/details-modal";
import MenuStatusBadge from "./menu-status-badge";
import FeaturedMenus from "./featured-menus";
import TopMenusCard from "./top-menus-card";

const ALL = "all";
const STATUS_FILTERS = [
  { value: ALL, label: "All Status" },
  { value: "AVAILABLE", label: "Available" },
  { value: "PENDING", label: "Pending" },
  { value: "UNAVAILABLE", label: "Out of Stock" },
];

export default function MenuTable() {
  const [selectedItem, setSelectedItem] = useState<Menu | null>(null);
  const {
    form,
    debouncedSearch,
    statusFilter,
    sortBy: categoryFilter,
    setSearchQuery,
    setStatusFilter,
    setSortBy: setCategoryFilter,
    searchQuery,
    setAction,
    action,
    resetForm,
  } = useMenuForm();
  const { categories } = useMenuCategories();
  const { items, currentPage, totalPages, isLoading, handlePageChange } = useMenuItems({
    search: debouncedSearch,
    status: statusFilter,
    category: categoryFilter,
  });
  const { updateStatus, duplicate, toggleHidden, remove } = useMenuItemActions();

  const openAdd = () => {
    resetForm();
    setAction("add");
  };

  const handleEditClick = (item: Menu) => {
    form.reset({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      quantity: item.quantity,
      tag: item.tag,
      status: item.status,
      images: item.images || [],
      files: [],
      category: item.category,
      isFeatured: item.isFeatured,
      availabilityType: item.availabilityType,
      availabilitySchedule: item.availabilitySchedule ?? { days: [], startTime: "", endTime: "" },
      nutritionAllergens: item.nutritionAllergens || [],
      addOns: item.addOns || [],
      sizeOptions: item.sizeOptions || [],
      extras: item.extras || [],
      dealId: item.dealId,
    });
    setAction("edit");
  };

  const handleDeleteClick = (item: Menu) => {
    setSelectedItem(item);
    setAction("delete");
  };

  const isFiltered = !!(searchQuery || statusFilter || categoryFilter);

  return (
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <SearchBar
            placeholder="Find Menu"
            className="max-w-sm flex-1 md:max-w-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select value={statusFilter || ALL} onValueChange={(v) => setStatusFilter(v === ALL ? "" : v)}>
            <SelectTrigger className="h-11 w-[150px] rounded-full text-xs font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter || ALL} onValueChange={(v) => setCategoryFilter(v === ALL ? "" : v)}>
            <SelectTrigger className="h-11 w-[160px] rounded-full text-xs font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {categoryLabel(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="brand" className="ml-auto" onClick={openAdd}>
            <Plus /> Add Menu
          </Button>
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
              icon={<UtensilsCrossed />}
              title={isFiltered ? "No menu items found" : "No menu items yet"}
              description={
                isFiltered
                  ? "No menu items match your filters. Try adjusting them."
                  : "Add your first menu item to publish it on your public menu."
              }
              action={
                !isFiltered && (
                  <Button variant="brand" onClick={openAdd}>
                    <Plus /> Add Your First Menu
                  </Button>
                )
              }
            />
          ) : (
            <>
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Code</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedItem(item);
                        setAction("details");
                      }}
                    >
                      <TableCell className="font-mono text-[11px] text-muted-foreground">{item.code || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.images?.[0] ? (
                            <Image
                              src={item.images[0]}
                              alt=""
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                              <UtensilsCrossed className="h-4 w-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 truncate font-semibold text-foreground">
                              {item.name}
                              {item.isHidden && <EyeOff className="h-3.5 w-3.5 text-muted-foreground" aria-label="Hidden" />}
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                              {categoryLabel(item.category)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">{formatAmount(item.price)}</TableCell>
                      <TableCell>
                        <MenuStatusBadge
                          status={item.status}
                          menuId={item.id}
                          onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
                        />
                      </TableCell>
                      <TableCell>
                        {item.tag ? (
                          <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                            {item.tag}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Actions for ${item.name}`}
                            className="grid h-9 w-9 place-items-center rounded-full outline-none hover:bg-muted"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 rounded-xl" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditClick(item)}>
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
                            <DropdownMenuItem className="cursor-pointer" onClick={() => toggleHidden.mutate(item.id!)}>
                              {item.isHidden ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}
                              {item.isHidden ? "Show Item" : "Hide Item"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer text-rose-500 focus:text-rose-500"
                              onClick={() => handleDeleteClick(item)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="border-t">
                  <PaginationButton
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <aside className="space-y-5">
        <TopMenusCard />
        <FeaturedMenus onDeleteClick={handleDeleteClick} onEditClick={handleEditClick} />
      </aside>

      <MenuModal
        isOpen={action === "add" || action === "edit"}
        action={action}
        onClose={() => setAction(null)}
      />
      <DetailsModal
        isOpen={action === "details"}
        menu={selectedItem}
        onClose={() => setAction(null)}
        onEdit={(menu) => handleEditClick(menu)}
      />
      <DeleteModal
        isOpen={action === "delete"}
        title={selectedItem?.name || "this item"}
        onClose={() => setAction(null)}
        onDeleteConfirm={() => selectedItem?.id && remove.mutate(selectedItem.id)}
        secondaryText="Cancel"
        description="This menu item will be deleted permanently and cannot be recovered."
      />
      <DeleteModal
        isOpen={action === "duplicate"}
        title={selectedItem?.name || "this item"}
        onClose={() => setAction(null)}
        onDeleteConfirm={() => selectedItem?.id && duplicate.mutate(selectedItem.id)}
        secondaryText="Cancel"
        primaryText="Duplicate"
        description="A copy of this item will be added to your menu."
        successMessage="This menu item has been duplicated."
        headTitle={`Duplicate ${selectedItem?.name || "this item"}?`}
      />
    </section>
  );
}
