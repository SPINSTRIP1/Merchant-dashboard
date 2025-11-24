import {
  AiSecurity03Icon,
  Cash01Icon,
  FileVerifiedIcon,
  HierarchySquare02Icon,
  JusticeScale01Icon,
  Settings04Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import React from "react";

export default function Settings() {
  const settingsItems = [
    {
      title: "Compliance",
      icon: FileVerifiedIcon,
      link: "/settings/compliance",
      comingSoon: false,
    },
    {
      title: "Preferences",
      icon: Settings04Icon,
      link: "/settings/preferences",
      comingSoon: true,
    },
    {
      title: "Security",
      icon: AiSecurity03Icon,
      link: "/settings/security",
      comingSoon: true,
    },
    {
      title: "Payments",
      icon: Cash01Icon,
      link: "/settings/payments",
      comingSoon: true,
    },
    {
      title: "Integrations",
      icon: HierarchySquare02Icon,
      link: "/settings/integrations",
      comingSoon: true,
    },
    {
      title: "Legal & Policies",
      icon: JusticeScale01Icon,
      link: "/settings/legal",
      comingSoon: true,
    },
  ] as const;
  return (
    <div className="flex flex-wrap gap-5">
      {settingsItems.map((item) => (
        <Link
          key={item.title}
          href={item.comingSoon ? "#" : item.link}
          className="p-6 bg-foreground relative rounded-[32px] w-full md:min-w-[269px] md:max-w-[269px] flex flex-col items-center justify-center h-[165px] gap-x-4 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-primary-accent rounded-full flex items-center justify-center">
            <HugeiconsIcon icon={item.icon} size={24} color={"#6932E2"} />
          </div>
          <h3>{item.title}</h3>
          {item.comingSoon && (
            <div className="bg-primary-accent absolute right-3 top-3 border-primary text-primary border p-0.5 rounded-3xl">
              <p className="text-[9px]">Coming Soon</p>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
