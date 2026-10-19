"use client";

import ReviewsList from "@/components/reviews-list";

/** Reviews guests left for this place after a visit or completed booking (`GET /places/reviews?placeId=`). */
export default function Reviews({ placeId }: { placeId?: string }) {
  if (!placeId) return null;
  return (
    <ReviewsList
      source="places"
      subjectId={placeId}
      emptyDescription="Guests can review this place on your public page after a visit or a completed booking."
    />
  );
}
