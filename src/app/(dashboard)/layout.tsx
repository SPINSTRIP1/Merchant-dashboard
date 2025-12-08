"use client";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import Providers from "./providers";
import { useState } from "react";
import MobileSidebar from "@/components/mobile-sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Providers>
      <div className={"flex gap-x-2"}>
        <Sidebar />
        <MobileSidebar
          isOpen={isOpen}
          toggle={() => setIsOpen((prev) => !prev)}
        />
        <div className="w-full p-3 lg:p-0 h-full">
          <Navbar toggle={() => setIsOpen((prev) => !prev)} />
          <MaxWidthWrapper className="flex-1 px-0 lg:px-2.5 !pt-0">
            {children}
          </MaxWidthWrapper>
        </div>
      </div>
    </Providers>
  );
}
