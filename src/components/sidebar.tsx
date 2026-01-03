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
import { ChevronDown, ChevronUp, Plus } from "lucide-react";

// Redux imports
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

// Optimized sub-components
const UserAvatar = memo(({ fullName }: { fullName?: string }) => {
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

UserAvatar.displayName = "UserAvatar";

const AppChildren = memo(
  ({
    activeApps,
    pathName,
    isVisible,
  }: {
    activeApps: AppItem[];
    pathName: string;
    isVisible: boolean;
  }) => {
    if (!isVisible || !activeApps?.length) return null;

    return (
      <>
        {activeApps.map((item) => (
          <Link
            key={item.name}
            href={item.route}
            className={cn(
              "flex items-center gap-x-1 ml-10 my-0.5",
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

AppChildren.displayName = "AppChildren";

const NavigationItem = memo(
  ({
    link,
    pathName,
    activeApps,
    toggleDropdown,
    onToggleDropdown,
  }: {
    link: NavigationLink;
    pathName: string;
    activeApps: AppItem[];
    toggleDropdown: boolean;
    onToggleDropdown: () => void;
  }) => {
    const isCurrentPage =
      pathName === link.href || pathName.startsWith(link.href + "/");
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
          "flex items-center gap-x-2 mb-1.5 p-3.5 hover:bg-[#EBE2FF] hover:text-primary rounded-full text-secondary-text transition-colors duration-300 ease-in-out group",
          isCurrentPage ? "bg-[#EBE2FF] text-primary" : "text-secondary-text"
        ),
      [isCurrentPage]
    );

    return (
      <li>
        <div className={linkClass}>
          <Link
            href={link.comingSoon ? "#" : link.href}
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

        <AppChildren
          activeApps={activeApps}
          pathName={pathName}
          isVisible={showChildren}
        />
      </li>
    );
  }
);

NavigationItem.displayName = "NavigationItem";

const UserProfile = memo(
  ({ user, onLogout }: { user: UserData | null; onLogout: () => void }) => (
    <div>
      {/* User Info */}
      <div className="flex items-center mb-4">
        <UserAvatar fullName={user?.fullName} />

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
        className="w-full flex items-center my-3"
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

UserProfile.displayName = "UserProfile";

export default function Sidebar() {
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

  return (
    <section className="hidden lg:block fixed left-0 top-0 min-h-[924px] h-full max-h-[1024px] 2xl:max-h-screen">
      <div className="bg-[#F8F8F8] min-w-[262px] px-6 max-w-[262px] h-full border-r border-gray-300 shadow-md flex flex-col  w-64">
        {/* Logo/Brand Section */}
        <Link href="/" className="p-6 w-full flex items-center justify-center">
          <Image
            src="/logo.svg"
            alt="Spinstrip Logo"
            className="w-[88px] h-[34px]"
            width={100}
            height={34}
            priority
          />
        </Link>

        {/* Navigation Links */}
        <nav className="flex-1 mt-10 py-6">
          <ul className="space-y-2">
            {navigationLinks.map((link) => (
              <NavigationItem
                key={link.name}
                link={link}
                pathName={pathName}
                activeApps={activeApps}
                toggleDropdown={toggleDropdown}
                onToggleDropdown={handleToggleDropdown}
              />
            ))}
          </ul>
        </nav>

        {/* User Profile Section */}
        <UserProfile user={user} onLogout={handleLogout} />
      </div>
    </section>
  );
}
