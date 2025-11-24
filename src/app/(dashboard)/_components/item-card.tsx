import React from "react";
import { ItemCardProps } from "../_types";
import { Star } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShoppingCart01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

export default function ItemCard({
  imgUrl,
  title,
  type,
  price,
  quantity,
  rating,
}: ItemCardProps) {
  return (
    <div className="border mb-4 text-xs bg-foreground p-4 rounded-3xl">
      <img
        src={imgUrl}
        alt={title}
        className="w-full h-[125px] object-cover rounded-md"
      />
      <h2 className="font-bold text-primary-text text-base mt-2">{title}</h2>
      <p className="text-xs text-gray-500">{type}</p>
      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-x-2">
          <div className="flex items-center gap-x-1">
            <Star size={16} />
            <p>{rating}</p>
          </div>
          <div className="flex items-center gap-x-1">
            <HugeiconsIcon
              icon={ShoppingCart01Icon}
              size={16}
              color={"#6F6D6D"}
            />
            <p>{quantity}</p>
          </div>
        </div>
        <p className="text-primary-text text-base font-bold">{price}</p>
      </div>
      <Button className="w-full mt-3">Edit Menu</Button>
    </div>
  );
}
