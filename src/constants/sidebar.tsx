import {
  Briefcase01Icon,
  CreditCardIcon,
  DashboardSquare03Icon,
  DashboardSquareAddIcon,
  GearsIcon,
} from "@hugeicons/core-free-icons";

export const navigationLinks = [
  {
    name: "Overview",
    href: "/",
    icon: DashboardSquare03Icon,
    comingSoon: true,
  },
  {
    name: "Billing",
    href: "/billing",
    icon: CreditCardIcon,
    comingSoon: true,
  },
  {
    name: "Apps/Tools",
    href: "/apps-tools",
    icon: DashboardSquareAddIcon,
    comingSoon: false,
    hasChildren: true,
  },

  {
    name: "Admin",
    href: "/admin",
    icon: Briefcase01Icon,
    comingSoon: true,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: GearsIcon,
    comingSoon: false,
  },
];
