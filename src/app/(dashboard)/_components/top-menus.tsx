import React from "react";
import { ItemCardProps } from "../_types";
import ItemCard from "./item-card";
import Dropdown from "@/components/dropdown";
import { months } from "@/constants";

export default function TopMenus() {
  const topMenus: ItemCardProps[] = [
    {
      imgUrl: "/item.jpg",
      title: "Jollof Rice and Chicken",
      type: "Special",
      price: "N5,000",
      quantity: 49,
      rating: 4.5,
    },
    {
      imgUrl: "/item-2.jpg",
      title: "Spaghetti Bolognese",
      type: "Dinner",
      price: "N5,000",
      quantity: 49,
      rating: 4.5,
    },
  ];
  return (
    <div className="w-full">
      <Dropdown header="Top Menus" placeholder="July" options={months} />
      {topMenus.map((menu, index) => (
        <ItemCard key={index} {...menu} />
      ))}
    </div>
  );
}
