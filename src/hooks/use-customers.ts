import { SERVER_URL } from "@/constants";
import { useServerPagination } from "@/hooks/use-server-pagination";

export type CustomerService = "MENU" | "EVENTS" | "PLACES";

export type CustomerSort =
  | "menuCount"
  | "eventsCount"
  | "placesCount"
  | "totalCount";

export interface Customer {
  id: string;
  merchantUserId: string;
  customerKey: string;
  userId: string | null;
  email: string | null;
  name: string | null;
  phone: string | null;
  menuCount: number;
  eventsCount: number;
  placesCount: number;
  totalCount: number;
  lastPatronizedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface UseCustomersOptions {
  /** Keep only customers who used this service. Omit or pass "All" for every customer. */
  service?: CustomerService | "All";
  /** Count metric to sort by. Defaults to `totalCount` on the server. */
  sort?: CustomerSort;
  /** Items per page. Defaults to 20. */
  limit?: number;
}

/**
 * Lists customers who have patronized the merchant from
 * `GET /places/customers`, with per-service patronage counts
 * (menu, events, places). Page is driven by the `?page=` URL param
 * via `useServerPagination`.
 */
export function useCustomers({
  service,
  sort,
  limit = 20,
}: UseCustomersOptions = {}) {
  const filters: Record<string, string | number> = { limit };
  if (service && service !== "All") filters.service = service;
  if (sort) filters.sort = sort;

  const { items, ...rest } = useServerPagination<Customer>({
    queryKey: "customers",
    endpoint: `${SERVER_URL}/places/customers`,
    filters,
  });

  return { customers: items, ...rest };
}
