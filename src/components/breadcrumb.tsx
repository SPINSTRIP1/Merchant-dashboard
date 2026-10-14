import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/** "‹ Parent | Current" trail shown above a page header. */
export default function Breadcrumb({
  parent,
  current,
}: {
  parent: { label: string; href: string };
  current: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
      <Link
        href={parent.href}
        className="inline-flex min-h-[32px] items-center gap-1 font-medium transition-colors hover:text-primary"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        {parent.label}
      </Link>
      <span className="text-border">|</span>
      <span className="font-semibold text-foreground" aria-current="page">
        {current}
      </span>
    </nav>
  );
}
