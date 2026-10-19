"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryLabel, useFeaturedMenuItems } from "@/hooks/use-menu";
import { formatAmount } from "@/utils";
import { Menu } from "../_schemas";
import { cn } from "@/lib/utils";

export default function FeaturedMenus({
  onDeleteClick,
  onEditClick,
  className,
}: {
  onDeleteClick: (menu: Menu) => void;
  onEditClick: (menu: Menu) => void;
  /** Lets the parent size the card; the list scrolls when the card is shorter than its content. */
  className?: string;
}) {
  const { items, isLoading } = useFeaturedMenuItems();

  return (
    <div className={cn("flex flex-col rounded-2xl border bg-card p-4", className)}>
      <h3 className="mb-3 flex items-center justify-between font-display text-sm font-bold text-foreground">
        Featured Menus
        {items.length > 0 && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            {items.length}
          </span>
        )}
      </h3>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Star className="h-6 w-6 text-muted-foreground/50" />
          <p className="text-xs font-semibold text-muted-foreground">
            No Featured Menus
          </p>
          <p className="max-w-[220px] text-[11px] text-muted-foreground">
            Mark an item as featured in the Add Menu wizard to pin it here.
          </p>
        </div>
      ) : (
        // Fills the rest of the card; scrolls only when the card is height-limited (xl, next to the table).
        <div className="-mr-2 min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-2">
          {items.map((menu) => (
            <div key={menu.id} className="overflow-hidden rounded-2xl border">
              {menu.images?.[0] && (
                <div className="relative h-28">
                  <Image
                    src={menu.images[0]}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">
                      {menu.name}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      {categoryLabel(menu.category)}
                    </p>
                  </div>
                  <p className="font-display text-sm font-bold text-primary">
                    {formatAmount(menu.price)}
                  </p>
                </div>
                <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />{" "}
                  {menu.rating ?? 0}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEditClick(menu)}
                    className="brand-gradient min-h-[36px] flex-1 rounded-full text-[11px] font-semibold text-white"
                  >
                    Edit Item
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteClick(menu)}
                    className="min-h-[36px] flex-1 rounded-full border border-rose-500/40 text-[11px] font-semibold text-rose-500 hover:bg-rose-500/10"
                  >
                    Remove Item
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
