"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Blocks, CreditCard, FileCheck, Scale, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export const SETTINGS_SECTIONS = [
  {
    title: "Compliance",
    description: "Verify your business to unlock payouts and public pages.",
    href: "/settings/compliance",
    icon: FileCheck,
  },
  {
    title: "Preferences",
    description: "Notifications, summaries and auto-settlement.",
    href: "/settings/preferences",
    icon: SlidersHorizontal,
  },
  {
    title: "Security",
    description: "Password and sign-in protection.",
    href: "/settings/security",
    icon: ShieldCheck,
  },
  {
    title: "Payments",
    description: "Settlement bank accounts for your payouts.",
    href: "/settings/payments",
    icon: CreditCard,
  },
  {
    title: "Integrations",
    description: "Apps, POS, accounting tools and API access.",
    href: "/settings/integrations",
    icon: Blocks,
  },
  {
    title: "Legal & Policies",
    description: "Merchant agreement, privacy and platform terms.",
    href: "/settings/legal",
    icon: Scale,
  },
] as const;

/** Pill tabs across the settings sub-pages (hidden on the /settings hub itself). */
export default function SettingsNav() {
  const pathname = usePathname();
  if (pathname === "/settings") return null;

  return (
    <nav
      aria-label="Settings sections"
      className="no-scrollbar mb-6 flex gap-1 overflow-x-auto rounded-full bg-muted/60 p-1"
    >
      {SETTINGS_SECTIONS.map(({ title, href, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-full px-4 text-xs font-semibold transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" /> {title}
          </Link>
        );
      })}
    </nav>
  );
}
