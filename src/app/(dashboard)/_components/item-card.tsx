import React from "react";
import { ItemCardProps } from "../_types";
import { Star, X } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit02Icon, ShoppingCart01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { formatAmount } from "@/utils";

export default function ItemCard({
  menu,
  isEditing = false,
  onDelete,
  onEdit,
}: ItemCardProps) {
  return (
    <div className="border mb-4 text-xs group hover:shadow-md transition-all duration-300 ease-in-out min-w-[267px] max-w-[267px] w-full bg-foreground p-4 rounded-3xl">
      <div className="relative h-[125px] overflow-hidden rounded-md">
        {menu.images?.[0] ? (
          <Image
            src={menu.images[0]}
            alt={menu.name}
            className="w-full h-full object-cover"
            width={600}
            height={400}
          />
        ) : (
          <div className="w-full h-full bg-gray-400" />
        )}
        <div className="bg-[#00000066] inset-0 opacity-0 group-hover:opacity-100 gap-x-4 duration-500 ease-in-out absolute flex items-center justify-center">
          <button onClick={() => onEdit?.(menu)} className="flex items-center">
            <div className="bg-[#FFFFFF99] p-2 rounded-full mr-2">
              <HugeiconsIcon icon={Edit02Icon} size={16} color={"#6F6D6D"} />
            </div>
            <p className="text-neutral-accent">Edit Item</p>
          </button>
          <button
            onClick={() => onDelete?.(menu)}
            className="flex items-center"
          >
            <div className="bg-[#FFFFFF99] p-2 rounded-full mr-2">
              <X size={16} color={"#6F6D6D"} />
            </div>
            <p className="text-neutral-accent">Remove Item</p>
          </button>
        </div>
      </div>
      <h2 className="font-bold text-primary-text text-base mt-2">
        {menu.name}
      </h2>
      <p className="text-xs text-gray-500">
        {menu.category || "Uncategorized"}
      </p>
      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-x-2">
          <div className="flex items-center gap-x-1">
            <Star size={16} />
            <p>{menu.rating || 0}</p>
          </div>
          <div className="flex items-center gap-x-1">
            <HugeiconsIcon
              icon={ShoppingCart01Icon}
              size={16}
              color={"#6F6D6D"}
            />
            <p>{menu.quantity}</p>
          </div>
        </div>
        <p className="text-primary-text text-base font-bold">
          {formatAmount(menu.price)}
        </p>
      </div>
      {isEditing && <Button className="w-full mt-3">Edit Menu</Button>}
    </div>
  );
}
