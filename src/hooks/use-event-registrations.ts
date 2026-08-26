import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { useQuery } from "@tanstack/react-query";

export interface RegistrationTicketTier {
  id: string;
  name: string;
  price: string;
}

export interface TicketTransaction {
  id: string;
  eventId: string;
  ticketTierId: string;
  transactionRef: string | null;
  amount: string;
  quantity: number;
  status: string;
  initiatedAt: string;
  completedAt: string | null;
  registrationId: string;
  createdAt: string;
  ticketTier?: RegistrationTicketTier;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  firstName: string;
  lastName: string;
  email: string;
  marketingConsentEvents: boolean;
  marketingConsentNews: boolean;
  totalAmount: string;
  paymentProvider: string;
  status: string;
  transactionRef: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  ticketTransactions: TicketTransaction[];
}

export interface RegistrationStats {
  totalRegistrations: number;
  completedRegistrations: number;
  totalRevenue: string;
  ticketTiers: {
    id: string;
    name: string;
    price: string;
    sold: number;
    available: number;
  }[];
}

export interface RegistrationsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface RegistrationsData {
  event: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    location?: string;
  };
  stats: RegistrationStats;
  registrations: EventRegistration[];
  pagination: RegistrationsPagination;
}

interface UseEventRegistrationsOptions {
  eventId: string | null | undefined;
  /** Page number (1-indexed). Defaults to 1. */
  page?: number;
  /** Items per page. Defaults to 15. */
  limit?: number;
  /** Payment status filter (e.g. "COMPLETED"). Omit or pass "All" for no filter. */
  status?: string;
}

/**
 * Single source of truth for an event's registrations from
 * `GET /events/{id}/registrations` — paginated registrant rows plus
 * event stats (total revenue, per-tier tickets sold) and pagination meta.
 *
 * Consumers that only need `stats` can call it with `{ limit: 1 }`.
 */
export function useEventRegistrations({
  eventId,
  page = 1,
  limit = 15,
  status,
}: UseEventRegistrationsOptions) {
  const normalizedStatus = status && status !== "All" ? status : undefined;

  const { data, isLoading, error, refetch } =
    useQuery<RegistrationsData | null>({
      queryKey: [
        "event-registrations",
        eventId,
        page,
        limit,
        normalizedStatus ?? "All",
      ],
      queryFn: async () => {
        try {
          const params = new URLSearchParams({
            page: String(page),
            limit: String(limit),
          });
          if (normalizedStatus) {
            params.set("status", normalizedStatus);
          }
          const response = await api.get(
            `${SERVER_URL}/events/${eventId}/registrations?${params.toString()}`,
          );
          return response.data.data ?? null;
        } catch (error) {
          console.log("Error fetching event registrations:", error);
          return null;
        }
      },
      enabled: !!eventId,
    });

  return {
    registrations: data?.registrations ?? [],
    stats: data?.stats ?? null,
    pagination: data?.pagination ?? null,
    event: data?.event ?? null,
    isLoading,
    error,
    refetch,
  };
}
