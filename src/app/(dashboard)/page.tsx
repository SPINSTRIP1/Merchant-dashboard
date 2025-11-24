"use client";
import { AlignBoxTopLeftIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import RevenueChart from "./_components/revenue-chart";
import OverviewChart from "./_components/overview-chart";
import OrdersTable from "./_components/order-table";
import TopMenus from "./_components/top-menus";
import RecentMessages from "./_components/recent-messages";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/settings/compliance");
  }, [router]);
  const stats = [
    {
      title: "Orders",
      value: 2463,
    },
    {
      title: "Menu",
      value: 2463,
    },
    {
      title: "Revenue",
      value: 2463,
    },
    {
      title: "Messages",
      value: 2463,
    },
    {
      title: "Deals",
      value: 2463,
    },
    {
      title: "Reviews",
      value: 2463,
    },
  ];
  return (
    <div className="flex flex-col lg:flex-row gap-x-5">
      {/* Stats Grid */}
      <div className="mb-5 flex-1">
        <div className="grid md:grid-cols-3 mb-5 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="bg-foreground h-[165px] p-4 rounded-[32px] flex flex-col justify-between gap-y-2"
            >
              <div className="rounded-full p-2 bg-primary-accent w-fit">
                <HugeiconsIcon
                  icon={AlignBoxTopLeftIcon}
                  size={24}
                  color={"#6932E2"}
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
        <RevenueChart />
        <OverviewChart />
        <OrdersTable />
      </div>
      <div className="min-w-[269px]">
        <TopMenus />
        <RecentMessages />
      </div>
    </div>
  );
}
