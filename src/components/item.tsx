import Image from "next/image";
import React from "react";

export default function Item({
  item,
}: {
  item: { img?: string; name: string; id: string };
}) {
  return (
    <div className="flex items-center">
      <div className="w-12 h-12 bg-gray-300 rounded-2xl overflow-hidden flex items-center justify-center mr-2">
        {item.img ? (
          <Image
            src={item.img}
            className="w-full object-cover h-full"
            width={40}
            height={40}
            alt="avatar"
          />
        ) : null}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-primary-text">{item.name}</p>
        <p className="text-xs">{item.id}</p>
      </div>
    </div>
  );
}
