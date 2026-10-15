"use client";

import { MessageSquare, Star } from "lucide-react";
import EmptyState from "@/components/empty-state";
import SampleDataBadge from "@/components/sample-data-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlaceReviews } from "@/hooks/use-place-extras";
import { cn } from "@/lib/utils";
import { fmtDate } from "@/utils";

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
          )}
        />
      ))}
    </span>
  );
}

export default function Reviews({ placeId }: { placeId?: string }) {
  const { reviews, average, isLoading } = usePlaceReviews(placeId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <div className="rounded-2xl border bg-card">
        <EmptyState
          icon={<MessageSquare />}
          title="No reviews yet"
          description="Reviews from your public place page will appear here."
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="font-display text-2xl font-bold text-foreground">{average.toFixed(1)}</span>
        <Stars rating={average} />
        <span className="text-xs text-muted-foreground">
          {reviews.length} review{reviews.length === 1 ? "" : "s"}
        </span>
        <SampleDataBadge className="ml-auto" />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-foreground">{review.author}</p>
              <Stars rating={review.rating} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
            <p className="mt-3 text-[11px] text-muted-foreground/80">{fmtDate(review.createdAt)}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
