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
import InventoryModal from "../_components/inventory-modal";

export default function InventoryItem() {
  const stats = [
    {
      title: "Total Sales",
      value: 53,
      icon: DiscountTag02Icon,
    },
    {
      title: "Stock Quantity",
      value: 63,
      icon: ArrangeByNumbers19Icon,
    },
    {
      title: "Current Price",
      value: 2463,
      icon: CoinsDollarIcon,
    },
    {
      title: "Avg. Rating",
      value: 3201,
      icon: StarIcon,
      ratings: 4.2,
    },
    {
      title: "Total Views",
      value: 2463,
      icon: EyeIcon,
    },
  ];
  const router = useRouter();
  const params = useSearchParams();
  const itemId = params.get("id");
  const [showlogs, setShowlogs] = useState(false);
  const [showPrices, setShowPrices] = useState(false);
  const [action, setAction] = useState<"add" | "edit" | null>(null);
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
          <p className="font-bold text-primary-text">{itemId}</p>
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-x-5 md:items-center gap-y-4 justify-between">
        <div className="flex gap-x-2.5">
          <Item item={{ name: itemId!, id: "SKU: 00145", img: "/item.jpg" }} />
          <div
            className={`${statusColors["In Stock"]} h-fit w-[80px] flex items-center justify-center py-1 rounded-lg`}
          >
            <p className="font-semibold uppercase text-xxs">{"In Stock"}</p>
          </div>
        </div>
        <div className="flex flex-wrap item-center gap-3">
          {[
            {
              icon: Edit02Icon,
              label: "Edit Item",
              onClick: () => setAction("edit"),
            },
            {
              icon: Copy01Icon,
              label: "Duplicate Item",
              onClick: () => {},
            },
            {
              icon: Exchange01Icon,
              label: "Restock Item",
              onClick: () => {},
            },
            {
              icon: EyeIcon,
              label: "Hide/Archive Item",
              onClick: () => {},
            },
            {
              icon: Delete02Icon,
              label: "Delete Item",
              color: "#FF5F57",
              onClick: () => {},
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
            Fluffy long-grain rice simmered in rich tomato, pepper & spice
            blend, served with a touch of smoky flavor. Smoky, flavorful Jollof
            rice cooked in rich tomato sauce, served with tender grilled chicken
            and fried plantains. A classic West African dish that brings bold
            taste and comfort in every bite.
          </p>
        </div>
        <div>
          <h2 className="font-bold text-primary-text mb-1">Tags</h2>
          <div className="flex items-center gap-x-2">
            {["🔥 Bestseller", "Jollof", "Spicy", "Chicken"].map((item) => (
              <div
                key={item}
                className="border border-neutral-accent rounded-lg w-fit py-0.5 px-1"
              >
                <p className="text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-bold text-primary-text mb-1">Category</h2>
          <p>Meals, Lunch</p>
        </div>
        <div>
          <h2 className="font-bold text-primary-text mb-1">Brand</h2>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gray-300 rounded-full overflow-hidden flex items-center justify-center mr-1.5">
              <Image
                src={"/item-2.jpg"}
                className="w-full object-cover h-full"
                width={40}
                height={40}
                alt="avatar"
              />
            </div>

            <p className="text-sm">Canton Cuisine</p>
          </div>
          <div className="md:flex grid grid-cols-2 gap-5 mt-4 items-center flex-wrap">
            {["/item-2.jpg", "/item.jpg", "/item-2.jpg", "/item.jpg"].map(
              (img, index) => (
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
              )
            )}
          </div>
        </div>
        <div>
          <h2 className="font-bold text-primary-text mb-1">Variants</h2>
          <p>Regular (N16,000), Large Portion (N24,000)</p>
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
        isOpen={action !== null}
        action="edit"
        onClose={() => setAction(null)}
      />
    </div>
  );
}
