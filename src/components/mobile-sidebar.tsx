"use client";

import { memo, useEffect } from "react";
import { cn } from "@/lib/utils";
import SidebarContent from "@/components/sidebar-content";

interface MobileSidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const MobileSidebar = memo(({ isOpen, toggle }: MobileSidebarProps) => {
  // Lock page scroll and close on Escape while the drawer is open
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") toggle();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, toggle]);

  return (
    <div
      className={cn("fixed inset-0 z-50 lg:hidden", !isOpen && "pointer-events-none")}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <div
        onClick={toggle}
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "absolute inset-y-0 left-0 w-[85%] max-w-[300px] overflow-hidden rounded-r-3xl shadow-2xl transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent onNavigate={toggle} onClose={toggle} />
      </aside>
    </div>
  );
});

MobileSidebar.displayName = "MobileSidebar";

export default MobileSidebar;
