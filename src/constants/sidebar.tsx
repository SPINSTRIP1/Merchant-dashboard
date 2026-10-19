import {
  Blocks,
  CalendarDays,
  CreditCard,
  Landmark,
  LayoutGrid,
  MapPin,
  Package,
  Settings,
  ShieldCheck,
  Tag,
  Users,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { PermissionKey } from "@/lib/permissions";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  /** Permission required to see the item; omitted means every dashboard user sees it. */
  permission?: PermissionKey;
  /** Only the account owner sees it. */
  ownerOnly?: boolean;
  /** Name of the app in `apps` (src/constants) — the item is shown only while that app is on. */
  /** Key of the app (src/constants `apps`) that must be switched on for this link to show. */
  app?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigationSections: NavSection[] = [
  {
    title: "General",
    items: [
      { name: "Overview", href: "/", icon: LayoutGrid, permission: "overview" },
      { name: "Apps & Tools", href: "/apps-tools", icon: Blocks },
    ],
  },
  {
    title: "Apps",
    items: [
      {
        name: "Restaurant",
        href: "/apps-tools/menu",
        icon: UtensilsCrossed,
        permission: "menu",
        app: "menu",
      },
      {
        name: "Places",
        href: "/apps-tools/places",
        icon: MapPin,
        permission: "places",
        app: "places",
      },
      {
        name: "Events",
        href: "/apps-tools/event-planner",
        icon: CalendarDays,
        permission: "events",
        app: "events",
      },
      {
        name: "Deals",
        href: "/apps-tools/deals",
        icon: Tag,
        permission: "deals",
        app: "deals",
      },
      {
        name: "Inventory",
        href: "/apps-tools/inventory",
        icon: Package,
        permission: "inventory",
        app: "inventory",
      },
      {
        name: "Wallet",
        href: "/apps-tools/wallet",
        icon: Wallet,
        permission: "wallet",
        app: "wallet",
      },
      {
        name: "Customers",
        href: "/apps-tools/customers",
        icon: Users,
        permission: "customers",
        app: "customers",
      },
    ],
  },
  {
    title: "Business",
    items: [
      {
        name: "Settlement",
        href: "/settlement",
        icon: Landmark,
        permission: "settlement",
      },
      {
        name: "Billing",
        href: "/billing",
        icon: CreditCard,
        permission: "billing",
      },
      {
        name: "Admin & Roles",
        href: "/admin",
        icon: ShieldCheck,
        ownerOnly: true,
      },
      {
        name: "Settings",
        href: "/settings",
        icon: Settings,
        permission: "settings",
      },
    ],
  },
];
