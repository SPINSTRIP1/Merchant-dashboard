"use client";

import React, { useState, useMemo, useCallback, memo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Logout02Icon,
  DashboardSquare03Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navigationLinks } from "@/constants/sidebar";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { useReduxAuth } from "@/hooks/use-redux-auth";
import { useReduxApps } from "@/hooks/use-redux-apps";
import type { UserData } from "@/store/slices/authSlice";

// Type definitions
type IconType = typeof DashboardSquare03Icon;

interface NavigationLink {
  name: string;
  href: string;
  icon: IconType;
  comingSoon: boolean;
  hasChildren?: boolean;
}

interface AppItem {
  name: string;
  route: string;
  description: string;
  isActive: boolean;
}

interface MobileSidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

// Optimized sub-components
const CloseButton = memo(({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="bg-white mx-auto mt-5 mb-6 relative overflow-hidden size-14 flex items-center justify-center rounded-full shadow-md"
    aria-label="Close sidebar"
  >
    <X size={30} color="#6932E2" className="z-[999]" />
    <Image
      src="/icons/check.svg"
      className="size-[36px] absolute opacity-60 -bottom-3 z-10 -left-3"
      width={40}
      height={40}
      alt=""
    />
  </button>
));

CloseButton.displayName = "CloseButton";

const MobileUserAvatar = memo(({ fullName }: { fullName?: string }) => {
  const initials = useMemo(() => {
    if (!fullName) return "U";
    return fullName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [fullName]);

  return (
    <div className="w-12 h-12 bg-primary-accent rounded-full overflow-hidden flex items-center justify-center mr-3">
      <span className="text-primary font-semibold text-sm">{initials}</span>
    </div>
  );
});

MobileUserAvatar.displayName = "MobileUserAvatar";

const MobileAppChildren = memo(
  ({
    activeApps,
    pathName,
    isVisible,
    onClick,
  }: {
    activeApps: AppItem[];
    pathName: string;
    isVisible: boolean;
    onClick: () => void;
  }) => {
    if (!isVisible || !activeApps?.length) return null;

    return (
      <>
        {activeApps.map((item) => (
          <Link
            key={item.name}
            href={item.route}
            onClick={onClick}
            className={cn(
              "flex items-center gap-x-1 ml-10 mb-0.5",
              pathName === item.route && "text-primary font-medium"
            )}
          >
            <Plus size={15} />
            <p className="text-base">{item.name}</p>
          </Link>
        ))}
      </>
    );
  }
);

MobileAppChildren.displayName = "MobileAppChildren";

const MobileNavigationItem = memo(
  ({
    link,
    pathName,
    activeApps,
    toggleDropdown,
    onToggleDropdown,
    handleToggleSidebar,
  }: {
    link: NavigationLink;
    pathName: string;
    activeApps: AppItem[];
    toggleDropdown: boolean;
    onToggleDropdown: () => void;
    handleToggleSidebar: () => void;
  }) => {
    const isCurrentPage = pathName === link.href;
    const hasActiveApps = activeApps?.length > 0;
    const isAppsRoute = link.href === "/apps-tools";
    const showChildren = toggleDropdown && hasActiveApps && isAppsRoute;

    const iconBgClass = useMemo(
      () =>
        cn(
          "rounded-full group-hover:bg-primary p-1.5",
          isCurrentPage ? "bg-primary" : "bg-[#F3F3F3]"
        ),
      [isCurrentPage]
    );

    const linkClass = useMemo(
      () =>
        cn(
          "flex items-center mb-2 gap-x-2 p-3.5 hover:bg-[#EBE2FF] hover:text-primary rounded-full text-secondary-text transition-colors duration-300 ease-in-out group",
          isCurrentPage ? "bg-[#EBE2FF] text-primary" : "text-secondary-text"
        ),
      [isCurrentPage]
    );

    return (
      <li>
        <div className={linkClass}>
          <Link
            href={link.comingSoon ? "#" : link.href}
            onClick={handleToggleSidebar}
            className="flex items-center gap-x-2"
          >
            <div className={iconBgClass}>
              <HugeiconsIcon
                icon={link.icon}
                size={18}
                className="group-hover:text-white"
                color={isCurrentPage ? "white" : "#6F6D6D"}
              />
            </div>
            <p>{link.name}</p>

            {link.comingSoon && (
              <div className="bg-primary-accent flex-shrink-0 border-primary text-primary border p-0.5 rounded-3xl">
                <p className="text-[9px]">Coming Soon</p>
              </div>
            )}
          </Link>

          {hasActiveApps && link.hasChildren && (
            <button
              onClick={onToggleDropdown}
              className="w-full flex items-end justify-end"
              aria-label={toggleDropdown ? "Collapse menu" : "Expand menu"}
            >
              {toggleDropdown ? <ChevronUp /> : <ChevronDown />}
            </button>
          )}
        </div>

        <MobileAppChildren
          activeApps={activeApps}
          pathName={pathName}
          isVisible={showChildren}
          onClick={handleToggleSidebar}
        />
      </li>
    );
  }
);

MobileNavigationItem.displayName = "MobileNavigationItem";

const MobileUserProfile = memo(
  ({ user, onLogout }: { user: UserData | null; onLogout: () => void }) => (
    <div className="p-2 pt-20">
      {/* User Info */}
      <div className="flex items-center mb-4">
        <MobileUserAvatar fullName={user?.fullName} />

        <div className="flex-1 min-w-0">
          <div className="rounded-3xl bg-[#FF8D2826] w-fit p-1 text-[#FF8D28]">
            <p className="text-[10px] font-semibold truncate">{user?.role}</p>
          </div>
          <p className="font-bold text-[#0F0F0F] truncate">{user?.fullName}</p>
          <p className="text-xs text-secondary-text truncate">{user?.email}</p>
        </div>
      </div>

      {/* Logout Button */}
      <button
        className="w-full mt-5 flex items-center my-3"
        onClick={onLogout}
        aria-label="Log out"
      >
        <div className="rounded-full p-1.5 bg-[#F3F3F3]">
          <HugeiconsIcon icon={Logout02Icon} size={18} color="#6F6D6D" />
        </div>
        <p className="text-secondary-text ml-2">Log Out</p>
      </button>
    </div>
  )
);

MobileUserProfile.displayName = "MobileUserProfile";

const MobileSidebar = memo(({ isOpen, toggle }: MobileSidebarProps) => {
  const pathName = usePathname();
  const { user, logout } = useReduxAuth();
  const { activeApps } = useReduxApps();
  const [toggleDropdown, setToggleDropdown] = useState(false);

  const handleToggleDropdown = useCallback(() => {
    setToggleDropdown((prev) => !prev);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const handleToggleSidebar = useCallback(() => {
    toggle();
  }, [toggle]);

  const sidebarClass = useMemo(
    () =>
      cn(
        "fixed w-[95%] max-w-[350px] lg:hidden h-screen p-5 z-50 bg-[#F8F8F8] border-r border-gray-300 shadow-md transition duration-700 ease-in-out",
        isOpen ? "-translate-x-4" : "-translate-x-[110%]"
      ),
    [isOpen]
  );

  return (
    <div className={sidebarClass}>
      <div className="h-[95%] overflow-y-auto flex flex-col justify-between scrollbar-hide">
        <div>
          <CloseButton onClick={handleToggleSidebar} />

          <Link href="/" className="m-4">
            <Image
              src="/logo.svg"
              alt="Spinstrip Logo"
              className="w-[120px] h-[64px]"
              width={120}
              height={64}
              priority
            />
          </Link>

          {/* Navigation Links */}
          <nav className="flex-1 mt-6">
            <ul className="space-y-2">
              {navigationLinks.map((link) => (
                <MobileNavigationItem
                  key={link.name}
                  link={link}
                  pathName={pathName}
                  activeApps={activeApps}
                  toggleDropdown={toggleDropdown}
                  onToggleDropdown={handleToggleDropdown}
                  handleToggleSidebar={handleToggleSidebar}
                />
              ))}
            </ul>
          </nav>
        </div>

        {/* User Profile Section */}
        <MobileUserProfile user={user} onLogout={handleLogout} />
      </div>
    </div>
  );
});

MobileSidebar.displayName = "MobileSidebar";

export default MobileSidebar;
