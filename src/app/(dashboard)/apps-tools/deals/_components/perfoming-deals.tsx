import ContainerWrapper from "@/components/container-wrapper";
import { ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import React from "react";
import { Deal } from "../_schemas";

export default function PerformingDeals() {
  const isLoading = false;
  const deals: Deal[] = [
    // {
    //   title: "Family Feast Deal",
    //   percentageIncrease: "+30%",
    //   totalOrders: 520,
    // },
  ];

  const poorDeals: Deal[] = [];

  const renderDealsContent = (
    dealsArray: typeof deals,
    type: "top" | "poor"
  ) => {
    if (isLoading) {
      return (
        <div className="space-y-3 mt-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between w-full animate-pulse"
            >
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
            </div>
          ))}
        </div>
      );
    }

    if (dealsArray.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          {type === "top" ? (
            <TrendingUp className="w-12 h-12 text-gray-300 mb-3" />
          ) : (
            <TrendingDown className="w-12 h-12 text-gray-300 mb-3" />
          )}
          <p className="text-secondary-text text-sm">
            {type === "top"
              ? "No top performing deals yet"
              : "No poor performing deals"}
          </p>
          <p className="text-secondary-text text-xs mt-1">
            {type === "top"
              ? "Your best deals will appear here"
              : "Keep up the good work!"}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3 mt-3">
        {dealsArray.map((item, index) => (
          <div key={index} className="flex items-center justify-between w-full">
            <div>
              <h2 className="font-bold text-primary-text">{item.name}</h2>
              <div className="flex gap-x-1">
                <p className="text-sm">{item.maximumThreshold} Orders</p>
                <p
                  className={`mt-px font-semibold text-xxs ${
                    type === "top" ? "text-[#34C759]" : "text-[#FF383C]"
                  }`}
                >
                  {item.discountPercentage} Today
                </p>
              </div>
            </div>
            <button className="w-5 h-5 flex items-center justify-center bg-neutral-accent rounded-full hover:bg-gray-200 transition-colors duration-200">
              <ChevronRight size={16} className="text-secondary-text" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <ContainerWrapper className=" h-fit">
        <div className="bg-[#DDF6E2]  py-3 px-3 rounded-2xl">
          <h2 className="font-bold text-lg text-primary-text">
            Top Performing Deals
          </h2>
        </div>
        {renderDealsContent(deals, "top")}
      </ContainerWrapper>
      <ContainerWrapper className=" h-fit">
        <div className="bg-[#F6DDDD]  py-3 px-3 rounded-2xl">
          <h2 className="font-bold text-lg text-primary-text">
            Poor Performing Deals
          </h2>
        </div>
        {renderDealsContent(poorDeals, "poor")}
      </ContainerWrapper>
    </div>
  );
}
