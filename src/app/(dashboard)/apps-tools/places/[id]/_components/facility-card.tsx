import { Building2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatAmount } from "@/utils";
import React from "react";

interface FacilityCardProps {
  title: string;
  imgUrl: string;
  description: string;
  facilityType: string;
  accessType: string;
  price: number;
  /** Shows a "Book" button (public place page). */
  onClick?: () => void;
  /** Shows a remove button on hover (dashboard). */
  onRemove?: () => void;
}

export default function FacilityCard({
  title,
  imgUrl,
  description,
  facilityType,
  accessType,
  price,
  onClick,
  onRemove,
}: FacilityCardProps) {
  const isPriced = accessType?.toUpperCase() === "PRICED";

  return (
    <div className="card-hover group relative flex flex-col overflow-hidden rounded-2xl border bg-card">
      {imgUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- facility images may come from hosts not in next.config
        <img src={imgUrl} alt={title} className="h-32 w-full object-cover" />
      ) : (
        <div className="brand-gradient-soft grid h-32 place-items-center">
          <Building2 className="h-6 w-6 text-primary/60" />
        </div>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${title}`}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-card/90 text-rose-500 opacity-0 shadow-sm transition-opacity hover:bg-card focus-visible:opacity-100 group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
      <div className="flex flex-1 flex-col p-4">
        <p className="truncate font-display font-bold text-foreground">{title}</p>
        {description && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{description}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
          {facilityType && (
            <span className="rounded-full bg-muted px-2.5 py-1 font-semibold text-muted-foreground">{facilityType}</span>
          )}
          <span
            className={cn(
              "rounded-full px-2.5 py-1 font-bold uppercase",
              isPriced
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            )}
          >
            {accessType}
          </span>
          {(isPriced || price > 0) && (
            <span className="font-display font-bold text-primary">{formatAmount(price)}</span>
          )}
        </div>
        {onClick && (
          <Button variant="brand" size="sm" className="mt-4 w-full" onClick={onClick}>
            Book
          </Button>
        )}
      </div>
    </div>
  );
}
