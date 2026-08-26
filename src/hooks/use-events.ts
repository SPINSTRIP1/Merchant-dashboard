import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { Event } from "@/app/(dashboard)/apps-tools/event-planner/_schemas";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

export interface EventStatsResponse {
  total: number;
  active: number;
  inactive: number;
  upcoming: number;
  past: number;
}

export interface PublicTicketTier {
  id: string;
  name: string;
  description: string;
  price: number;
  quantityAvailable: number;
}

export interface PublicEvent {
  id: string;
  name: string;
  description: string;
  city: string;
  state: string;
  country: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  startDate: string;
  endDate: string;
  timezone: string;
  frequency: "ONE_OFF" | "RECURRING";
  recurringPattern: string | null;
  customRecurrenceDays: number | null;
  images: string[];
  videos: string[] | null;
  expectedGuests: number;
  soldOutThreshold: number;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  isFeatured: boolean;
  impressions: number;
  totalImpressions: number;
  totalRegistrations: number;
  ticketTiers: PublicTicketTier[];
  userId: string;
  placeId: string | null;
  dealId: string | null;
  formId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * Fetches a single event (with ticket tiers, impressions and sales
 * breakdown) from `GET /events/{id}`.
 */
export function useEvent(eventId: string | null | undefined) {
  const { data, isLoading, error, refetch } = useQuery<Event | null>({
    queryKey: ["single-event", eventId],
    queryFn: async () => {
      try {
        const response = await api.get(`${SERVER_URL}/events/${eventId}`);
        return response.data.data ?? null;
      } catch (error) {
        console.log("Error fetching event:", error);
        return null;
      }
    },
    enabled: !!eventId,
  });

  return {
    event: data ?? null,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Fetches the merchant's event counts (total/active/inactive/upcoming/past)
 * from `GET /events/stats`.
 */
export function useEventStats() {
  const { data, isLoading, error, refetch } = useQuery<EventStatsResponse>({
    queryKey: ["events-stats"],
    queryFn: async () => {
      try {
        const response = await api.get(SERVER_URL + "/events/stats");
        return response.data.data as EventStatsResponse;
      } catch (error) {
        console.log("Error fetching event stats:", error);
        toast.error("Failed to fetch event statistics.");
        return { total: 0, active: 0, inactive: 0, upcoming: 0, past: 0 };
      }
    },
  });

  return {
    stats: data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Fetches a public event (unauthenticated preview/checkout pages)
 * from `GET /events/public/{id}`.
 */
export function usePublicEvent(eventId: string | null | undefined) {
  const { data, isLoading, error, refetch } = useQuery<PublicEvent | null>({
    queryKey: ["public-event", eventId],
    queryFn: async () => {
      try {
        const response = await api.get(
          `${SERVER_URL}/events/public/${eventId}`,
        );
        return response.data.data ?? null;
      } catch (error) {
        console.log("Error fetching public event:", error);
        return null;
      }
    },
    enabled: !!eventId,
  });

  return {
    event: data ?? null,
    isLoading,
    error,
    refetch,
  };
}
