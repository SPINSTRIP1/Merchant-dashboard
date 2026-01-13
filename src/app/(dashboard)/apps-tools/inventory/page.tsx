"use client";
import {
  CancelCircleIcon,
  CircleArrowReload01Icon,
  DeliveryBox01Icon,
  DiscountTag02Icon,
  InformationDiamondIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import InventoryTable from "./_components/inventory-table";
import WarningBar from "./_components/warning-bar";
import { useQuery } from "@tanstack/react-query";
import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import toast from "react-hot-toast";
import { InventoryStatsResponse } from "./_types";
import { useCatalogs } from "./_hooks/use-catalogs";
import Loader from "@/components/loader";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import OffersModal from "./_components/modals/offers-modal";
import { useState } from "react";
import CatalogModal from "./_components/modals/catalog-modal";

export default function Inventory() {
  const isLowstock = false;
  const [action, setAction] = useState<"offers" | "create" | null>(null);
  const { data } = useQuery({
    queryKey: ["inventory-stats"],
    queryFn: async () => {
      try {
        const response = await api.get(
          SERVER_URL + "/inventory/products/stats"
        );
        return response.data.data as InventoryStatsResponse;
      } catch (error) {
        console.log("Error fetching compliance status:", error);
        toast.error("Failed to fetch inventory statistics.");
        return {
          totalItems: 0,
          inStock: 0,
          lowStock: 0,
          outOfStock: 0,
          recentlyUpdated: 0,
        };
      }
    },
  });

  const { catalogs, isLoadingCatalogs, refetch } = useCatalogs();
  const stats = [
    {
      title: "Total Items",
      value: data?.totalItems ?? "__",
      icon: DiscountTag02Icon,
      textColor: "#6932E2",
      bgColor: "#EBE2FF",
    },
    {
      title: "In Stock",
      value: data?.inStock ?? "__",
      icon: DeliveryBox01Icon,
      textColor: "#34C759",
      bgColor: "#DDF6E2",
    },
    {
      title: "Low Stock",
      value: data?.lowStock ?? "__",
      icon: InformationDiamondIcon,
      textColor: "#FF8D28",
      bgColor: "#F6E9DD",
    },
    {
      title: "Out of Stock",
      value: data?.outOfStock ?? "__",
      icon: CancelCircleIcon,
      textColor: "#FF383C",
      bgColor: "#F6DDDD",
    },
    {
      title: "Recently Updated",
      value: data?.recentlyUpdated ?? "__",
      icon: CircleArrowReload01Icon,
      textColor: "#0088FF",
      bgColor: "#D9EDFF",
    },
  ];
  if (isLoadingCatalogs) return <Loader />;
  return (
    <div>
      {!catalogs || catalogs.length === 0 ? (
        <div className="flex items-center justify-center flex-col gap-y-1.5 flex-1 mt-52">
          <Image
            src={"/icons/work-in-progress.svg"}
            width={600}
            height={400}
            className="w-[174px] h-[106px]"
            alt="Empty state"
          />
          <h1 className="font-bold text-primary-text">Welcome to Inventory</h1>
          <p className="text-sm">Quickly set up your inventory to begin</p>
          <Button
            onClick={() => setAction("offers")}
            size={"lg"}
            className="w-[368px] mt-2 h-[51px]"
          >
            Get Started
          </Button>
        </div>
      ) : (
        <div>
          {isLowstock && (
            <WarningBar item="Jollof Rice and Chic..." amount={10} />
          )}
          <div className="flex flex-wrap mb-5 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className="bg-foreground h-[165px] max-w-[180px] md:max-w-[210px] w-full p-4 rounded-[32px] flex flex-col justify-between gap-y-2"
              >
                <div
                  className="rounded-full p-2 bg-primary-accent w-fit"
                  style={{ backgroundColor: stat.bgColor }}
                >
                  <HugeiconsIcon
                    icon={stat.icon}
                    size={24}
                    color={stat.textColor}
                  />
                </div>
                <div>
                  <p className="text-2xl text-primary-text font-bold">
                    {stat.value}
                  </p>
                  <h3 className="text-secondary-text text-lg">{stat.title}</h3>
                </div>
              </div>
            ))}
          </div>
          <InventoryTable />
        </div>
      )}

      <OffersModal
        isOpen={action === "offers"}
        onClose={() => setAction("create")}
      />
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
