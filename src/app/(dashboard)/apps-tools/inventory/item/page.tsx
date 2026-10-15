"use client";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Line } from "react-chartjs-2";
import {
  Coins,
  Copy,
  Eye,
  EyeOff,
  Hash,
  Package,
  PackagePlus,
  Pencil,
  ShoppingBag,
  Star,
  Trash2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import InventoryModal from "../_components/modals/inventory-modal";
import { STOCK_LABELS, productSku } from "../_components/inventory-table";
import DeleteModal from "@/components/modals/delete-modal";
import DuplicateModal from "@/components/modals/delete-modal";
import { useInventoryItem, useInventoryProducts } from "@/hooks/use-inventory";
import { useItemHistory, useRestockItem } from "@/hooks/use-inventory-extras";
import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { InventoryProduct, StockStatus } from "../_schemas";
import Loader from "@/components/loader";
import Breadcrumb from "@/components/breadcrumb";
import StatCard from "@/components/stat-card";
import ChartCard from "@/components/chart-card";
import StatusPill from "@/components/status-pill";
import EmptyState from "@/components/empty-state";
import SampleDataBadge from "@/components/sample-data-badge";
import { Button } from "@/components/ui/button";
import { useInventoryForm } from "../_context";
import { useOptimisticDelete } from "@/hooks/use-optimistic-delete";
import { areaDataset, lineChartOptions, useChartThemeKey } from "@/lib/chart-theme";
import { capitalizeFirstLetter, fmtDate, fmtDateTime, formatAmount } from "@/utils";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{children}</span>
    </div>
  );
}

