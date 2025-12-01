"use client";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import MenuTable from "./_components/menu-table";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

export default function MenuPage() {
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center mb-6 gap-x-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-x-2"
          >
            <ChevronLeft /> <p className="font-bold">Tools</p>
          </button>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-x-2"
          >
            <ChevronLeft /> <p className="font-bold text-primary-text">Menu</p>
          </button>
        </div>
        <Link
          href="#"
          className="flex items-center w-fit bg-primary-accent p-2 rounded-3xl gap-x-2"
        >
          <p className="text-primary line-clamp-1">Configure Tool</p>
          <div className="p-1.5 rounded-full bg-primary">
            <HugeiconsIcon icon={ArrowRight02Icon} size={16} color={"white"} />
          </div>
        </Link>
      </div>

      <MenuTable />
    </div>
  );
}
