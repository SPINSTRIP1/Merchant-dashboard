"use client";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import { useCallback, useState } from "react";
import MobileSidebar from "@/components/mobile-sidebar";
import ComplianceBanner from "@/components/compliance-banner";
import PermissionGate from "@/components/permission-gate";
import Providers from "./providers";
import { useMe } from "@/hooks/use-me";

// Keeps the stored user and capability flags in sync with GET /auth/me.
function AccountSync() {
  useMe();
  return null;
}

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
      <AccountSync />
      <div className="min-h-screen bg-background">
        <Sidebar />
        <MobileSidebar isOpen={isOpen} toggle={toggle} />

        <div className="flex min-h-screen min-w-0 flex-col lg:pl-64">
          <Navbar toggle={toggle} />
          <main className="flex-1 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:px-8 md:py-8">
            <div className="mx-auto w-full max-w-[1440px]">
              <ComplianceBanner />
              <PermissionGate>{children}</PermissionGate>
            </div>
          </main>
        </div>
      </div>
    </Providers>
  );
}
