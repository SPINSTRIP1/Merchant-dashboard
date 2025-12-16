"use client";
import { cn } from "@/lib/utils";
import {
  AddSquareIcon,
  Cash02Icon,
  ChartLineData01Icon,
  CheckListIcon,
  CircleArrowReload01Icon,
  DesertIcon,
  DrinkIcon,
  FavouriteIcon,
  MenuRestaurantIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import React, { useState } from "react";

export default function Page() {
  const stats = [
    {
      title: "Visitors",
      value: 0,
      icon: DrinkIcon,
      textColor: "#6932E2",
      bgColor: "#EBE2FF",
    },
    {
      title: "Facilities",
      value: 0,
      icon: DesertIcon,
      textColor: "#34C759",
      bgColor: "#DDF6E2",
    },
    {
      title: "Revenue",
      value: 0,
      icon: Cash02Icon,
      textColor: "#FF9500",
      bgColor: "#F6E9DD",
    },
    {
      title: "Sales",
      value: 0,
      icon: ChartLineData01Icon,
      textColor: "#FF3B30",
      bgColor: "#F6DDDD",
    },
    {
      title: "Reservations",
      value: 0,
      icon: CircleArrowReload01Icon,
      textColor: "#0088FF",
      bgColor: "#D9EDFF",
    },
  ];
  const settingsItems = [
    {
      title: "Add Event",
      icon: AddSquareIcon,
      link: "/apps-tools/event-planner",
    },
    {
      title: "Update Menu/Services",
      icon: MenuRestaurantIcon,
      link: "/apps-tools/menu",
    },
    {
      title: "Manage Reviews",
      icon: FavouriteIcon,
      link: "/apps-tools/reviews",
    },
    {
      title: "Manage Bookings",
      icon: CheckListIcon,
      link: "/apps-tools/bookings",
    },
  ] as const;
  const [selectedOption, setSelectedOption] = useState<string>("");
  return (
    <div>
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
      <h2 className="font-bold mb-5">Quicklinks</h2>
      <div className="flex flex-wrap gap-5">
        {settingsItems.map((item) => (
          <Link
            key={item.title}
            href={item.link}
            className="p-6 bg-foreground relative rounded-[32px] w-full md:min-w-[269px] md:max-w-[269px] flex flex-col items-center justify-center h-[165px] gap-2 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-primary-accent rounded-full flex items-center justify-center">
              <HugeiconsIcon icon={item.icon} size={24} color={"#6932E2"} />
            </div>
            <h3>{item.title}</h3>
          </Link>
        ))}
      </div>
      <div className="my-10  flex items-center mx-auto w-full justify-center">
        {[
          "Facility Management",
          "Visitor Management",
          "Bookings & Reservations",
          "Activities & Experiences",
          "Reviews",
        ].map((feature) => (
          <span
            onClick={() => setSelectedOption(feature)}
            key={feature}
            className={cn(
              "px-4 border-b font-bold cursor-pointer",
              selectedOption === feature
                ? "border-primary-text text-primary-text "
                : "text-neutral-accent border-neutral-accent"
            )}
          >
            {feature}
          </span>
        ))}
      </div>
    </div>
  );
}
