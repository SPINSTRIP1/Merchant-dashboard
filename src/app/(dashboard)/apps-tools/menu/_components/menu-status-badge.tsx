import React from "react";
import { MenuStatus } from "../_schemas";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export default function MenuStatusBadge({
  status,
  onStatusChange,
  menuId,
}: {
  status: MenuStatus;
  onStatusChange?: (menuId: string, newStatus: MenuStatus) => void;
  menuId?: string;
}) {
  const statusColors: Record<MenuStatus, string> = {
    AVAILABLE: "text-[#34C759] bg-[#34C75926]",
    PENDING: "text-[#FF8D28] bg-[#F6E9DD]",
    UNAVAILABLE: "text-[#FF383C] bg-[#C7343426]",
    DRAFT: "text-gray-500 bg-gray-100",
  };

  const statusOptions: { label: string; value: MenuStatus }[] = [
    { label: "AVAILABLE", value: "AVAILABLE" },
    { label: "PENDING", value: "PENDING" },
    { label: "OUT OF STOCK", value: "UNAVAILABLE" },
    // { label: "DRAFT", value: "DRAFT" },
  ];

  const handleStatusChange = (e: React.MouseEvent, newStatus: MenuStatus) => {
    e.stopPropagation();
    if (onStatusChange && menuId) {
      onStatusChange(menuId, newStatus);
    }
  };

  if (!onStatusChange || !menuId) {
    // Read-only mode
    return (
      <div
        className={`${
          statusColors[status] || statusColors["AVAILABLE"]
        } w-[80px] flex items-center justify-center py-1 rounded-lg`}
      >
        <p className="font-semibold uppercase text-xxs">
          {status === "UNAVAILABLE" ? "OUT OF STOCK" : status}
        </p>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onClick={(e) => e.stopPropagation()}
        className="outline-none"
      >
        <div
          className={`${
            statusColors[status] || statusColors["AVAILABLE"]
          } min-w-[100px] flex items-center justify-center gap-1 py-1 px-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity`}
        >
          <p className="font-semibold uppercase text-xxs">
            {status === "UNAVAILABLE" ? "OUT OF STOCK" : status}
          </p>
          <ChevronDown size={12} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[130px] py-2 px-1 bg-neutral border rounded-2xl shadow-none border-neutral-accent"
        onClick={(e) => e.stopPropagation()}
      >
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={(e) => handleStatusChange(e, option.value)}
            className="flex items-center cursor-pointer gap-2 text-xs"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                option.value === "AVAILABLE"
                  ? "bg-[#34C759]"
                  : option.value === "PENDING"
                  ? "bg-[#FF8D28]"
                  : option.value === "UNAVAILABLE"
                  ? "bg-[#FF383C]"
                  : "bg-gray-500"
              }`}
            />
            <span className="text-secondary-text">{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
