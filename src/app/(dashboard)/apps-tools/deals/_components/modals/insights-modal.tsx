import { X } from "lucide-react";
import PerformanceChart from "../performance-chart";
import RevenueChart from "../revenue-chart";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiSheetsIcon, Download04Icon } from "@hugeicons/core-free-icons";

export default function InsightsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={
          "bg-foreground scrollbar-hide rounded-3xl p-3 lg:p-4 shadow-xl w-full max-h-[90vh] max-w-[857px] overflow-y-auto"
        }
      >
        <div className="flex gap-x-4 justify-between mb-3 w-full">
          <div className="flex-shrink-0">
            <h2 className="font-bold text-primary-text">
              Sunday Buffet Special
            </h2>
            <p className="text-[#34C759] text-xs">+25% Today</p>
          </div>
          <p className="max-w-[435px] w-full">
            A special deal for sunday lovers to unwind, unleash and enjoy good
            food, affordable price and serene atmosphere in the companny of
            friends, family and loved onens.
          </p>
          <button
            onClick={onClose}
            className="min-w-6 min-h-6 max-h-6 max-w-6 flex items-center justify-center bg-neutral-accent rounded-full hover:bg-gray-200 transition-colors duration-200"
          >
            <X size={20} className="text-secondary-text" />
          </button>
        </div>

        <div className="px-3">
          <div className="bg-[#F6DDDD] py-3 px-3 rounded-2xl">
            <h2 className="font-bold text-lg text-primary-text">Performance</h2>
          </div>
          <PerformanceChart />

          <div className="bg-[#D9EDFF] mt-12 py-3 px-3 rounded-2xl">
            <h2 className="font-bold text-lg text-primary-text">Revenue</h2>
          </div>
          <RevenueChart />
        </div>
        <div className="border-t text-sm mt-8 pt-4">
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1">Discount</h2>
            <p>10% </p>
          </div>
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1">Menu Items</h2>
            <div className="flex items-end justify-end max-w-[300px] flex-wrap gap-2">
              {[
                "Jollof Rice and Chicken",
                "Fried Rice and Chicken",
                "Asun Rice",
                "Goat Meat Pepper Soup",
              ].map((item) => (
                <div
                  key={item}
                  className="border border-neutral-accent rounded-xl w-fit py-0.5 px-1"
                >
                  <p className="text-sm text-secondary-text">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1">Validity period</h2>
            <p>15 Jan 2025 - 31 Dec 2025</p>
          </div>
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1">Maximum Threshold</h2>
            <p>500 Orders</p>
          </div>
        </div>
        <div className="flex justify-end mt-6 mb-2 gap-x-3 w-full items-center">
          <button className="rounded-2xl bg-primary h-12 md:h-10 text-white flex justify-center items-center gap-2 px-4">
            <HugeiconsIcon icon={Download04Icon} size={24} color="#FFFFFF" />
            <p className="font-normal">Download Report</p>
          </button>
          <button className="rounded-2xl bg-primary-accent h-12 md:h-10 text-white flex justify-center items-center gap-2 px-4">
            <HugeiconsIcon icon={AiSheetsIcon} size={24} color="#6932E2" />
            <p className="font-normal text-primary">Analyse with AI</p>
          </button>
        </div>
      </div>
    </div>
  );
}
