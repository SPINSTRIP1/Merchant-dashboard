import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function RecentMessages() {
  return (
    <div className="mt-5">
      <div className="flex mb-3 justify-between w-full items-center">
        <h2 className="font-bold text-primary-text text-sm">Recent Messages</h2>
        <Link href={"/"} className="flex text-xs items-center gap-x-1">
          {" "}
          See More <ChevronRight size={16} />
        </Link>
      </div>
      <div className="bg-foreground rounded-2xl px-4 pb-4 pt-2">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="flex py-3 border-b last:border-b-0 justify-between items-end w-full"
          >
            <div className="w-12 h-12 relative">
              <Image
                src={"/avatar.jpg"}
                alt={"Message 1"}
                width={40}
                height={40}
                className="rounded-full w-full h-full object-cover"
              />
              <div className="w-4 h-4 absolute bottom-0 right-0 bg-[#07DA4D] border-2 border-white rounded-full" />
            </div>
            <div>
              <h3 className="font-bold text-primary-text">Tobey Shang</h3>
              <p className="text-sm text-secondary-text">
                Check out this place
              </p>
            </div>
            <div>
              <div className="bg-[#9E76F8] px-1 py-0.5 rounded-md">
                <p className="text-xs text-white">100</p>
              </div>
              <p className="text-[10px]">19:20</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
