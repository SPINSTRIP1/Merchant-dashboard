import ContainerWrapper from "@/components/container-wrapper";
import Dropdown from "@/components/dropdown";
import PaginationButton from "@/components/pagination-button";
import SearchBar from "@/components/search-bar";
import {
  ArrowRight02Icon,
  Chart03Icon,
  Delete02Icon,
  Edit02Icon,
  PlusSignSquareIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronRight, X, Gift } from "lucide-react";
import React, { useState } from "react";
import PerformingDeals from "./perfoming-deals";
import Link from "next/link";
import DealsModal from "./modals/deals-modal";
import SuccessModal from "./modals/success-modal";
import DeleteModal from "./modals/delete-modal";
import DeactivateModal from "./modals/deactivate-modal";
import InsightsModal from "./modals/insights-modal";
import { useDealsForm } from "../_context";
import { useServerPagination } from "@/hooks/use-server-pagination";
import { SERVER_URL } from "@/constants";
import { useQueryClient } from "@tanstack/react-query";
import { Deal } from "../_schemas";
import { useOptimisticDelete } from "@/hooks/use-optimistic-delete";
import { toast } from "react-hot-toast";
import api from "@/lib/api/axios-client";
import { formatDateDisplay, formatDateForInput } from "@/utils";
import AddButton from "@/app/(dashboard)/_components/add-button";
import EmptyState from "@/components/empty-state";
import SubscribeModal from "./modals/subscribe-modal";

