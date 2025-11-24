"use client";
import ContainerWrapper from "@/components/container-wrapper";
import Dropdown from "@/components/dropdown";
import PaginationButton from "@/components/pagination-button";
import SearchBar from "@/components/search-bar";
import {
  Chart03Icon,
  Delete02Icon,
  Exchange01Icon,
  PlusSignSquareIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { deals } from "../_components/deals-table";
import { useRouter } from "next/navigation";

export default function Archives() {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
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
    <section>
      <div className="flex items-center mb-6 gap-x-2">
        <button
          onClick={() => router.push("/apps-tools")}
          className="flex items-center gap-x-2"
        >
          <ChevronLeft /> <p className="font-bold">Tools</p>
        </button>
        <button
          onClick={() => router.push("/apps-tools/deals")}
          className="flex items-center gap-x-2"
        >
          <ChevronLeft /> <p className="font-bold">Deals</p>
        </button>
        <button className="flex items-center gap-x-2">
          <ChevronLeft />{" "}
          <p className="font-bold text-primary-text">Archives</p>
        </button>
      </div>
      <div className="flex flex-col md:flex-row md:items-center flex-wrap gap-y-3 justify-between w-full">
        <h1 className="text-sm lg:text-base font-bold">Deals Archives</h1>
        <SearchBar
          placeholder="Search deals"
          className="bg-[#F3F3F3]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex items-center gap-x-2">
          <Dropdown header="" options={["All", "Some"]} placeholder="All" />
          <Dropdown header="" options={["All", "Some"]} placeholder="Sort by" />
        </div>

        <button className="rounded-2xl bg-primary h-12 md:h-10 text-white flex justify-center items-center gap-2 px-4">
          <HugeiconsIcon icon={PlusSignSquareIcon} size={24} color="#FFFFFF" />
          <p className="font-normal">Create Deal</p>
        </button>
      </div>
      {currentItems.map((deal, index) => (
        <ContainerWrapper key={index} className="mt-5">
          <div className="flex justify-between gap-x-4 mb-3 w-full">
            <div>
              <h2 className="font-bold text-primary-text">{deal.title}</h2>
              <p className="text-[#34C759] text-xs">
                {deal.percentageIncrease}
              </p>
            </div>
            <p className="max-w-[435px] w-full">{deal.description}</p>
            <button className="w-6 h-6 flex items-center justify-center bg-neutral-accent rounded-full hover:bg-gray-200 transition-colors duration-200">
              <ChevronRight size={20} className="text-secondary-text" />
            </button>
          </div>
          <div className="flex justify-between w-full">
            <div className="flex items-center gap-x-2">
              <button className="rounded-xl text-primary bg-primary-accent h-[35px] px-2 flex justify-center items-center gap-2">
                <HugeiconsIcon
                  icon={Exchange01Icon}
                  color="#6932E2"
                  size={16}
                />

                <p className="font-normal text-sm">Reactivate</p>
              </button>
              <button
                onClick={() =>
                  setSelectedIndex((prev) => (prev === index ? null : index))
                }
                className="rounded-xl text-primary bg-primary-accent h-[35px] px-2 flex justify-center items-center gap-2"
              >
                <HugeiconsIcon icon={Chart03Icon} color="#6932E2" size={16} />
                <p className="font-normal text-sm">Insights</p>
              </button>
            </div>

            <button className="rounded-xl text-[#FF383C] bg-[#F6DDDD] h-[35px] px-2 flex justify-center items-center gap-2">
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
    </section>
  );
}
