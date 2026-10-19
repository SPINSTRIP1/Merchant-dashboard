/**
 * Customer reviews of the merchant's places, events and menu. Guests post them on the public site
 * after a completed booking / ticket purchase / paid order; the dashboard lists them:
 *   GET /places/reviews?placeId=   GET /events/reviews?eventId=   GET /menu/reviews
 * Rows are `{ id, email, stars, comment, createdAt }` plus `place` / `event` `{ id, name }` — the API
 * returns no reviewer name and no average.
 */
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";

export type ReviewSource = "places" | "events" | "menu";

export interface Review {
  id: string;
  stars: number;
  comment: string | null;
  /** The reviewer's email — the API has no name. */
  email: string;
  createdAt: string | null;
  /** The place or event reviewed (absent for menu reviews). */
  subject: { id: string; name: string } | null;
}

const FILTER_PARAM: Record<ReviewSource, string | null> = { places: "placeId", events: "eventId", menu: null };

const str = (value: unknown) => (typeof value === "string" && value ? value : null);

function toReview(raw: Record<string, unknown>, index: number): Review {
  const subject = (raw.place ?? raw.event ?? null) as { id?: string; name?: string } | null;
  return {
    id: str(raw.id) ?? String(index),
    stars: Number(raw.stars) || 0,
    comment: str(raw.comment),
    email: str(raw.email) ?? "Guest",
    createdAt: str(raw.createdAt),
    subject: subject?.id ? { id: subject.id, name: subject.name ?? "" } : null,
  };
}

/** One page of reviews for a source, optionally for one place / event. */
export function useReviews({
  source,
  subjectId,
  page = 1,
  limit = 20,
  enabled = true,
}: {
  source: ReviewSource;
  /** placeId / eventId; ignored for menu. */
  subjectId?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}) {
  const filter = FILTER_PARAM[source];
  const { data, isLoading } = useQuery<{ reviews: Review[]; total: number; lastPage: number }>({
    queryKey: ["reviews", source, subjectId ?? "all", page, limit],
    queryFn: async () => {
      try {
        const response = await api.get(`${SERVER_URL}/${source}/reviews`, {
          params: { page, limit, ...(filter && subjectId ? { [filter]: subjectId } : {}) },
        });
        const body = response.data?.data ?? {};
        const rows = (body.data ?? []) as Record<string, unknown>[];
        return { reviews: rows.map(toReview), total: Number(body.count) || 0, lastPage: Number(body.lastpage) || 1 };
      } catch (error) {
        console.log(`Error fetching ${source} reviews:`, error);
        return { reviews: [], total: 0, lastPage: 1 };
      }
    },
    enabled,
    placeholderData: keepPreviousData,
  });

  return { reviews: data?.reviews ?? [], total: data?.total ?? 0, lastPage: data?.lastPage ?? 1, isLoading };
}
