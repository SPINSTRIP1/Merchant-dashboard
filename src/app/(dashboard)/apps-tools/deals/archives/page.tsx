"use client";
import ContainerWrapper from "@/components/container-wrapper";
import Dropdown from "@/components/dropdown";
import PaginationButton from "@/components/pagination-button";
import SearchBar from "@/components/search-bar";
import { Delete02Icon, Exchange01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronLeft, ChevronRight, Archive } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import DeleteModal from "../_components/modals/delete-modal";
import ReactivateModal from "./_components/reactivate-modal";
import { useDealsForm } from "../_context";
import { useServerPagination } from "@/hooks/use-server-pagination";
import { DEALS_SERVER_URL } from "@/constants";
import { Deal } from "../_schemas";
import { formatDateDisplay } from "@/utils";
import { useOptimisticDelete } from "@/hooks/use-optimistic-delete";
import api from "@/lib/api/axios-client";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import EmptyState from "@/components/empty-state";

export default function Archives() {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<Deal | null>(null);
  const {
    action,
    setAction,
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    sortBy,
    setSortBy,
  } = useDealsForm();

  // Use server pagination hook with search and filters
  const { items, currentPage, totalPages, isLoading, handlePageChange } =
    useServerPagination<Deal>({
      queryKey: "deals",
      endpoint: `${DEALS_SERVER_URL}/deals`,
      searchQuery: debouncedSearch,
      filters: {
        status: "PAUSED",
        sortBy: sortBy,
      },
    });
  // Optimistic delete hook
  const { deleteItem } = useOptimisticDelete<Deal & { id: string }>({
    queryKey: ["deals", currentPage],
    deleteEndpoint: `${DEALS_SERVER_URL}/deals`,
    successMessage: "Item deleted successfully",
    errorMessage: "Failed to delete item",
  });
  const queryClient = useQueryClient();
  const handleReactivate = async (id: string) => {
    try {
      await api.patch(`${DEALS_SERVER_URL}/deals/${id}/status`, {
        status: "ACTIVE",
      });
      toast.success("Item reactivated successfully");
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    } catch (error) {
      console.log(error);
      toast.error("Failed to reactivate item");
    }
  };
  return (
    <section>
      <div className="flex items-center mb-6 gap-x-2">
        <button
          onClick={() => router.push("/apps-tools")}
          className="flex items-center gap-x-2"
        >
          <ChevronLeft /> <p className="font-bold">Tools</p>
        </button>
        <button
          onClick={() => router.push("/apps-tools/deals")}
          className="flex items-center gap-x-2"
        >
          <ChevronLeft /> <p className="font-bold">Deals</p>
        </button>
        <button className="flex items-center gap-x-2">
          <ChevronLeft />{" "}
          <p className="font-bold text-primary-text">Archives</p>
        </button>
      </div>
      <div className="flex flex-col md:flex-row md:items-center flex-wrap gap-y-3 justify-between w-full">
        <h1 className="text-sm lg:text-base font-bold">Archived Deals</h1>
        <SearchBar
          placeholder="Search deals"
          className="bg-[#F3F3F3]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex items-center gap-x-2">
          {/* <Dropdown
            header=""
            options={[
              "All Status",
              "Draft",
              "Active",
              "Paused",
              "Ended",
              "Archived",
            ]}
            placeholder="All Status"
            onSelect={(value) => {
              if (value === "All Status") {
                setStatusFilter("");
              } else if (value === "Draft") {
                setStatusFilter("DRAFT");
              } else if (value === "Active") {
                setStatusFilter("ACTIVE");
              } else if (value === "Paused") {
                setStatusFilter("PAUSED");
              } else if (value === "Ended") {
                setStatusFilter("ENDED");
              } else if (value === "Archived") {
                setStatusFilter("ARCHIVED");
              }
            }}
          /> */}
          <Dropdown
            header=""
            options={[
              "Name",
              "Start Date",
              "End Date",
              "Date Updated",
              "Date Created",
            ]}
            placeholder="Sort by"
            onSelect={(value) => {
              switch (value) {
                case "Name":
                  setSortBy("name");
                  break;
                case "Start Date":
                  setSortBy("startDate");
                  break;
                case "End Date":
                  setSortBy("endDate");
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
        {/* <div className="flex justify-end w-full lg:w-fit items-center gap-x-2">
          <button
            onClick={() => {
              form.reset();
              setAction("add");
            }}
            className="rounded-2xl bg-primary h-12 md:h-10 text-white flex justify-center items-center gap-2 px-4"
          >
            <HugeiconsIcon
              icon={PlusSignSquareIcon}
              size={24}
              color="#FFFFFF"
            />
            <p className="font-normal">Create Deal</p>
          </button>
        </div> */}
      </div>
      {isLoading ? (
        <div className="space-y-3 mt-5">
          {[1, 2, 3, 4].map((i) => (
            <ContainerWrapper key={i}>
              <div className="animate-pulse">
                <div className="flex gap-x-4 justify-between mb-3 w-full">
                  <div className="flex-shrink-0 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="max-w-[435px] w-full">
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="min-w-6 min-h-6 max-h-6 max-w-6 bg-gray-200 rounded-full"></div>
                </div>
                <div className="flex items-center gap-x-2">
                  <div className="h-[35px] w-32 bg-gray-200 rounded-xl"></div>
                  <div className="h-[35px] w-24 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            </ContainerWrapper>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Archive className="h-16 w-16 text-primary" />}
          title="No Archived Deals"
          description={
            searchQuery
              ? "No archived deals match your search criteria"
              : "You don't have any archived deals yet. Archived deals will appear here."
          }
        />
      ) : (
        items.map((deal, index) => (
          <ContainerWrapper key={index} className="mt-5">
            <div className="flex gap-x-4 justify-between mb-3 w-full">
              <div className="flex-shrink-0">
                <h2 className="font-bold text-primary-text">{deal.name}</h2>
                {/* <p className="text-[#34C759] text-xs">
                       {deal.status === "ACTIVE"
                         ? "Active"
                         : deal.status === "PAUSED"
                         ? "Paused"
                         : "Draft"}
                     </p> */}
              </div>
              <p className="max-w-[435px] w-full">{deal.description}</p>
              <button
                onClick={() =>
                  setSelectedItem((prev) => (prev === deal ? null : deal))
                }
                className="min-w-6 min-h-6 max-h-6 max-w-6 flex items-center justify-center bg-neutral-accent rounded-full hover:bg-gray-200 transition-colors duration-200"
              >
                <ChevronRight size={20} className="text-secondary-text" />
              </button>
            </div>

            <div className="flex items-center gap-x-2">
              <button
                onClick={() => {
                  setSelectedItem(deal);
                  setAction("reactivate");
                }}
                className="rounded-xl text-primary bg-primary-accent h-[35px] px-2 flex justify-center items-center gap-2"
              >
                <HugeiconsIcon
                  icon={Exchange01Icon}
                  size={16}
                  color="#6932e2"
                />
                <p className="font-normal text-sm">Reactivate</p>
              </button>
              <button
                onClick={() => {
                  setSelectedItem(deal);
                  setAction("delete");
                }}
                className="rounded-xl text-[#FF383C] bg-[#F6DDDD] h-[35px] px-2 flex justify-center items-center gap-2"
              >
                <HugeiconsIcon icon={Delete02Icon} color="#FF383C" size={16} />
                <p className="font-normal text-sm">Delete</p>
              </button>
            </div>

            {selectedItem === deal && !action && (
              <div className="border-t mt-4">
                <div className="flex items-center justify-between my-2 w-full">
                  <h2 className="font-bold mb-1">Discount</h2>
                  <p>{selectedItem.discountPercentage}% </p>
                </div>
                <div className="flex items-center justify-between my-2 w-full">
                  <h2 className="font-bold mb-1">Menu Items</h2>
                  <div className="flex items-end justify-end max-w-[300px] flex-wrap gap-2">
                    {[
                      "Jollof Rice and Chicken",
                      "Fried Rice and Chicken",
                      "Asun Rice",
                      "Goat Meat Pepper Soup",
                    ].map((item) => (
                      <div
                        key={item}
                        className="border border-neutral-accent rounded-lg w-fit py-0.5 px-1"
                      >
                        <p className="text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between my-2 w-full">
                  <h2 className="font-bold mb-1">Validity period</h2>
                  <p>
                    {formatDateDisplay(selectedItem.startDate)} -{" "}
                    {formatDateDisplay(selectedItem.endDate)}
                  </p>
                </div>
                <div className="flex items-center justify-between my-2 w-full">
                  <h2 className="font-bold mb-1">Maximum Threshold</h2>
                  <p>{selectedItem.maximumThreshold} Orders</p>
                </div>
              </div>
            )}
          </ContainerWrapper>
        ))
      )}
      {!isLoading && items.length > 0 && (
        <PaginationButton
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
      <DeleteModal
        isOpen={action === "delete"}
        onClose={() => {
          setAction(null);
          setSelectedItem(null);
        }}
        title={selectedItem?.name || ""}
        onDeleteConfirm={() => deleteItem(selectedItem?.id || "")}
        secondaryText="Cancel"
      />
      <ReactivateModal
        isOpen={action === "reactivate"}
        onClose={() => {
          setAction(null);
          setSelectedItem(null);
        }}
        onReactivate={() => handleReactivate(selectedItem?.id || "")}
        title={selectedItem?.name || ""}
      />
    </section>
  );
}
