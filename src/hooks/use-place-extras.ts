/**
 * Places features added with the prototype port. They sit alongside the original places hooks in
 * use-places.ts and never replace them. Most use the Places service endpoints (through the gateway);
 * taglines (this browser) and reviews (src/mocks/places.ts) are still SAMPLE until the API supports them.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { handleAxiosError } from "@/lib/api/handle-axios-error";
import { createPersistentMap, mockResponse } from "@/mocks/utils";
import { sampleReviews, type PlaceReview } from "@/mocks/places";
import type { Event } from "@/app/(dashboard)/apps-tools/event-planner/_schemas";

export type { PlaceReview };

const errorMessage = (error: unknown) => handleAxiosError(error as AxiosError);

// --- Taglines -------------------------------------------------------------

/**
 * Place taglines. The API has no tagline field and `PATCH /places/{id}` ignores `metadata`
 * (verified on staging, 2026-10-15), so taglines are saved in this browser — SAMPLE until the
 * backend stores them. A `metadata.tagline` from the API wins if it ever appears.
 */
const taglineStore = createPersistentMap<string>("spinstrip:place-taglines");

export const placeTagline = (place: { id?: string; metadata?: unknown } | null | undefined) => {
  const fromApi = (place?.metadata as Record<string, unknown> | null | undefined)?.tagline;
  if (typeof fromApi === "string" && fromApi) return fromApi;
  return place?.id ? taglineStore.get(place.id) ?? "" : "";
};

/** Saves a place's tagline on this device. SAMPLE (see above). */
export function useSetPlaceTagline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ placeId, tagline }: { placeId: string; metadata?: unknown; tagline: string }) => {
      taglineStore.set(placeId, tagline.trim());
    },
    onSuccess: (_, { placeId }) => {
      toast.success("Tagline saved on this device");
      queryClient.invalidateQueries({ queryKey: ["single-place", placeId] });
      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
  });
}

// --- Publishing ---------------------------------------------------------------

/** Sends a draft or rejected place for SpinStrip's approval (`POST /places/{id}/publish`). */
export function useSubmitPlaceForReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (placeId: string) => {
      try {
        await api.post(`${SERVER_URL}/places/${placeId}/publish`);
      } catch (error) {
        throw new Error(errorMessage(error));
      }
    },
    onSuccess: (_, placeId) => {
      toast.success("Sent to SpinStrip for review");
      queryClient.invalidateQueries({ queryKey: ["single-place", placeId] });
      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

// --- Facilities -------------------------------------------------------------

/** Deletes a facility (`DELETE /places/facilities/{id}`, a soft delete). */
export function useRemoveFacility(placeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (facilityId: string) => {
      try {
        await api.delete(`${SERVER_URL}/places/facilities/${facilityId}`);
      } catch (error) {
        throw new Error(errorMessage(error));
      }
    },
    onSuccess: () => {
      toast.success("Facility removed");
      queryClient.invalidateQueries({ queryKey: ["place-facility", placeId] });
      queryClient.invalidateQueries({ queryKey: ["single-place", placeId] });
    },
    onError: (error) => toast.error(error.message),
  });
}

// --- Visitors ---------------------------------------------------------------

export interface NewVisitor {
  visitorName: string;
  visitorEmail: string;
  visitorPhone?: string;
  purpose?: string;
}

/** Records a walk-in visitor (`POST /places/{id}/visit`); they then appear in the visitors list. */
export function useAddPlaceVisitor(placeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (visitor: NewVisitor) => {
      const body = Object.fromEntries(Object.entries(visitor).filter(([, v]) => typeof v === "string" && v.trim()));
      try {
        const response = await api.post(`${SERVER_URL}/places/${placeId}/visit`, body);
        return response.data?.data;
      } catch (error) {
        throw new Error(errorMessage(error));
      }
    },
    onSuccess: () => {
      toast.success("Visitor added");
      queryClient.invalidateQueries({ queryKey: ["places-visitors", placeId] });
    },
    onError: (error) => toast.error(error.message),
  });
}

// --- Bookings ---------------------------------------------------------------

