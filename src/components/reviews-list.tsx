"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import EmptyState from "@/components/empty-state";
import PaginationButton from "@/components/pagination-button";
import Stars from "@/components/stars";
import { Skeleton } from "@/components/ui/skeleton";
import { useReviews, type ReviewSource } from "@/hooks/use-reviews";
import { fmtDate } from "@/utils";

/** Paged list of customer reviews (places, events or menu), newest first, exactly as the API returns them. */
export default function ReviewsList({
  source,
  subjectId,
  emptyDescription,
  limit = 20,
}: {
  source: ReviewSource;
  /** placeId / eventId; omit for menu. */
  subjectId?: string;
  emptyDescription: string;
  limit?: number;
}) {
  const [page, setPage] = useState(1);
  const { reviews, total, lastPage, isLoading } = useReviews({ source, subjectId, page, limit });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="rounded-2xl border bg-card">
        <EmptyState icon={<MessageSquare />} title="No reviews yet" description={emptyDescription} />
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        {total.toLocaleString()} review{total === 1 ? "" : "s"} from customers.
      </p>
      <ul className="space-y-3">
        {reviews.map((review, i) => (
          <motion.li
            key={review.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 10) * 0.03 }}
            className="rounded-2xl border bg-card p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="min-w-0 truncate text-sm font-semibold text-foreground">{review.email}</p>
              <span className="flex items-center gap-2">
                <Stars rating={review.stars} />
                <span className="text-xs font-semibold text-muted-foreground">{review.stars}/5</span>
              </span>
            </div>
            {review.comment && <p className="mt-1.5 text-sm text-muted-foreground">{review.comment}</p>}
            {review.createdAt && <p className="mt-2 text-[11px] text-muted-foreground/80">{fmtDate(review.createdAt)}</p>}
          </motion.li>
        ))}
      </ul>
      {lastPage > 1 && (
        <div className="mt-4 rounded-2xl border bg-card">
          <PaginationButton currentPage={page} totalPages={lastPage} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
