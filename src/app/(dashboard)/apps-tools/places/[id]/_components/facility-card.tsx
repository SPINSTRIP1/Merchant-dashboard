import { formatAmount } from "@/utils";
import Image from "next/image";
import React from "react";

interface FacilityCardProps {
  title: string;
  imgUrl: string;
  description: string;
  maxOccupancy: number;
  bedSize: string;
  pricePerNight: number;
  amenities: string[];
}

export default function FacilityCard({
  title,
  imgUrl,
  description,
  maxOccupancy,
  bedSize,
  pricePerNight,
  amenities,
}: FacilityCardProps) {
  return (
    <div className="space-y-1.5">
      <Image
        src={imgUrl}
        alt={title}
        width={400}
        height={250}
        className="w-full h-[140px] object-cover rounded-xl"
      />
      <h3 className="font-semibold text-base text-primary-text">{title}</h3>
      <p>{description}</p>

      <div className="flex items-center justify-between w-full">
        <h2 className="font-bold mb-1 text-primary-text">Max Occupancy</h2>
        <p>{maxOccupancy}</p>
      </div>
      <div className="flex items-center justify-between w-full">
        <h2 className="font-bold mb-1 text-primary-text">Bed Size</h2>
        <p>{bedSize}</p>
      </div>
      <div className="flex items-center justify-between w-full">
        <h2 className="font-bold mb-1 text-primary-text">Price per Night</h2>
        <p>{formatAmount(pricePerNight)}</p>
      </div>
      <div className="flex items-center justify-between w-full">
        <h2 className="font-bold mb-1 text-primary-text">Amenities</h2>
        <div className="flex items-end max-w-sm justify-end flex-wrap gap-2">
          {amenities.map((item) => (
            <div
              key={item}
              className="border border-neutral-accent rounded-xl w-fit py-0.5 px-1"
            >
              <p className="text-xs text-secondary-text">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