export default function DealsTable() {
  const [selectedItem, setSelectedItem] = useState<Deal | null>(null);
  const {
    action,
    setAction,
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    form,
  } = useDealsForm();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  // Use server pagination hook with search and filters
  const { items, currentPage, totalPages, isLoading, handlePageChange } =
    useServerPagination<Deal>({
      queryKey: "deals",
      endpoint: `${SERVER_URL}/deals`,
      searchQuery: debouncedSearch,
      filters: {
        status: statusFilter || "ACTIVE",
        sortBy: sortBy,
      },
    });

  // Optimistic delete hook
  const { deleteItem } = useOptimisticDelete<Deal & { id: string }>({
    queryKey: ["deals", currentPage],
    deleteEndpoint: `${SERVER_URL}/deals`,
    successMessage: "Item deleted successfully",
    errorMessage: "Failed to delete item",
  });

  const handleDeactivate = async (id: string) => {
    try {
      await api.patch(`${SERVER_URL}/deals/${id}/status`, {
        status: "PAUSED",
      });
      toast.success("Item archived successfully");
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    } catch (error) {
      console.log(error);
      toast.error("Failed to archive item");
    }
  };
  // console.log(items);
  return (
    <section className="grid gap-5 grid-cols-[1fr_293px]">
      <div>
        <div className="flex flex-col md:flex-row md:items-center flex-wrap gap-y-3 justify-between w-full">
          <h1 className="text-sm lg:text-base font-bold">Deals</h1>
          <SearchBar
            placeholder="Search deals"
            className="bg-[#F3F3F3]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex items-center gap-x-2">
            <Dropdown
              header=""
              options={["All Status", "Draft", "Active", "Paused", "Ended"]}
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
                }
              }}
            />
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
          <div className="flex justify-end w-full lg:w-fit items-center gap-x-2">
            <AddButton
              onClick={() => {
                form.reset();
                setAction("add");
              }}
              title="Create Deal"
            />
            <AddButton
              onClick={() => setShowModal(true)}
              title="Create Campaign"
              className="bg-primary-accent text-primary"
            />

            <Link
              href={"/apps-tools/deals/archives"}
              className="rounded-2xl bg-primary-accent h-12 md:h-10 text-primary flex justify-center items-center gap-2 px-4"
            >
              <p className="font-normal text-sm">Archives</p>
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={22}
                color="#6932E2"
              />
            </Link>
          </div>
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
                  <div className="flex justify-between w-full">
                    <div className="flex items-center gap-x-2">
                      <div className="h-[35px] w-20 bg-gray-200 rounded-xl"></div>
                      <div className="h-[35px] w-28 bg-gray-200 rounded-xl"></div>
                      <div className="h-[35px] w-24 bg-gray-200 rounded-xl"></div>
                    </div>
                    <div className="h-[35px] w-24 bg-gray-200 rounded-xl"></div>
                  </div>
                </div>
              </ContainerWrapper>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Gift className="h-16 w-16 text-primary" />}
            title="No Deals Found"
            description={
              searchQuery
                ? "No deals match your search criteria. Try adjusting your filters."
                : "You haven't created any deals yet. Create your first deal to get started!"
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
                  <p className="font-normal">Create Your First Deal</p>
                </button>
              ) : undefined
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
              <div className="flex justify-between w-full">
                <div className="flex items-center gap-x-2">
                  <button
                    onClick={() => {
                      form.reset({
                        campaignId: deal.campaignId,
                        name: deal.name,
                        description: deal.description,
                        discountPercentage: deal.discountPercentage,
                        maximumThreshold: deal.maximumThreshold,
                        startDate: formatDateForInput(deal.startDate),
                        endDate: formatDateForInput(deal.endDate),
                        isFeatured: deal.isFeatured,
                        productIds: deal.productIds,
                        id: deal.id,
                      });
                      setAction("edit");
                    }}
                    className="rounded-xl bg-primary h-[35px] px-2 text-white flex justify-center items-center gap-2"
                  >
                    <HugeiconsIcon
                      icon={Edit02Icon}
                      size={16}
                      color="#FFFFFF"
                    />
                    <p className="font-normal text-sm">Edit</p>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedItem(deal);
                      setAction("deactivate");
                    }}
                    className="rounded-xl text-primary bg-primary-accent h-[35px] px-2 flex justify-center items-center gap-2"
                  >
                    <X color="#6932E2" size={16} />
                    <p className="font-normal text-sm">Deactivate</p>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedItem(deal);
                      setAction("insights");
                    }}
                    className="rounded-xl text-primary bg-primary-accent h-[35px] px-2 flex justify-center items-center gap-2"
                  >
                    <HugeiconsIcon
                      icon={Chart03Icon}
                      color="#6932E2"
                      size={16}
                    />
                    <p className="font-normal text-sm">Insights</p>
                  </button>
                </div>

                <button
                  onClick={() => [setSelectedItem(deal), setAction("delete")]}
                  className="rounded-xl text-[#FF383C] bg-[#F6DDDD] h-[35px] px-2 flex justify-center items-center gap-2"
                >
                  <HugeiconsIcon
                    icon={Delete02Icon}
                    color="#FF383C"
                    size={16}
                  />
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
                      {selectedItem.products.map((item) => (
                        <div
                          key={item.name}
                          className="border border-neutral-accent rounded-lg w-fit py-0.5 px-1"
                        >
                          <p className="text-sm">{item.name}</p>
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
        {!isLoading && totalPages > 0 && (
          <PaginationButton
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
      <PerformingDeals />
      <DealsModal
        isOpen={action === "add" || action === "edit"}
        //@ts-expect-error: there is no issue here
        action={action}
        onClose={() => setAction(null)}
        onUpdate={() => {
          setAction(null);
          setShowSuccessModal(true);
        }}
      />
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        description={`${selectedItem?.name || ""} Deal has been updated`}
      />
      <DeleteModal
        isOpen={action === "delete"}
        onClose={() => setAction(null)}
        title={selectedItem?.name || ""}
        onDeleteConfirm={() => deleteItem(selectedItem?.id || "")}
        onDeactivateConfirm={() => setAction("deactivate")}
      />
      <DeactivateModal
        isOpen={action === "deactivate"}
        onClose={() => setAction(null)}
        onDeactivate={() => handleDeactivate(selectedItem?.id || "")}
        title={selectedItem?.name || ""}
      />

      <InsightsModal
        isOpen={action === "insights"}
        onClose={() => setAction(null)}
        deal={selectedItem}
      />
      <SubscribeModal
        isOpen={showModal}
        onClose={() => {
          queryClient.invalidateQueries({ queryKey: ["campaigns"] });
          setShowModal(false);
        }}
      />
    </section>
  );
}
