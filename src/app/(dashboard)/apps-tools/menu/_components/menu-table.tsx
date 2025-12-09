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
  EyeIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { EllipsisVertical, UtensilsCrossed } from "lucide-react";
import React, { useState } from "react";
import MenuModal from "./modals/menu-modal";
import PaginationButton from "@/components/pagination-button";
import { MENUS_SERVER_URL } from "@/constants";
import { Menu } from "../_schemas";
import { formatAmount } from "@/utils";
import { useOptimisticDelete } from "@/hooks/use-optimistic-delete";
import DeleteModal from "../../deals/_components/modals/delete-modal";
import DuplicateModal from "../../deals/_components/modals/delete-modal";
import { useServerPagination } from "@/hooks/use-server-pagination";
import { useMenuForm } from "../_context";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/axios-client";
import toast from "react-hot-toast";
import AddButton from "@/app/(dashboard)/_components/add-button";
import Item from "@/components/item";
import EmptyState from "@/components/empty-state";
import { MENU_QUERY_KEY } from "../_constants";
import FeaturedMenus from "./featured-menus";
import TopMenus from "@/app/(dashboard)/_components/top-menus";
import DetailsModal from "./modals/details-modal";
import MenuStatusBadge from "./menu-status-badge";

export default function MenuTable() {
  const [selectedItem, setSelectedItem] = useState<Menu | null>(null);
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
  } = useMenuForm();
  const queryClient = useQueryClient();

  // Use server pagination hook with search and filters
  const { items, currentPage, totalPages, isLoading, handlePageChange } =
    useServerPagination<Menu>({
      queryKey: MENU_QUERY_KEY,
      endpoint: `${MENUS_SERVER_URL}/menu-items`,
      searchQuery: debouncedSearch,
      filters: {
        stockStatus: statusFilter,
        category: sortBy,
      },
    });

  // Optimistic delete hook
  const { deleteItem } = useOptimisticDelete<Menu & { id: string }>({
    queryKey: [MENU_QUERY_KEY, currentPage],
    deleteEndpoint: `${MENUS_SERVER_URL}/menu-items`,
    successMessage: "Item deleted successfully",
    errorMessage: "Failed to delete item",
  });

  const handleDuplicate = async (id: string) => {
    try {
      await api.post(`${MENUS_SERVER_URL}/menu-items/${id}/duplicate`);
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    } catch (error) {
      console.log(error);
      toast.error("Failed to duplicate item");
    }
  };

  const handleStatusChange = async (id: string) => {
    try {
      await api.patch(`${MENUS_SERVER_URL}/menu-items/${id}/toggle-hidden`);
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      toast.success("Visibility updated successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to change Visibility");
    }
  };

  const handleMenuStatusChange = async (menuId: string, newStatus: string) => {
    // Optimistic update - update the cache for the current query
    queryClient.setQueryData(
      [
        MENU_QUERY_KEY,
        currentPage,
        debouncedSearch,
        {
          stockStatus: statusFilter,
          category: sortBy,
        },
      ],
      (oldData: { data: Menu[] } | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((item: Menu) =>
            item.id === menuId ? { ...item, status: newStatus } : item
          ),
        };
      }
    );

    try {
      await api.patch(`${MENUS_SERVER_URL}/menu-items/${menuId}`, {
        status: newStatus,
      });
      toast.success("Status updated successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to update status");
      // Revert on error
      queryClient.invalidateQueries({ queryKey: [MENU_QUERY_KEY] });
    }
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
      availabilitySchedule: item.availabilitySchedule,
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
  return (
    <section>
      <FeaturedMenus
        onDeleteClick={handleDeleteClick}
        onEditClick={handleEditClick}
      />
      <div className="flex flex-col lg:flex-row gap-x-5">
        <div className="w-full flex-1">
          <div className="flex flex-col md:flex-row md:items-center flex-wrap gap-3 justify-between w-full">
            <h1 className="text-sm lg:text-base font-bold">Menu</h1>
            <SearchBar
              placeholder="Find Menu"
              className="bg-[#F3F3F3] w-full max-w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="flex items-center gap-x-2">
              <Dropdown
                header=""
                options={["All", "Available", "Pending", "Unavailable"]}
                placeholder="All"
                onSelect={(value) => {
                  if (value === "All") {
                    setStatusFilter("");
                  } else if (value === "Available") {
                    setStatusFilter("AVAILABLE");
                  } else if (value === "Pending") {
                    setStatusFilter("PENDING");
                  } else if (value === "Unavailable") {
                    setStatusFilter("UNAVAILABLE");
                  }
                }}
              />
              <Dropdown
                header=""
                options={["All Categories", "Breakfast", "Lunch", "Dinner"]}
                placeholder="All Categories"
                onSelect={(value) =>
                  setSortBy(
                    value === "All Categories" ? "" : value.toUpperCase()
                  )
                }
              />
            </div>
            <AddButton
              onClick={() => {
                setAction("add");
              }}
              title="Add Menu"
            />
          </div>
          <div className="bg-foreground rounded-3xl p-5 mt-8">
            <Table>
              <TableHeader>
                <TableRow className="border-b-0">
                  {[
                    "Item Code",
                    "Item",
                    "Price",
                    "Status",
                    "Tag",
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
                      <p className="text-gray-500">Loading menus...</p>
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-0">
                      <EmptyState
                        icon={
                          <UtensilsCrossed className="h-16 w-16 text-primary" />
                        }
                        title="No Menu Items"
                        description={
                          searchQuery
                            ? "No menu items match your search criteria. Try adjusting your filters."
                            : "You haven't added any menu items yet. Add your first menu item to get started!"
                        }
                        action={
                          !searchQuery ? (
                            <AddButton
                              onClick={() => {
                                setAction("add");
                              }}
                              title="Add Your First Menu"
                            />
                          ) : undefined
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  items?.map((item) => (
                    <TableRow
                      className="border-b-0 cursor-pointer hover:bg-neutral"
                      key={item.id}
                      onClick={() => {
                        setSelectedItem(item);
                        setAction("details");
                      }}
                    >
                      <TableCell className="min-w-[100px]">
                        {item.code}
                      </TableCell>
                      <TableCell>
                        <Item
                          item={{
                            name: item?.name || "",
                            id: item.category,
                            img: item?.images?.[0],
                          }}
                        />
                      </TableCell>
                      <TableCell>{formatAmount(item.price)}</TableCell>
                      <TableCell className="w-[140px]">
                        <MenuStatusBadge
                          status={item.status}
                          onStatusChange={handleMenuStatusChange}
                          menuId={item.id}
                        />
                      </TableCell>
                      <TableCell>{item.tag}</TableCell>

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
                                  handleEditClick(item);
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
                                icon: item.isHidden
                                  ? EyeIcon
                                  : ViewOffSlashIcon,
                                label: item.isHidden
                                  ? "Show Item"
                                  : "Hide Item",
                                onClick: (e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  handleStatusChange(item.id!);
                                },
                              },
                              {
                                icon: Delete02Icon,
                                label: "Delete Item",
                                color: "#FF5F57",
                                onClick: (e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  handleDeleteClick(item);
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
            onDeleteConfirm={() => deleteItem(selectedItem?.id || "")}
            secondaryText="Cancel"
            description="This menu will be deleted permanently and cannot be recovered!"
          />
          <DuplicateModal
            isOpen={action === "duplicate"}
            title={selectedItem?.name || "this item"}
            onClose={() => setAction(null)}
            onDeleteConfirm={() => handleDuplicate(selectedItem?.id || "")}
            secondaryText="Cancel"
            primaryText="Duplicate"
            description="This menu will be duplicated!"
            successMessage="This menu has been duplicated successfully."
            headTitle={`Are you sure you want to duplicate ${
              selectedItem?.name || "this item"
            }?`}
          />
        </div>
        <TopMenus />
      </div>
    </section>
  );
}
