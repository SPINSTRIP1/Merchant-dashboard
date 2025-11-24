import ContainerWrapper from "@/components/container-wrapper";
import { ChevronRight } from "lucide-react";
import React from "react";

export default function PerformingDeals() {
  return (
    <div className="space-y-4">
      <ContainerWrapper className=" h-fit">
        <div className="bg-[#DDF6E2]  py-3 px-3 rounded-2xl">
          <h2 className="font-bold text-lg text-primary-text">
            Top Performing Deals
          </h2>
        </div>
        <div className="space-y-3 mt-3">
          {[
            {
              title: "Sunday Buffet Special",
              percentageIncrease: "+25%",
              totalOrders: 243,
            },
            {
              title: "Sunday Buffet Special",
              percentageIncrease: "+25%",
              totalOrders: 243,
            },
            {
              title: "Sunday Buffet Special",
              percentageIncrease: "+25%",
              totalOrders: 243,
            },
            {
              title: "Sunday Buffet Special",
              percentageIncrease: "+25%",
              totalOrders: 243,
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between w-full"
            >
              <div>
                <h2 className="font-bold text-primary-text">{item.title}</h2>
                <div className="flex gap-x-1">
                  <p className="text-sm">{item.totalOrders} Orders</p>
                  <p className="text-[#34C759] mt-px font-semibold text-xxs">
                    {item.percentageIncrease} Today
                  </p>
                </div>
              </div>
              <button className="w-5 h-5 flex items-center justify-center bg-neutral-accent rounded-full hover:bg-gray-200 transition-colors duration-200">
                <ChevronRight size={16} className="text-secondary-text" />
              </button>
            </div>
          ))}
        </div>
      </ContainerWrapper>
      <ContainerWrapper className=" h-fit">
        <div className="bg-[#F6DDDD]  py-3 px-3 rounded-2xl">
          <h2 className="font-bold text-lg text-primary-text">
            Poor Performing Deals
          </h2>
        </div>
        <div className="space-y-3 mt-3">
          {[
            {
              title: "Sunday Buffet Special",
              percentageIncrease: "-25%",
              totalOrders: 243,
            },
            {
              title: "Sunday Buffet Special",
              percentageIncrease: "-25%",
              totalOrders: 243,
            },
            {
              title: "Sunday Buffet Special",
              percentageIncrease: "-25%",
              totalOrders: 243,
            },
            {
              title: "Sunday Buffet Special",
              percentageIncrease: "-25%",
              totalOrders: 243,
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between w-full"
            >
              <div>
                <h2 className="font-bold text-primary-text">{item.title}</h2>
                <div className="flex gap-x-1">
                  <p className="text-sm">{item.totalOrders} Orders</p>
                  <p className="text-[#FF383C] mt-px font-semibold text-xxs">
                    {item.percentageIncrease} Today
                  </p>
                </div>
              </div>
              <button className="w-5 h-5 flex items-center justify-center bg-neutral-accent rounded-full hover:bg-gray-200 transition-colors duration-200">
                <ChevronRight size={16} className="text-secondary-text" />
              </button>
            </div>
          ))}
        </div>
      </ContainerWrapper>
    </div>
  );
}
