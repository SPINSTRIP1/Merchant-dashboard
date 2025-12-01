"use client";
import Item from "@/components/item";
import {
  ArrangeByNumbers19Icon,
  CoinsDollarIcon,
  DiscountTag02Icon,
  EyeIcon,
  StarIcon,
  Copy01Icon,
  Delete02Icon,
  Edit02Icon,
  Exchange01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { statusColors } from "../_components/inventory-table";
import ContainerWrapper from "@/components/container-wrapper";
import Image from "next/image";
import { useState } from "react";
import InventoryChart from "./_components/inventory-chart";
import InventoryItemTable from "./_components/table";
import InventoryModal from "../_components/modals/inventory-modal";
import DeleteModal from "../../deals/_components/modals/delete-modal";
import DuplicateModal from "../../deals/_components/modals/delete-modal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { INVENTORY_SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { InventoryProduct } from "../_schemas";
import Loader from "@/components/loader";
import { useInventoryForm } from "../_context";
import { useOptimisticDelete } from "@/hooks/use-optimistic-delete";
import toast from "react-hot-toast";
import { capitalizeFirstLetter, formatAmount } from "@/utils";

export default function InventoryItem() {
  const { form, setAction, action } = useInventoryForm();
  // Optimistic delete hook

  const queryClient = useQueryClient();
  const { deleteItem } = useOptimisticDelete<InventoryProduct>({
    queryKey: ["inventory-products"],
    deleteEndpoint: `${INVENTORY_SERVER_URL}/products`,
    successMessage: "Item deleted successfully",
    errorMessage: "Failed to delete item",
    onSuccess: () => router.back(),
  });

  const handleDuplicate = async (id: string) => {
    try {
      await api.post(`${INVENTORY_SERVER_URL}/products/${id}/duplicate`);
      queryClient.invalidateQueries({ queryKey: ["inventory-products"] });
    } catch (error) {
      console.log(error);
      toast.error("Failed to duplicate item");
    }
  };
  const router = useRouter();
  const params = useSearchParams();
  const itemId = params.get("id");
  const [showlogs, setShowlogs] = useState(false);
  const [showPrices, setShowPrices] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["inventory-item", itemId],
    queryFn: async () => {
      try {
        const response = await api.get(
          INVENTORY_SERVER_URL + "/products/" + itemId
        );
        return response.data.data as InventoryProduct;
      } catch (error) {
        console.log("Error fetching compliance status:", error);

        return null;
      }
    },
  });
  const stats = [
    {
      title: "Total Sales",
      value: data?.totalSales || 0,
      icon: DiscountTag02Icon,
    },
    {
      title: "Stock Quantity",
      value: data?.inventory.quantity || 0,
      icon: ArrangeByNumbers19Icon,
    },
    {
      title: "Current Price",
      value: formatAmount(data?.sellingPrice || 0),
      icon: CoinsDollarIcon,
    },
    {
      title: "Avg. Rating",
      value: data?.averageRating || 0,
      icon: StarIcon,
      ratings: 4.2,
    },
    {
      title: "Total Views",
      value: data?.totalViews || 0,
      icon: EyeIcon,
    },
  ];
  if (isLoading) return <Loader />;
  return (
    <div>
      <div className="flex items-center mb-6 gap-x-2">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-x-2"
        >
          <ChevronLeft /> <p className="font-bold">Inventory</p>
        </button>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-x-2"
        >
          <ChevronLeft />{" "}
          <p className="font-bold text-primary-text">{data?.name}</p>
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-x-5 md:items-center gap-y-4 justify-between">
        <div className="flex gap-x-2.5">
          <Item
            item={{
              name: data?.name || "",
              id: `ID: ${itemId?.slice(0, 8).toUpperCase()}`,
              img: data?.media?.[0] || "/item.jpg",
            }}
          />
          <div
            className={`${
              statusColors[data?.inventory.stockStatus || "IN_STOCK"]
            } h-fit w-[80px] flex items-center justify-center py-1 rounded-lg`}
          >
            <p className="font-semibold uppercase text-xxs">
              {" "}
              {data?.inventory.stockStatus === "IN_STOCK"
                ? "In Stock"
                : data?.inventory.stockStatus === "LOW_STOCK"
                ? "Low Stock"
                : "Out of Stock"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap item-center gap-3">
          {[
            {
              icon: Edit02Icon,
              label: "Edit Item",
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
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
              },
            },
            {
              icon: Copy01Icon,
              label: "Duplicate Item",
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();

                setAction("duplicate");
              },
            },
            {
              icon: Exchange01Icon,
              label: "Restock Item",
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
              },
            },
            {
              icon: EyeIcon,
              label: "Hide Item",
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
              },
            },
            {
              icon: Delete02Icon,
              label: "Delete Item",
              color: "#FF5F57",
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();

                setAction("delete");
              },
            },
          ].map(({ icon, label, color, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="flex bg-white px-3 py-2 items-center gap-x-2 rounded-md"
            >
              <HugeiconsIcon icon={icon} size={16} color={color || "#6F6D6D"} />
              <p style={{ color: color || "#6F6D6D" }} className=" text-sm">
                {" "}
                {label}
              </p>
            </button>
          ))}
        </div>
      </div>
      <div className="md:flex grid grid-cols-2 flex-wrap my-7 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-foreground h-[165px] md:max-w-[210px] w-full p-4 rounded-[32px] flex flex-col justify-between gap-y-2"
          >
            <div className="rounded-full p-2 bg-primary-accent w-fit">
              <HugeiconsIcon icon={stat.icon} size={24} color={"#6932E2"} />
            </div>
            <div>
              {stat.ratings ? (
                <div className="flex items-center gap-x-1">
                  <HugeiconsIcon
                    icon={StarIcon}
                    size={22}
                    fill="#9E76F8"
                    color={"#9E76F8"}
                  />

                  <p className="text-2xl text-primary-text font-bold">
                    {stat.ratings}
                  </p>

                  <p className="text-2xl text-primary-text">({stat.value})</p>
                </div>
              ) : (
                <p className="text-2xl text-primary-text font-bold">
                  {stat.value}
                </p>
              )}

              <h3 className="text-secondary-text text-lg">{stat.title}</h3>
            </div>
          </div>
        ))}
      </div>
      <ContainerWrapper className="space-y-5">
        <div>
          {" "}
          <h2 className="font-bold text-primary-text mb-1">Description</h2>
          <p>
            {data?.description || "No description available for this item."}
          </p>
        </div>
        <div>
          <h2 className="font-bold text-primary-text mb-1">Tags</h2>
          {data?.tags && data.tags.length > 0 ? (
            <div className="flex items-center gap-x-2">
              {data?.tags.map((item) => (
                <div
                  key={item}
                  className="border border-neutral-accent rounded-lg w-fit py-0.5 px-1.5"
                >
                  <p className="text-sm capitalize">{item}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm">No tags available for this item.</p>
          )}
        </div>
        <div>
          <h2 className="font-bold text-primary-text mb-1">Category</h2>
          <p>
            {data?.category?.name || "No category available for this item."}
          </p>
        </div>
        <div>
          <h2 className="font-bold text-primary-text mb-1">Brand</h2>
          <p>{data?.brand || "No brand available for this item."}</p>
          <div className="md:flex grid grid-cols-2 gap-5 mt-4 items-center flex-wrap">
            {data?.media?.map((img, index) => (
              <div
                key={index}
                className="w-full h-[150px] md:w-[253px] md:h-[206px] rounded-lg overflow-hidden"
              >
                <Image
                  src={img}
                  width={253}
                  height={206}
                  alt="Images"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-bold text-primary-text mb-1">Variants</h2>
          {data?.variant ? (
            <p>
              {Object.keys(data.variant)
                .map(
                  (key) =>
                    `${capitalizeFirstLetter(key)} (${
                      data.variant
                        ? capitalizeFirstLetter(
                            data.variant[key as keyof typeof data.variant]
                          )
                        : ""
                    })`
                )
                .join(", ")}
            </p>
          ) : (
            <p>No variants available</p>
          )}
        </div>
      </ContainerWrapper>
      <div className="mt-5 lg:mt-9 grid lg:grid-cols-[454px_1fr] gap-4">
        <ContainerWrapper>
          <div className="bg-[#D9EDFF] py-3 px-3 rounded-2xl">
            <h2 className="font-bold text-lg text-primary-text">
              Stock Inventory
            </h2>
          </div>
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold text-primary-text mb-1">Current Stock</h2>
            <p>200 Plates</p>
          </div>
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold text-primary-text mb-1">Reorder Alert</h2>
            <p>Trigger alert below 20 plates</p>
          </div>
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold text-primary-text mb-1">Supplier</h2>
            <p>In-house Kitchen</p>
          </div>
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold text-primary-text mb-1">
              Inventory Activity Log
            </h2>
            <button
              onClick={() => setShowlogs((prev) => !prev)}
              className="bg-background-light p-1 rounded-full"
            >
              <ChevronDown size={15} />
            </button>
          </div>
          {showlogs &&
            [
              { action: "+30 added by Manager", date: "Oct 25 10:11" },
              { action: "-16 sold", date: "Oct 25 10:11" },
              { action: "+40 restocked", date: "Oct 25 10:11" },
              { action: "+30 added by Manager", date: "Oct 25 10:11" },
            ].map((log, index) => (
              <div
                key={index}
                className="flex items-center border-l-[1.5px] border-secondary-text pl-1.5 justify-between mt-1.5 mb-2 w-full"
              >
                <p>{log.action}</p>
                <p>{log.date}</p>
              </div>
            ))}
        </ContainerWrapper>
        <ContainerWrapper className="text-primary-text">
          <div className="bg-[#DDF6E2]  py-3 px-3 rounded-2xl">
            <h2 className="font-bold text-lg">Pricing and Discounts</h2>
          </div>
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1">Base Price</h2>
            <p>N16,000</p>
          </div>
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1">Cost Price</h2>
            <p>N3,250</p>
          </div>
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1">Active Deal</h2>
            <p>Sunday Buffet Special (10% Off) </p>
          </div>
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1">VAT</h2>
            <p>7.5% Applied </p>
          </div>
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1">Price History</h2>
            <button
              onClick={() => setShowPrices((prev) => !prev)}
              className="bg-background-light p-1 rounded-full"
            >
              <ChevronDown size={15} />
            </button>
          </div>
          {showPrices &&
            [{ action: "N8,000 to 16,000", date: "Oct 25 10:11" }].map(
              (log, index) => (
                <div
                  key={index}
                  className="flex items-center text-secondary-text justify-between my-2 w-full"
                >
                  <p>{log.action}</p>
                  <p>{log.date}</p>
                </div>
              )
            )}
        </ContainerWrapper>
      </div>
      <div className="mt-5 lg:mt-9 grid lg:grid-cols-[1fr_294px] gap-4">
        <ContainerWrapper>
          <div className="bg-[#F6DDDD] py-3 px-3 rounded-2xl">
            <h2 className="font-bold text-lg text-primary-text">
              Sales and Performance
            </h2>
          </div>
          <InventoryChart />
        </ContainerWrapper>
        <ContainerWrapper className="text-primary-text h-fit">
          <div className="bg-[#F6E9DD]  py-3 px-3 rounded-2xl">
            <h2 className="font-bold text-lg">Related Items</h2>
          </div>
          <div className="space-y-3 mt-3">
            {[
              {
                name: "Fried Rice and Chicken",
                img: "/item.jpg",
                id: "SKU: 00146",
              },
              {
                name: "Fried Rice and Turkey",
                img: "/item.jpg",
                id: "SKU: 00146",
              },
              {
                name: "Ofada Rice with Sauce",
                img: "/item.jpg",
                id: "SKU: 00146",
              },
            ].map((item, index) => (
              <Item key={index} item={item} />
            ))}
          </div>
        </ContainerWrapper>
      </div>
      <InventoryItemTable />
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
