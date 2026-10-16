"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTopMenus } from "@/hooks/use-menu";
import { formatNaira } from "@/utils";

/** Last 12 months as { value: "YYYY-MM", label: "October 2026" }, newest first. */
function monthOptions() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return {
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-NG", { month: "long", year: "numeric" }),
    };
  });
}

export default function TopMenusCard() {
  const months = useMemo(monthOptions, []);
  const [month, setMonth] = useState(months[0].value);
  const { topMenus, isLoading } = useTopMenus({ month });

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-display text-sm font-bold text-foreground">Top Menus</h3>
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="h-8 w-[140px] rounded-full text-[11px] font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9" />
          ))}
        </div>
      ) : topMenus.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <UtensilsCrossed className="h-6 w-6 text-muted-foreground/50" />
          <p className="text-xs font-semibold text-muted-foreground">No Top Menus</p>
          <p className="max-w-[220px] text-[11px] text-muted-foreground">
            Available menu items will be ranked here by orders.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {topMenus.map((item, i) => (
            <li key={item.id} className="flex items-center gap-2.5">
              <span className="w-4 text-center font-display text-xs font-bold text-primary">{i + 1}</span>
              {item.image ? (
                <Image src={item.image} alt="" width={36} height={36} className="h-9 w-9 rounded-lg object-cover" />
              ) : (
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <UtensilsCrossed className="h-3.5 w-3.5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">{item.name}</p>
                <p className="text-[10px] text-muted-foreground">{item.orderCount} sold</p>
              </div>
              <span className="text-xs font-bold text-foreground">{formatNaira(item.price, true)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