function InventoryItemContent() {
  const chartKey = useChartThemeKey();
  const { form, setAction, action } = useInventoryForm();
  // Optimistic delete hook

  const queryClient = useQueryClient();
  const { deleteItem } = useOptimisticDelete<InventoryProduct>({
    queryKey: ["inventory-products"],
    deleteEndpoint: `${SERVER_URL}/inventory/products`,
    successMessage: "Item deleted successfully",
    errorMessage: "Failed to delete item",
    onSuccess: () => router.back(),
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

  // Show/hide uses the same product update call as the inventory table's visibility switch.
  const handleVisibility = async (id: string, newStatus: "ACTIVE" | "INACTIVE") => {
    try {
      await api.patch(`${SERVER_URL}/inventory/products/${id}`, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ["inventory-item"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-products"] });
      toast.success(newStatus === "ACTIVE" ? "Item is visible again" : "Item hidden");
    } catch (error) {
      console.log(error);
      toast.error("Failed to change item visibility");
    }
  };

  const router = useRouter();
  const params = useSearchParams();
  const itemId = params.get("id");
  const { item: data, isLoading } = useInventoryItem(itemId);
  const restock = useRestockItem();
  const { products } = useInventoryProducts();
  const history = useItemHistory(itemId, Number(data?.sellingPrice) || 0);

  const related = useMemo(
    () => products.filter((p) => p.id !== data?.id && p.categoryId === data?.categoryId).slice(0, 4),
    [products, data?.id, data?.categoryId]
  );

  const openEdit = () => {
    form.reset({
      id: data?.id,
      name: data?.name,
      description: data?.description || "",
      categoryId: data?.categoryId,
      catalogId: data?.catalogId,
      tags: data?.tags || [],
      brand: data?.brand || "",
      productType: data?.productType,
      sellingPrice: Number(data?.sellingPrice) || 0,
      costPrice: Number(data?.costPrice) || 0,
      taxPercentage: Number(data?.taxPercentage) || 0,
      quantity: data?.inventory.quantity || 0,
      maxStockLevel: data?.inventory.maxStockLevel || 0,
      showInMenu: data?.showInMenu,
      isFeatured: data?.isFeatured,
      variant: data?.variant || undefined,
      slotConfig: data?.slotConfig || undefined,
      dealIds: data?.dealIds || [],
      media: data?.media || [],
    });
    setAction("edit");
  };

  if (isLoading) return <Loader />;
  if (!data) {
    return (
      <div className="rounded-2xl border bg-card">
        <EmptyState
          icon={<Package />}
          title="Item not found"
          description="This item may have been deleted."
          action={
            <Button variant="brand" asChild>
              <Link href="/apps-tools/inventory">Back to Inventory</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const stockStatus = (data.inventory.stockStatus as StockStatus) || "IN_STOCK";
  const visible = data.status === "ACTIVE";
  const variants = data.variant
    ? Object.entries(data.variant).filter(([, value]) => value)
    : [];

  return (
    <div>
      <Breadcrumb parent={{ label: "Inventory", href: "/apps-tools/inventory" }} current={data.name} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {data.media?.[0] ? (
            <Image src={data.media[0]} alt="" width={56} height={56} className="h-14 w-14 rounded-2xl object-cover" />
          ) : (
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Package className="h-6 w-6" />
            </div>
          )}
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{data.name}</h1>
            <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono">{productSku(data.id)}</span>
              <StatusPill status={stockStatus} label={STOCK_LABELS[stockStatus]} />
              {!visible && <StatusPill status="draft" label="Hidden" />}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="brand" onClick={openEdit}>
            <Pencil /> Edit Item
          </Button>
          <Button size="sm" variant="outline" onClick={() => setAction("duplicate")}>
            <Copy /> Duplicate
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={restock.isPending}
            onClick={() => restock.mutate({ id: data.id, currentQuantity: data.inventory.quantity || 0, add: 50 })}
          >
            <PackagePlus /> Restock +50
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleVisibility(data.id, visible ? "INACTIVE" : "ACTIVE")}>
            {visible ? <EyeOff /> : <Eye />} {visible ? "Hide Item" : "Show Item"}
          </Button>
          <Button size="sm" variant="outline" className="text-rose-500 hover:text-rose-600" onClick={() => setAction("delete")}>
            <Trash2 /> Delete
          </Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard index={0} label="Total Sales" value={(data.totalSales || 0).toLocaleString()} icon={<ShoppingBag />} />
        <StatCard
          index={1}
          label="Stock Quantity"
          value={(data.inventory.quantity || 0).toLocaleString()}
          icon={<Hash />}
        />
        <StatCard index={2} accent label="Current Price" value={formatAmount(data.sellingPrice || 0)} icon={<Coins />} />
        <StatCard
          index={3}
          label="Avg. Rating"
          value={data.averageRating ? Number(data.averageRating).toFixed(1) : "—"}
          icon={<Star />}
        />
        <StatCard index={4} label="Total Views" value={(data.totalViews || 0).toLocaleString()} icon={<Eye />} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="mb-2 font-display text-base font-bold text-foreground">About this item</h2>
            <p className="text-sm text-muted-foreground">
              {data.description || "No description available for this item."}
            </p>
            {!!data.tags?.length && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {data.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold capitalize text-primary">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-4 divide-y rounded-xl border px-4">
              <Row label="Catalog">{data.catalog?.name ?? "—"}</Row>
              <Row label="Category">{data.category?.name ?? "—"}</Row>
              <Row label="Brand">{data.brand || "—"}</Row>
              <Row label="Product type">{capitalizeFirstLetter(data.productType) || "—"}</Row>
              <Row label="Variants">
                {variants.length
                  ? variants.map(([key, value]) => `${capitalizeFirstLetter(key)}: ${value}`).join(" · ")
                  : "—"}
              </Row>
            </div>
            {!!data.media?.length && (
              <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto">
                {data.media.map((img, index) => (
                  <div key={index} className="relative h-36 w-48 shrink-0 overflow-hidden rounded-xl">
                    <Image src={img} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <ChartCard title="Sales and Performance" subtitle="Units sold per month" action={<SampleDataBadge />}>
            <div className="h-56">
              {history && (
                <Line key={chartKey}
                  data={{
                    labels: history.monthlySales.map((m) => m.label),
                    datasets: [areaDataset("Units sold", history.monthlySales.map((m) => m.units), "chart-1")],
                  }}
                  options={lineChartOptions({ integerTicks: true, tooltipLabel: (v) => `${v} units sold` })}
                />
              )}
            </div>
          </ChartCard>

          <section className="overflow-hidden rounded-2xl border bg-card">
            <div className="flex items-center justify-between gap-2 border-b px-5 py-4">
              <h2 className="font-display text-base font-bold text-foreground">Inventory Activity Log</h2>
              <SampleDataBadge />
            </div>
            <ul className="divide-y">
              {history?.activity.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <div className="min-w-0">
                    <p className={entry.change >= 0 ? "font-semibold text-emerald-600" : "font-semibold text-rose-500"}>
                      {entry.action}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {entry.staff.name} · {entry.staff.role}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{fmtDateTime(entry.date)}</span>
                </li>
              ))}
            </ul>
          </section>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="mb-2 font-display text-base font-bold text-foreground">Stock Inventory</h2>
            <div className="divide-y">
              <Row label="Current stock">{(data.inventory.quantity || 0).toLocaleString()}</Row>
              <Row label="Max stock level">{(data.inventory.maxStockLevel || 0).toLocaleString()}</Row>
              <Row label="Reorder alert">
                {data.reorderThreshold ? `Below ${data.reorderThreshold}` : "Not set"}
              </Row>
              <Row label="Status">
                <StatusPill status={stockStatus} label={STOCK_LABELS[stockStatus]} />
              </Row>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h2 className="mb-2 font-display text-base font-bold text-foreground">Pricing and Discounts</h2>
            <div className="divide-y">
              <Row label="Selling price">{formatAmount(data.sellingPrice || 0)}</Row>
              <Row label="Cost price">{formatAmount(data.costPrice || 0)}</Row>
              <Row label="Discount">{data.discountPercentage ? `${data.discountPercentage}%` : "None"}</Row>
              <Row label="Tax">{data.taxPercentage ? `${data.taxPercentage}% applied` : "None"}</Row>
              <Row label="Linked deals">{data.dealIds?.length ? data.dealIds.length : "None"}</Row>
            </div>
            {!!history?.priceHistory.length && (
              <div className="mt-3 rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-semibold text-foreground">Price history</span>
                  <SampleDataBadge label="Sample" />
                </div>
                {history.priceHistory.map((change) => (
                  <p key={change.date} className="flex justify-between gap-2">
                    <span>
                      {formatAmount(change.from)} → {formatAmount(change.to)}
                    </span>
                    <span>{fmtDate(change.date)}</span>
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h2 className="mb-3 font-display text-base font-bold text-foreground">Related Items</h2>
            {related.length ? (
              <ul className="space-y-3">
                {related.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/apps-tools/inventory/item?id=${item.id}`}
                      className="flex items-center gap-3 rounded-xl p-1 transition-colors hover:bg-muted"
                    >
                      {item.media?.[0] ? (
                        <Image src={item.media[0]} alt="" width={40} height={40} className="h-10 w-10 rounded-xl object-cover" />
                      ) : (
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                          <Package className="h-4 w-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{productSku(item.id)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">No other items in this category yet.</p>
            )}
          </div>
        </aside>
      </div>

      <InventoryModal
        isOpen={action === "add" || action === "edit"}
        action={action}
        onClose={() => setAction(null)}
      />
      <DeleteModal
        isOpen={action === "delete"}
        title={data?.name || "this item"}
        onClose={() => setAction(null)}
        onDeleteConfirm={() => deleteItem(data?.id || "")}
        secondaryText="Cancel"
        description="This product will be deleted permanently and cannot be recovered!"
      />
      <DuplicateModal
        isOpen={action === "duplicate"}
        title={data?.name || "this item"}
        onClose={() => setAction(null)}
        onDeleteConfirm={() => handleDuplicate(data?.id || "")}
        secondaryText="Cancel"
        primaryText="Duplicate"
        description="This product will be duplicated!"
        successMessage="This product has been duplicated successfully."
        headTitle={`Are you sure you want to duplicate ${
          data?.name || "this item"
        }?`}
      />
    </div>
  );
}

export default function InventoryItem() {
  return (
    <Suspense fallback={<Loader />}>
      <InventoryItemContent />
    </Suspense>
  );
}