export const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/** Changes a booking's status (`PATCH /places/appointments/{id}`). */
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingStatus }) => {
      try {
        await api.patch(`${SERVER_URL}/places/appointments/${id}`, { status });
      } catch (error) {
        throw new Error(errorMessage(error));
      }
    },
    onSuccess: () => {
      toast.success("Booking status updated");
      queryClient.invalidateQueries({ queryKey: ["places-bookings"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

// --- Appointments (merchant-scheduled) ------------------------------------------

export interface PlaceAppointment {
  id: string;
  placeId: string;
  facilityId: string;
  feeId: string;
  appointmentType: string;
  scheduledDate: string;
  endDate: string | null;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  purpose: string;
  notes: string;
  status: string;
}

/**
 * A place's appointments (`GET /places/{id}/appointments`). This endpoint returns
 * `{ appointments, pagination: { page, limit, total, totalPages } }`, not the usual paginated shape.
 */
export function usePlaceAppointments({
  placeId,
  page = 1,
  status = "",
  search = "",
}: {
  placeId: string | undefined;
  page?: number;
  status?: string;
  search?: string;
}) {
  const { data, isLoading } = useQuery<{ items: PlaceAppointment[]; totalPages: number }>({
    queryKey: ["places-bookings", placeId, page, status, search],
    queryFn: async () => {
      try {
        const response = await api.get(`${SERVER_URL}/places/${placeId}/appointments`, {
          params: { page, limit: 20, ...(status && { status }), ...(search && { search }) },
        });
        const body = response.data?.data ?? {};
        const items = (body.appointments ?? body.data ?? []) as PlaceAppointment[];
        return { items, totalPages: Number(body.pagination?.totalPages ?? body.lastpage) || 1 };
      } catch (error) {
        console.log("Error fetching appointments:", error);
        return { items: [], totalPages: 1 };
      }
    },
    enabled: !!placeId,
  });
  return { items: data?.items ?? [], totalPages: data?.totalPages ?? 1, isLoading };
}

/** Cancels an appointment (`DELETE /places/appointments/{id}`). */
export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.delete(`${SERVER_URL}/places/appointments/${id}`);
      } catch (error) {
        throw new Error(errorMessage(error));
      }
    },
    onSuccess: () => {
      toast.success("Appointment cancelled");
      queryClient.invalidateQueries({ queryKey: ["places-bookings"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

// --- Customer bookings (from the public site) ---------------------------------------

export const CUSTOMER_BOOKING_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "REFUNDED"] as const;

export interface CustomerBooking {
  id: string;
  facilityId: string;
  checkInDate: string;
  checkOutDate: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  paymentMethod: string;
  totalAmount: string;
  status: string;
  transactionRef: string | null;
  createdAt: string;
  facility?: { id: string; name: string; facilityCategory?: string } | null;
  fee?: { id: string; name: string; amount: string } | null;
}

/**
 * Facility bookings customers made (and paid for) on the public site
 * (`GET /places/{placeId}/bookings`, owner only).
 */
export function usePlaceBookings({
  placeId,
  page = 1,
  status = "",
}: {
  placeId: string | undefined;
  page?: number;
  status?: string;
}) {
  const { data, isLoading } = useQuery<{ items: CustomerBooking[]; totalPages: number; total: number }>({
    queryKey: ["place-customer-bookings", placeId, page, status],
    queryFn: async () => {
      try {
        const response = await api.get(`${SERVER_URL}/places/${placeId}/bookings`, {
          params: { page, limit: 20, ...(status && { status }) },
        });
        const body = response.data?.data ?? {};
        return {
          items: (body.data ?? []) as CustomerBooking[],
          totalPages: Number(body.lastpage) || 1,
          total: Number(body.count) || 0,
        };
      } catch (error) {
        console.log("Error fetching place bookings:", error);
        return { items: [], totalPages: 1, total: 0 };
      }
    },
    enabled: !!placeId,
  });
  return { items: data?.items ?? [], totalPages: data?.totalPages ?? 1, total: data?.total ?? 0, isLoading };
}

/** Cancels a customer's booking (`DELETE /places/bookings/{id}`). */
export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.delete(`${SERVER_URL}/places/bookings/${id}`);
      } catch (error) {
        throw new Error(errorMessage(error));
      }
    },
    onSuccess: () => {
      toast.success("Booking cancelled");
      queryClient.invalidateQueries({ queryKey: ["place-customer-bookings"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

/** Short visitor reference shown in tables, e.g. "VIS-4F07A2". */
export const visitorRef = (id: string) => `VIS-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;

// --- Reviews ------------------------------------------------------------------

/** Reviews of a place and their average rating. SAMPLE DATA (no reviews endpoint yet). */
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
