"use client";

import React, { useId, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutGroup, motion } from "framer-motion";
import { LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigationSections, type NavItem } from "@/constants/sidebar";
import { useReduxAuth } from "@/hooks/use-redux-auth";
import { useReduxApps } from "@/hooks/use-redux-apps";
import { usePermissions } from "@/hooks/use-permissions";

export const getInitials = (fullName?: string) => {
  if (!fullName) return "U";
  return fullName
    .split(" ")
    .filter(Boolean)
    .map((name) => name.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const matches = (pathName: string, href: string) =>
  href === "/" ? pathName === "/" : pathName === href || pathName.startsWith(href + "/");

/**
 * Shared sidebar body used by both the desktop `Sidebar` and the `MobileSidebar` drawer.
 * Pass `onNavigate` to run something after a link is clicked (the mobile drawer closes itself)
 * and `onClose` to show a close button in the header.
 */
export default function SidebarContent({
  onNavigate,
  onClose,
}: {
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const pathName = usePathname();
  const { user, logout } = useReduxAuth();
  const { activeApps } = useReduxApps();
  const { can, isOwner, roleLabel } = usePermissions();
  // Desktop and mobile sidebars are mounted together; keep their sliding indicators separate.
  const layoutGroupId = useId();

  const sections = useMemo(() => {
    const activeAppKeys = new Set<string>(activeApps.map((app) => app.key));
    const visible = (item: NavItem) =>
      (!item.ownerOnly || isOwner) &&
      (!item.permission || can(item.permission)) &&
      (!item.app || activeAppKeys.has(item.app));

    return navigationSections
      .map((section) => ({ ...section, items: section.items.filter(visible) }))
      .filter((section) => section.items.length > 0);
  }, [activeApps, can, isOwner]);

  // The most specific matching link wins, so /apps-tools/menu highlights "Menu", not "Apps & Tools".
  const activeHref = useMemo(
    () =>
      sections
        .flatMap((section) => section.items.map((item) => item.href))
        .filter((href) => matches(pathName, href))
        .sort((a, b) => b.length - a.length)[0],
    [sections, pathName]
  );

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 shrink-0 items-center justify-between px-6">
        <Link href="/" onClick={onNavigate} aria-label="SpinStrip home">
          <Image
            src="/logo.svg"
            alt="SpinStrip"
            className="h-[34px] w-[88px]"
            width={88}
            height={34}
            priority
          />
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4 pt-2" aria-label="Main">
        <LayoutGroup id={layoutGroupId}>
          {sections.map((section) => (
            <div key={section.title} className="mt-4 first:mt-0">
              <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {section.title}
              </p>
              <ul className="flex flex-col gap-1">
                {section.items.map((item) => {
                  const isActive = item.href === activeHref;
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-2xl p-1.5 pr-3 text-sm transition-colors duration-200",
                          isActive
                            ? "font-semibold text-primary"
                            : "font-medium text-sidebar-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {/* The highlight glides between items as you navigate */}
                        {isActive && (
                          <motion.span
                            layoutId="nav-active-pill"
                            className="absolute inset-0 rounded-2xl bg-primary-accent"
                            transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          />
                        )}
                        <span
                          className={cn(
                            "relative grid h-8 w-8 shrink-0 place-items-center rounded-xl transition-colors duration-200",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                              : "bg-muted text-muted-foreground group-hover:bg-card group-hover:text-primary"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="relative truncate">{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </LayoutGroup>
      </nav>

      <div className="shrink-0 border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 px-1">
          {user?.profilePicture ? (
            // eslint-disable-next-line @next/next/no-img-element -- avatar host may not be in next.config images.domains
            <img src={user.profilePicture} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary">
              {getInitials(user?.fullName)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{user?.fullName}</p>
            <p className="truncate text-[11px] text-muted-foreground">{user?.email}</p>
          </div>
          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            {roleLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={logout}
          className="mt-3 flex min-h-[42px] w-full items-center gap-3 rounded-xl px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-500"
        >
          <LogOut className="h-[18px] w-[18px]" /> Log Out
        </button>
      </div>
    </div>
  );
}
