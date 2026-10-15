"use client";
import PaginationButton from "@/components/pagination-button";
import SearchBar from "@/components/search-bar";
import { Archive, ChevronDown, RotateCcw, Trash2 } from "lucide-react";
import React, { useState } from "react";
import DeleteModal from "@/components/modals/delete-modal";
import ReactivateModal from "./_components/reactivate-modal";
import { useDealsForm } from "../_context";
import { useServerPagination } from "@/hooks/use-server-pagination";
import { SERVER_URL } from "@/constants";
import { Deal } from "../_schemas";
import { fmtDate } from "@/utils";
import { useOptimisticDelete } from "@/hooks/use-optimistic-delete";
import api from "@/lib/api/axios-client";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import EmptyState from "@/components/empty-state";
import Breadcrumb from "@/components/breadcrumb";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "none", label: "Sort by" },
  { value: "name", label: "Name" },
  { value: "startDate", label: "Start Date" },
  { value: "endDate", label: "End Date" },
  { value: "updated", label: "Date Updated" },
  { value: "created", label: "Date Created" },
];

export default function Archives() {
  const [selectedItem, setSelectedItem] = useState<Deal | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
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
      endpoint: `${SERVER_URL}/deals`,
      searchQuery: debouncedSearch,
      filters: {
        status: "PAUSED",
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
  const queryClient = useQueryClient();
  const handleReactivate = async (id: string) => {
    try {
      await api.patch(`${SERVER_URL}/deals/${id}/status`, {
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
      <Breadcrumb parent={{ label: "Deals", href: "/apps-tools/deals" }} current="Archives" />
      <PageHeader title="Archived Deals" subtitle="Deactivated deals. Reactivate one to put it back on sale." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchBar
          placeholder="Search archived deals…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select value={sortBy || "none"} onValueChange={(v) => setSortBy(v === "none" ? "" : v)}>
          <SelectTrigger className="h-11 w-[150px] rounded-full text-xs font-semibold">
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
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border bg-card">
          <EmptyState
            icon={<Archive />}
            title="No archived deals"
            description={
              searchQuery
                ? "No archived deals match your search."
                : "Deals you deactivate will appear here."
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((deal) => {
            const isOpen = expanded === deal.id;
            return (
              <article key={deal.id} className="rounded-2xl border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-bold text-foreground">{deal.name}</p>
                    {deal.description && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{deal.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="soft"
                      onClick={() => {
                        setSelectedItem(deal);
                        setAction("reactivate");
                      }}
                    >
                      <RotateCcw /> Reactivate
                    </Button>
                    <button
                      type="button"
                      aria-label={`Delete ${deal.name}`}
                      onClick={() => {
                        setSelectedItem(deal);
                        setAction("delete");
                      }}
                      className="grid h-9 w-9 place-items-center rounded-full text-rose-500 hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-label="Show details"
                      onClick={() => setExpanded(isOpen ? null : deal.id ?? null)}
                      className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                    >
                      <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-3 divide-y rounded-xl border px-4 text-sm">
                    <div className="flex justify-between gap-4 py-2">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-semibold text-primary">{deal.discountPercentage}% off</span>
                    </div>
                    <div className="flex justify-between gap-4 py-2">
                      <span className="text-muted-foreground">Products</span>
                      <span className="flex max-w-[60%] flex-wrap justify-end gap-1.5">
                        {deal.products?.length
                          ? deal.products.map((item) => (
                              <span
                                key={item.id ?? item.name}
                                className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary"
                              >
                                {item.name}
                              </span>
                            ))
                          : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 py-2">
                      <span className="text-muted-foreground">Validity period</span>
                      <span className="text-foreground">
                        {fmtDate(deal.startDate)} → {fmtDate(deal.endDate)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 py-2">
                      <span className="text-muted-foreground">Maximum Threshold</span>
                      <span className="text-foreground">{deal.maximumThreshold ?? 0} Orders</span>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
      {!isLoading && totalPages > 1 && (
        <PaginationButton currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
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
