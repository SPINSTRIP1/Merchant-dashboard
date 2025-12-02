import React from "react";
import { ItemCardProps } from "../_types";
import ItemCard from "./item-card";
import Dropdown from "@/components/dropdown";
import { months } from "@/constants";
import EmptyState from "@/components/empty-state";
import { TrendingUp } from "lucide-react";

export default function TopMenus() {
  const topMenus: ItemCardProps[] = [];
  return (
    <div className="lg:max-w-[267px] w-full">
      <Dropdown header="Top Menus" placeholder="July" options={months} />
      {topMenus.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="h-16 w-16 text-primary" />}
          title="No Top Menus"
          description="No top-performing menus for this period. Check back later!"
          className="py-8"
        />
      ) : (
        topMenus.map((menu, index) => <ItemCard key={index} {...menu} />)
      )}
    </div>
  );
}
