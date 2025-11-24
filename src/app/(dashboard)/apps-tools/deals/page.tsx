"use client";
import {
  CancelCircleIcon,
  DeliveryBox01Icon,
  DiscountTag02Icon,
  InformationDiamondIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import DealsTable from "./_components/deals-table";

export default function Deals() {
  const stats = [
    {
      title: "Total Deals",
      value: 53,
      icon: DiscountTag02Icon,
      textColor: "#6932E2",
      bgColor: "#EBE2FF",
    },
    {
      title: "Active Deals",
      value: 2463,
      icon: DeliveryBox01Icon,
      textColor: "#34C759",
      bgColor: "#DDF6E2",
    },
    {
      title: "Inactive Deals",
      value: 2463,
      icon: InformationDiamondIcon,
      textColor: "#FF8D28",
      bgColor: "#F6E9DD",
    },
    {
      title: "Canceled Deals",
      value: 2463,
      icon: CancelCircleIcon,
      textColor: "#FF383C",
      bgColor: "#F6DDDD",
    },
  ];

  return (
    <div>
      <div className="flex justify-between flex-wrap mb-5 gap-4">
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
      <DealsTable />
    </div>
  );
}
