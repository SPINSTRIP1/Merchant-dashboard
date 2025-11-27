"use client";
import {
  ArrowRight02Icon,
  CustomerSupportIcon,
  Menu02Icon,
  NotificationSquareIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React from "react";
import Link from "next/link";
import { ComplianceStatus } from "@/types";
import { useComplianceStatus } from "@/hooks/use-compliance";
import { cn } from "@/lib/utils";
import { useReduxAuth } from "@/hooks/use-redux-auth";
import StatusBadge from "./status-badge";

export default function Navbar({ toggle }: { toggle: () => void }) {
  const { data, isLoading } = useComplianceStatus();
  const status: ComplianceStatus = data || "UNVERIFIED";
  const user = useReduxAuth().user;

  return (
    <nav className="w-full max-w-[1440px] mx-auto mb-10 bg-foreground rounded-[32px] p-4 lg:p-6">
      <div className="flex items-center lg:items-end justify-between lg:justify-end w-full">
        {/* <div className="bg-[#E0E0E0] h-[35px] border border-[#C8C8C8] flex-shrink-0 w-full flex items-end gap-x-1.5 px-1 py-1.5 rounded-3xl max-w-[370px]">
          <Search className="text-[#6F6D6D]" strokeWidth={1.2} />
          <input
            placeholder="Search anything"
            className="bg-transparent outline-none placeholder:text-secondary-text text-base h-auto w-full"
          />
        </div> */}
        <button onClick={toggle} className="lg:hidden">
          <HugeiconsIcon icon={Menu02Icon} size={24} color={"#6F6D6D"} />
        </button>
        <div className="flex items-center gap-x-5">
          <HugeiconsIcon
            icon={NotificationSquareIcon}
            size={24}
            color={"#6F6D6D"}
          />
          {/* <HugeiconsIcon icon={Settings04Icon} size={24} color={"#6F6D6D"} /> */}
          <HugeiconsIcon
            icon={CustomerSupportIcon}
            size={24}
            color={"#6F6D6D"}
          />
          <div className="flex lg:ml-2 items-center">
            <div className="size-10 lg:size-12 bg-primary-accent rounded-full overflow-hidden flex items-center justify-center mr-1.5 lg:mr-3">
              <span className="text-primary font-semibold text-sm">
                {user?.fullName
                  ?.split(" ")
                  .map((name: string) => name.charAt(0))
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              {/* <p className="text-xs text-secondary-text">Hello</p> */}
              <p className="font-bold text-sm lg:text-base text-[#0F0F0F]">
                {user?.fullName}
              </p>
              <p className="text-xs text-secondary-text">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-y-4 lg:items-center gap-x-5 mt-6 justify-between">
        <div className="flex items-center justify-between gap-x-2">
          <h2 className="text-[#0F0F0F]">Compliance Status</h2>
          {isLoading ? <p>Fetching...</p> : <StatusBadge status={status} />}
        </div>
        <div className="max-w-[383px] 2xl:max-w-[453px] w-full h-1.5 rounded-2xl bg-primary-accent">
          <div
            className={cn(
              "h-full bg-primary rounded-2xl",
              status === "REJECTED"
                ? "w-1/4"
                : status === "PENDING"
                ? "w-2/4"
                : "w-full"
            )}
          />
        </div>
        {(status === "REJECTED" ||
          status === "PENDING" ||
          status === "UNVERIFIED") && (
          <Link
            href="/settings/compliance"
            className="flex items-center w-fit bg-primary-accent p-2 rounded-3xl gap-x-2"
          >
            <p className="text-primary line-clamp-1">
              {status === "REJECTED"
                ? "Retry Compliance"
                : status === "PENDING"
                ? "Review Compliance Results"
                : "Complete Compliance"}
            </p>
            <div className="p-1.5 rounded-full bg-primary">
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={16}
                color={"white"}
              />
            </div>
          </Link>
        )}
      </div>
    </nav>
  );
}
