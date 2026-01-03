"use client";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import Providers from "./providers";
import { useCallback, useState } from "react";
import MobileSidebar from "@/components/mobile-sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);
  return (
    <Providers>
      <div className={"flex lg:pl-64 gap-x-2"}>
        <Sidebar />
        <MobileSidebar isOpen={isOpen} toggle={toggle} />

        <MaxWidthWrapper className="flex-1 w-full h-full">
          <Navbar toggle={toggle} />
          {children}
        </MaxWidthWrapper>
      </div>
    </Providers>
  );
}
