import PaginationButton from "@/components/pagination-button";
import SearchBar from "@/components/search-bar";
import React, { useMemo, useState } from "react";
import PerformingDeals from "./perfoming-deals";
import Link from "next/link";
import DealsModal from "./modals/deals-modal";
import SuccessModal from "./modals/success-modal";
import DeleteModal from "@/components/modals/delete-modal";
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
import { fmtDate, formatDateForInput } from "@/utils";
import EmptyState from "@/components/empty-state";
import SubscribeModal from "./modals/subscribe-modal";
import { Archive, BarChart3, ChevronDown, Gift, MoreVertical, Pause, Pencil, Play, Plus, Star, Trash2 } from "lucide-react";
import StatusPill from "@/components/status-pill";
import SampleDataBadge from "@/components/sample-data-badge";
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
import { useDealCampaigns } from "@/hooks/use-deals";
import { useDealsPerformance } from "@/hooks/use-deal-extras";

const STATUS_FILTERS = [
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "PAUSED", label: "Paused" },
  { value: "EXPIRED", label: "Expired" },
];
const SORT_OPTIONS = [
  { value: "none", label: "Sort by" },
  { value: "name", label: "Name" },
  { value: "startDate", label: "Start Date" },
  { value: "endDate", label: "End Date" },
  { value: "updated", label: "Date Updated" },
  { value: "created", label: "Date Created" },
];

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
      toast.success("Deal deactivated and moved to Archives");
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    } catch (error) {
      console.log(error);
      toast.error("Failed to deactivate deal");
    }
  };

  // Same status endpoint the Archives page uses to reactivate a deal.
  const handleActivate = async (id: string) => {
    try {
      await api.patch(`${SERVER_URL}/deals/${id}/status`, {
        status: "ACTIVE",
      });
      toast.success("Deal activated");
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    } catch (error) {
      console.log(error);
      toast.error("Failed to activate deal");
    }
  };

  const openEdit = (deal: Deal) => {
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
  };

  const openCreate = () => {
    form.reset();
    setAction("add");
  };

  const { campaigns } = useDealCampaigns();
  const campaignName = useMemo(
    () => new Map(campaigns.map((c) => [c.id, c.name])),
    [campaigns]
  );
  const performance = useDealsPerformance(items);

  return (
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <SearchBar
            placeholder="Search deals…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select value={statusFilter || "ACTIVE"} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11 w-[130px] rounded-full text-xs font-semibold">
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
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/apps-tools/deals/archives">
                <Archive /> Archives
              </Link>
            </Button>
            <Button variant="soft" onClick={() => setShowModal(true)}>
              <Plus /> Create Campaign
            </Button>
            <Button variant="brand" onClick={openCreate}>
              <Plus /> Create Deal
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-card">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<Gift />}
              title="No deals found"
              description={
                searchQuery
                  ? "No deals match your search. Try adjusting your filters."
                  : "Create your first deal to offer discounts on your products."
              }
              action={
                !searchQuery ? (
                  <Button variant="brand" onClick={openCreate}>
                    <Plus /> Create Your First Deal
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Deal</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>
                    <span className="inline-flex items-center gap-1">
                      Redemptions <SampleDataBadge label="Sample" />
                    </span>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((deal) => {
                  const isActive = deal.status === "ACTIVE";
                  return (
                    <TableRow key={deal.id}>
                      <TableCell>
                        <p className="flex items-center gap-1.5 font-semibold text-foreground">
                          {deal.name}
                          {deal.isFeatured && (
                            <span className="brand-gradient inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                              <Star className="h-2.5 w-2.5" /> Featured
                            </span>
                          )}
                        </p>
                        {deal.description && (
                          <p className="line-clamp-1 max-w-[260px] text-xs text-muted-foreground">
                            {deal.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {campaignName.get(deal.campaignId) ?? "—"}
                      </TableCell>
                      <TableCell className="font-display font-bold text-primary">
                        {deal.discountPercentage}% off
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {deal.maximumThreshold ? `${deal.maximumThreshold} Orders` : "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {fmtDate(deal.startDate)} → {fmtDate(deal.endDate)}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {(performance[deal.id ?? ""]?.redemptions ?? 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {isActive || deal.status === "PAUSED" ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className="inline-flex items-center gap-1 rounded-full outline-none"
                              aria-label="Change status"
                            >
                              <StatusPill status={deal.status} />
                              <ChevronDown className="h-3 w-3 text-muted-foreground" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-40 rounded-xl">
                              <DropdownMenuItem
                                className="cursor-pointer"
                                disabled={isActive}
                                onClick={() => deal.id && handleActivate(deal.id)}
                              >
                                <Play className="mr-2 h-4 w-4" /> Active
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                disabled={!isActive}
                                onClick={() => {
                                  setSelectedItem(deal);
                                  setAction("deactivate");
                                }}
                              >
                                <Pause className="mr-2 h-4 w-4" /> Paused
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <StatusPill status={deal.status} />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label={`Manage ${deal.name}`}
                            className="inline-flex min-h-[36px] items-center gap-1 rounded-full border px-3 text-xs font-semibold outline-none hover:bg-muted"
                          >
                            Manage <MoreVertical className="h-3.5 w-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => openEdit(deal)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            {isActive ? (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => {
                                  setSelectedItem(deal);
                                  setAction("deactivate");
                                }}
                              >
                                <Pause className="mr-2 h-4 w-4" /> Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => deal.id && handleActivate(deal.id)}
                              >
                                <Play className="mr-2 h-4 w-4" /> Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => {
                                setSelectedItem(deal);
                                setAction("insights");
                              }}
                            >
                              <BarChart3 className="mr-2 h-4 w-4" /> Insights
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer text-rose-500 focus:text-rose-500"
                              onClick={() => {
                                setSelectedItem(deal);
                                setAction("delete");
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
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
      </div>

      <PerformingDeals deals={items} performance={performance} />

      <DealsModal
        isOpen={action === "add" || action === "edit"}
        action={action === "edit" ? "edit" : "add"}
        onClose={() => setAction(null)}
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
        campaignName={selectedItem ? campaignName.get(selectedItem.campaignId) : undefined}
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
