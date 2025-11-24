import ContainerWrapper from "@/components/container-wrapper";
import Dropdown from "@/components/dropdown";
import PaginationButton from "@/components/pagination-button";
import SearchBar from "@/components/search-bar";
import {
  ArrowRight02Icon,
  Chart03Icon,
  Delete02Icon,
  Edit02Icon,
  PlusSignSquareIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronRight, X } from "lucide-react";
import React, { useState } from "react";
import PerformingDeals from "./perfoming-deals";
import Link from "next/link";
import DealsModal from "./modals/deals-modal";
import SuccessModal from "./modals/success-modal";
import DeleteModal from "./modals/delete-modal";
import DeactivateModal from "./modals/deactivate-modal";
import InsightsModal from "./modals/insights-modal";

export interface DealItem {
  title: string;
  description: string;
  percentageIncrease: string;
}
export const deals: DealItem[] = [
  {
    title: "Sunday Buffet Special",
    description:
      "A special deal for sunday lovers to unwind, unleash and enjoy good food, affordable price and serene atmosphere in the companny of friends, family and loved onens.",
    percentageIncrease: "+25% Today",
  },
  {
    title: "Sunday Buffet Special",
    description:
      "A special deal for sunday lovers to unwind, unleash and enjoy good food, affordable price and serene atmosphere in the companny of friends, family and loved onens.",
    percentageIncrease: "+25% Today",
  },
  {
    title: "Sunday Buffet Special",
    description:
      "A special deal for sunday lovers to unwind, unleash and enjoy good food, affordable price and serene atmosphere in the companny of friends, family and loved onens.",
    percentageIncrease: "+25% Today",
  },
];

export default function DealsTable() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [action, setAction] = useState<
    "add" | "edit" | "delete" | "deactivate" | "insights" | null
  >(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Calculate pagination values
  const totalItems = deals.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = deals.slice(startIndex, endIndex);
  return (
    <section className="grid gap-5 grid-cols-[1fr_293px]">
      <div>
        <div className="flex flex-col md:flex-row md:items-center flex-wrap gap-y-3 justify-between w-full">
          <h1 className="text-sm lg:text-base font-bold">Deals</h1>
          <SearchBar
            placeholder="Search deals"
            className="bg-[#F3F3F3]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex items-center gap-x-2">
            <Dropdown header="" options={["All", "Some"]} placeholder="All" />
            <Dropdown
              header=""
              options={["All", "Some"]}
              placeholder="Sort by"
            />
          </div>
          <div className="flex justify-end w-full lg:w-fit items-center gap-x-2">
            <button
              onClick={() => setAction("add")}
              className="rounded-2xl bg-primary h-12 md:h-10 text-white flex justify-center items-center gap-2 px-4"
            >
              <HugeiconsIcon
                icon={PlusSignSquareIcon}
                size={24}
                color="#FFFFFF"
              />
              <p className="font-normal">Create Deal</p>
            </button>
            <Link
              href={"/apps-tools/deals/archives"}
              className="rounded-2xl bg-primary-accent h-12 md:h-10 text-primary flex justify-center items-center gap-2 px-4"
            >
              <p className="font-normal">Archives</p>
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={24}
                color="#6932E2"
              />
            </Link>
          </div>
        </div>
        {currentItems.map((deal, index) => (
          <ContainerWrapper key={index} className="mt-5">
            <div className="flex gap-x-4 justify-between mb-3 w-full">
              <div className="flex-shrink-0">
                <h2 className="font-bold text-primary-text">{deal.title}</h2>
                <p className="text-[#34C759] text-xs">
                  {deal.percentageIncrease}
                </p>
              </div>
              <p className="max-w-[435px] w-full">{deal.description}</p>
              <button
                onClick={() =>
                  setSelectedIndex((prev) => (prev === index ? null : index))
                }
                className="min-w-6 min-h-6 max-h-6 max-w-6 flex items-center justify-center bg-neutral-accent rounded-full hover:bg-gray-200 transition-colors duration-200"
              >
                <ChevronRight size={20} className="text-secondary-text" />
              </button>
            </div>
            <div className="flex justify-between w-full">
              <div className="flex items-center gap-x-2">
                <button
                  onClick={() => setAction("edit")}
                  className="rounded-xl bg-primary h-[35px] px-2 text-white flex justify-center items-center gap-2"
                >
                  <HugeiconsIcon icon={Edit02Icon} size={16} color="#FFFFFF" />
                  <p className="font-normal text-sm">Edit</p>
                </button>
                <button
                  onClick={() => setAction("deactivate")}
                  className="rounded-xl text-primary bg-primary-accent h-[35px] px-2 flex justify-center items-center gap-2"
                >
                  <X color="#6932E2" size={16} />
                  <p className="font-normal text-sm">Deactivate</p>
                </button>
                <button
                  onClick={() => setAction("insights")}
                  className="rounded-xl text-primary bg-primary-accent h-[35px] px-2 flex justify-center items-center gap-2"
                >
                  <HugeiconsIcon icon={Chart03Icon} color="#6932E2" size={16} />
                  <p className="font-normal text-sm">Insights</p>
                </button>
              </div>

              <button
                onClick={() => setAction("delete")}
                className="rounded-xl text-[#FF383C] bg-[#F6DDDD] h-[35px] px-2 flex justify-center items-center gap-2"
              >
                <HugeiconsIcon icon={Delete02Icon} color="#FF383C" size={16} />
                <p className="font-normal text-sm">Delete</p>
              </button>
            </div>
            {selectedIndex === index && (
              <div className="border-t mt-4">
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
                        className="border border-neutral-accent rounded-lg w-fit py-0.5 px-1"
                      >
                        <p className="text-sm">{item}</p>
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
            )}
          </ContainerWrapper>
        ))}
        <PaginationButton
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
        />
      </div>
      <PerformingDeals />
      <DealsModal
        isOpen={action === "add" || action === "edit"}
        //@ts-expect-error: there is no issue here
        action={action}
        onClose={() => setAction(null)}
        onUpdate={() => {
          setAction(null);
          setShowSuccessModal(true);
        }}
      />
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        description="Sunday Buffet Special Deal has been updated"
      />
      <DeleteModal
        isOpen={action === "delete"}
        onClose={() => setAction(null)}
        title="Sunday Buffet Special"
      />
      <DeactivateModal
        isOpen={action === "deactivate"}
        onClose={() => setAction(null)}
        title="Sunday Buffet Special"
      />

      <InsightsModal
        isOpen={action === "insights"}
        onClose={() => setAction(null)}
      />
    </section>
  );
}
