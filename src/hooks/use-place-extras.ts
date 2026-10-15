/**
 * Places features from the prototype that the backend doesn't support yet. These sit alongside
 * the real places hooks in use-places.ts and never replace them: each one is SAMPLE DATA (kept in
 * localStorage via src/mocks/places.ts) until its endpoint exists, at which point only the hook
 * body here needs to change.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { mockResponse } from "@/mocks/utils";
import {
  bookingStatusOverrides,
  placeManualVisitors,
  placeTaglines,
  removedFacilities,
  sampleReviews,
  type ManualVisitor,
  type PlaceReview,
} from "@/mocks/places";
import type { Event } from "@/app/(dashboard)/apps-tools/event-planner/_schemas";

export type { ManualVisitor, PlaceReview };

// --- Taglines -------------------------------------------------------------

/** Taglines for all places, keyed by place id. SAMPLE DATA. */
export function usePlaceTaglines() {
  const { data } = useQuery<Record<string, string>>({
    queryKey: ["place-taglines"],
    queryFn: () => mockResponse(placeTaglines.all(), 0),
  });
  return data ?? {};
}

/** Saves a place's tagline. SAMPLE DATA. */
export function useSetPlaceTagline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ placeId, tagline }: { placeId: string; tagline: string }) => {
      placeTaglines.set(placeId, tagline.trim());
      return mockResponse(true, 0);
    },
    onSuccess: () => {
      toast.success("Tagline saved");
      queryClient.invalidateQueries({ queryKey: ["place-taglines"] });
    },
  });
}

// --- Facilities -------------------------------------------------------------

/** Ids of facilities removed from a place in this browser. SAMPLE DATA (no delete endpoint yet). */
export function useRemovedFacilityIds(placeId: string | undefined) {
  const { data } = useQuery<string[]>({
    queryKey: ["place-removed-facilities", placeId],
    queryFn: () => mockResponse(removedFacilities.get(placeId!) ?? [], 0),
    enabled: !!placeId,
  });
  return data ?? [];
}

/** Removes (hides) a facility from a place. SAMPLE DATA. */
export function useRemoveFacility(placeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (facilityId: string) => {
      removedFacilities.update(placeId, (ids = []) => [...new Set([...ids, facilityId])]);
      return mockResponse(true, 0);
    },
    onSuccess: () => {
      toast.success("Facility removed");
      queryClient.invalidateQueries({ queryKey: ["place-removed-facilities", placeId] });
    },
  });
}

// --- Visitors ---------------------------------------------------------------

/** Visitors added by hand for a place, newest first. SAMPLE DATA. */
export function useManualVisitors(placeId: string | undefined) {
  const { data } = useQuery<ManualVisitor[]>({
    queryKey: ["place-manual-visitors", placeId],
    queryFn: () => mockResponse(placeManualVisitors.get(placeId!) ?? [], 0),
    enabled: !!placeId,
  });
  return data ?? [];
}

/** Adds a visitor to a place by hand. SAMPLE DATA. */
export function useAddPlaceVisitor(placeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (visitor: Omit<ManualVisitor, "id" | "createdAt">) => {
      const created: ManualVisitor = {
        ...visitor,
        id: `manual_${Date.now().toString(36)}`,
        createdAt: new Date().toISOString(),
      };
      placeManualVisitors.update(placeId, (list = []) => [created, ...list]);
      return mockResponse(created, 0);
    },
    onSuccess: () => {
      toast.success("Visitor added");
      queryClient.invalidateQueries({ queryKey: ["place-manual-visitors", placeId] });
    },
  });
}

// --- Bookings ---------------------------------------------------------------

export const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/** Booking status changes made in the dashboard, keyed by booking id. SAMPLE DATA. */
export function useBookingStatusOverrides() {
  const { data } = useQuery<Record<string, string>>({
    queryKey: ["booking-status-overrides"],
    queryFn: () => mockResponse(bookingStatusOverrides.all(), 0),
  });
  return data ?? {};
}

/** Changes a booking's status. SAMPLE DATA. */
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingStatus }) => {
      bookingStatusOverrides.set(id, status);
      return mockResponse(true, 0);
    },
    onSuccess: () => {
      toast.success("Booking status updated");
      queryClient.invalidateQueries({ queryKey: ["booking-status-overrides"] });
    },
  });
}

/** Short visitor reference shown in tables, e.g. "VIS-4F07A2". */
export const visitorRef = (id: string) => `VIS-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;

// --- Reviews ------------------------------------------------------------------

/** Reviews of a place and their average rating. SAMPLE DATA. */
export function usePlaceReviews(placeId: string | undefined) {
  const { data, isLoading } = useQuery<PlaceReview[]>({
    queryKey: ["place-reviews", placeId],
    queryFn: () => mockResponse(sampleReviews(placeId!)),
    enabled: !!placeId,
  });
  const reviews = data ?? [];
  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  return { reviews, average, isLoading };
}

// --- Activities ----------------------------------------------------------------

/** The merchant's events linked to this place (`placeId`), read from `GET /events` (first 100). */
export function usePlaceEvents(placeId: string | undefined) {
  const { data, isLoading } = useQuery<Event[]>({
    queryKey: ["place-events", placeId],
    queryFn: async () => {
      try {
        const response = await api.get(`${SERVER_URL}/events`, { params: { page: 1, limit: 100 } });
        return ((response.data.data?.data ?? []) as Event[]).filter((e) => e.placeId === placeId);
      } catch (error) {
        console.log("Error fetching place events:", error);
        return [];
      }
    },
    enabled: !!placeId,
  });
  return { events: data ?? [], isLoading };
}
