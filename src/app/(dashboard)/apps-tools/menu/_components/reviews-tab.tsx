"use client";

import ReviewsList from "@/components/reviews-list";

/** Reviews guests left after a paid order (`GET /menu/reviews`), newest first, 20 per page. */
export default function ReviewsTab() {
  return (
    <ReviewsList
      source="menu"
      emptyDescription="Guests can review your restaurant after a paid order. Their ratings and comments show up here."
    />
  );
}
