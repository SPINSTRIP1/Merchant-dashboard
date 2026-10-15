"use client";
import { CircleAlert, History, Package, PackageCheck, PackageX } from "lucide-react";
import InventoryTable from "./_components/inventory-table";
import WarningBar from "./_components/warning-bar";
import { useInventoryStats } from "@/hooks/use-inventory";
import { useCatalogs } from "@/hooks/use-catalogs";
import { useLowStockItem } from "@/hooks/use-inventory-extras";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import OffersModal from "./_components/modals/offers-modal";
import { useState } from "react";
import CatalogModal from "./_components/modals/catalog-modal";
import Breadcrumb from "@/components/breadcrumb";
import PageHeader from "@/components/page-header";
import StatCard from "@/components/stat-card";
import EmptyState from "@/components/empty-state";

export default function Inventory() {
  const [action, setAction] = useState<"offers" | "create" | null>(null);
  const { stats: data } = useInventoryStats();
  const lowStockCount = data?.lowStock ?? 0;
  const lowStockItem = useLowStockItem({ enabled: lowStockCount > 0 });

  const { catalogs, isLoadingCatalogs, refetch } = useCatalogs();
  const stat = (value: number | undefined) => (value === undefined ? "—" : value.toLocaleString());

  if (isLoadingCatalogs) return <Loader />;
  return (
    <div>
      <Breadcrumb parent={{ label: "Tools", href: "/apps-tools" }} current="Inventory" />
      <PageHeader
        title="Inventory"
        subtitle="Track stock, catalogs and product visibility across your storefront."
      />
      {!catalogs || catalogs.length === 0 ? (
        <div className="rounded-2xl border bg-card">
          <EmptyState
            icon={<Package />}
            title="Welcome to Inventory"
            description="Set up your first catalog to start tracking products and stock."
            action={
              <Button variant="brand" onClick={() => setAction("offers")}>
                Get Started
              </Button>
            }
          />
        </div>
      ) : (
        <div>
          {lowStockCount > 0 && lowStockItem && (
            <WarningBar
              item={lowStockItem.name}
              amount={lowStockItem.inventory?.quantity ?? 0}
              moreCount={Math.max(0, lowStockCount - 1)}
            />
          )}
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            <StatCard index={0} label="Total Items" value={stat(data?.totalItems)} icon={<Package />} />
            <StatCard index={1} label="In Stock" value={stat(data?.inStock)} icon={<PackageCheck />} />
            <StatCard index={2} label="Low Stock" value={stat(data?.lowStock)} icon={<CircleAlert />} />
            <StatCard index={3} label="Out of Stock" value={stat(data?.outOfStock)} icon={<PackageX />} />
            <StatCard
              index={4}
              accent
              label="Recently Updated"
              value={stat(data?.recentlyUpdated)}
              icon={<History />}
            />
          </div>
          <InventoryTable />
        </div>
      )}

      <OffersModal isOpen={action === "offers"} onClose={() => setAction("create")} />
      <CatalogModal
        isOpen={action === "create"}
        onClose={() => {
          refetch();
          setAction(null);
        }}
      />
    </div>
  );
}
