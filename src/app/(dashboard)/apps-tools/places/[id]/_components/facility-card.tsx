import { formatAmount } from "@/utils";
import React from "react";

interface FacilityCardProps {
  title: string;
  imgUrl: string;
  description: string;
  facilityType: string;
  accessType: string;
  price: number;
}

export default function FacilityCard({
  title,
  imgUrl,
  description,
  facilityType,
  accessType,
  price,
}: FacilityCardProps) {
  return (
    <div className="space-y-1.5">
      <img
        src={imgUrl}
        alt={title}
        width={400}
        height={250}
        className="w-full h-[140px] object-cover rounded-xl"
      />
      <h3 className="font-semibold text-base text-primary-text">{title}</h3>
      <p>{description}</p>

      <div className="flex items-center justify-between w-full">
        <h2 className="font-bold mb-1 text-primary-text">Facility Type</h2>
        <p>{facilityType}</p>
      </div>
      <div className="flex items-center justify-between w-full">
        <h2 className="font-bold mb-1 text-primary-text capitalize">Access</h2>
        <p className="capitalize">{accessType}</p>
      </div>
      <div className="flex items-center justify-between w-full">
        <h2 className="font-bold mb-1 text-primary-text">Price</h2>
        <p>{formatAmount(price)}</p>
      </div>
    </div>
  );
}
