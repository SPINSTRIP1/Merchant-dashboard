"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  ChevronDown,
  ClipboardList,
  Headset,
  LogOut,
  Menu as MenuIcon,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useReduxAuth } from "@/hooks/use-redux-auth";
import { useReduxApps } from "@/hooks/use-redux-apps";
import { usePermissions } from "@/hooks/use-permissions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/components/sidebar-content";
import ThemeToggle from "@/components/theme-toggle";

const iconButton =
  "grid h-11 w-11 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

/** Sticky top bar: mobile menu toggle, quick actions and the account menu. */
export default function Navbar({ toggle }: { toggle: () => void }) {
  const { user, logout } = useReduxAuth();
  const { activeApps } = useReduxApps();
  const { can, isOwner, roleLabel } = usePermissions();
  const showOrders = can("menu") && activeApps.some((app) => app.name === "Menu");

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-lg">
      <div className="flex h-16 items-center gap-2 px-4 md:px-8">
        <button type="button" onClick={toggle} className={`${iconButton} lg:hidden`} aria-label="Open menu">
          <MenuIcon className="h-5 w-5" />
        </button>
        <Link href="/" className="lg:hidden" aria-label="SpinStrip home">
          <Image src="/logo.svg" alt="SpinStrip" width={76} height={30} className="h-[30px] w-[76px]" />
        </Link>

        <div className="ml-auto flex items-center gap-1.5">
          {showOrders && (
            <Link href="/apps-tools/menu" className={`${iconButton} hidden sm:grid`} aria-label="Orders" title="Orders">
              <ClipboardList className="h-5 w-5" />
            </Link>
          )}

          <ThemeToggle />

          <Popover>
            <PopoverTrigger className={iconButton} aria-label="Notifications" title="Notifications">
              <Bell className="h-5 w-5" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 rounded-2xl p-0">
              <p className="border-b px-4 py-3 font-display text-sm font-bold text-foreground">Notifications</p>
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">
                  <Bell className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-foreground">You&apos;re all caught up</p>
                <p className="text-xs text-muted-foreground">
                  New orders, bookings and settlements will show up here.
                </p>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger className={`${iconButton} hidden sm:grid`} aria-label="Support" title="Support">
              <Headset className="h-5 w-5" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 rounded-2xl p-4">
              <p className="font-display text-sm font-bold text-foreground">Need help?</p>
              <p className="mt-1 text-xs text-muted-foreground">
                In-app support chat is coming soon.
              </p>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger className="ml-1 flex items-center gap-2.5 rounded-full border bg-card py-1.5 pl-1.5 pr-3 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                {getInitials(user?.fullName)}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block max-w-[140px] truncate text-xs font-semibold leading-tight text-foreground">
                  {user?.fullName?.split(" ")[0]}
                </span>
                <span className="block text-[10px] leading-tight text-muted-foreground">{roleLabel}</span>
              </span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuLabel className="font-normal">
                <p className="truncate text-sm font-semibold text-foreground">{user?.fullName}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {can("settings") && (
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>
              )}
              {isOwner && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="cursor-pointer">
                    <ShieldCheck className="mr-2 h-4 w-4" /> Admin & Roles
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-rose-500 focus:text-rose-500">
                <LogOut className="mr-2 h-4 w-4" /> Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
