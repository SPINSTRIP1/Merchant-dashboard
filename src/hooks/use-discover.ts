/**
 * SpinStrip Discover: published places, live events and restaurant menus across all merchants,
 * from the public listing endpoints the public site (places.spinstrip.com) uses. Cards link to the
 * public site's pages, where customers book, buy tickets and order.
 */
import { useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import api from "@/lib/api/axios-client";
import { MENU_API_URL, PLACES_API_URL, USER_ACCOUNT_URL } from "@/constants";

export interface DiscoverPlace {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  placeType: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  coverImage?: string | null;
  images?: string[] | null;
  views?: number | null;
  metadata?: { logoUrl?: string; businessCategory?: string } | null;
}

export interface DiscoverEvent {
  id: string;
  name: string;
  images?: string[] | null;
  startDate: string;
  endDate?: string;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  isFeatured?: boolean;
  impressions?: number | null;
  ticketTiers?: { price: string | number; status?: string }[];
}

export interface DiscoverDish {
  id: string;
  userId: string;
  name: string;
  price: string | number;
  category?: string | null;
  images?: string[] | null;
  status?: string;
  isHidden?: boolean;
  isFeatured?: boolean;
}

/** A restaurant as the public site derives it: a merchant's visible dishes plus their place, if any. */
export interface DiscoverRestaurant {
  merchantId: string;
  name: string;
  logo: string | null;
  cover: string | null;
  location: string | null;
  dishCount: number;
  minPrice: number | null;
  categories: string[];
}

interface Paginated<T> {
  data: T[];
  count: number;
}

const unwrap = <T,>(response: { data: { data?: Paginated<T> } }): Paginated<T> =>
  response.data.data ?? { data: [], count: 0 };

async function fetchList<T>(url: string, params: Record<string, string | number | undefined>): Promise<Paginated<T>> {
  try {
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));
    return unwrap<T>(await api.get(url, { params: clean }));
  } catch (error) {
    console.log("Error fetching Discover listings:", error);
    return { data: [], count: 0 };
  }
}

/** Lowest active ticket price, or 0 when every tier is free (null when there are no tiers). */
export function eventPriceFrom(event: DiscoverEvent): number | null {
  const prices = (event.ticketTiers ?? [])
    .filter((tier) => !tier.status || tier.status === "ACTIVE")
    .map((tier) => Number(tier.price) || 0);
  return prices.length ? Math.min(...prices) : null;
}

const label = (value?: string | null) =>
  (value ?? "").toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function buildRestaurants(dishes: DiscoverDish[], places: DiscoverPlace[]): DiscoverRestaurant[] {
  const byMerchant = new Map<string, DiscoverDish[]>();
  dishes
    .filter((dish) => !dish.isHidden)
    .forEach((dish) => byMerchant.set(dish.userId, [...(byMerchant.get(dish.userId) ?? []), dish]));

  return [...byMerchant.entries()].map(([merchantId, items]) => {
    const place = places.find((p) => p.userId === merchantId) ?? null;
    const prices = items.map((d) => Number(d.price)).filter((n) => n > 0);
    const categoryCounts = new Map<string, number>();
    items.forEach((d) => {
      const name = label(d.category) || "Other";
      categoryCounts.set(name, (categoryCounts.get(name) ?? 0) + 1);
    });
    return {
      merchantId,
      name: place?.name?.trim() || `Kitchen ${merchantId.slice(0, 4).toUpperCase()}`,
      logo: place?.metadata?.logoUrl ?? null,
      cover: place?.coverImage || items.find((d) => d.images?.length)?.images?.[0] || null,
      location: place ? [place.city, place.state].filter(Boolean).join(", ") || null : null,
      dishCount: items.length,
      minPrice: prices.length ? Math.min(...prices) : null,
      categories: [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name),
    };
  });
}

/**
 * Public listings for Discover. `search` and `city` filter places and events on the server; menu
 * items are searched by name. Restaurants are derived from public menu items grouped by merchant,
 * named from that merchant's published place (the menu service has no restaurant entity).
 */
export function useDiscover({ search = "", city = "" }: { search?: string; city?: string } = {}) {
  const term = search.trim();

  const placesQuery = useQuery({
    queryKey: ["discover", "places", term, city],
    queryFn: () =>
      fetchList<DiscoverPlace>(`${PLACES_API_URL}/places/public`, { limit: 12, search: term, city, sortBy: "created" }),
    placeholderData: keepPreviousData,
  });

  const eventsQuery = useQuery({
    queryKey: ["discover", "events", term, city],
    queryFn: () =>
      fetchList<DiscoverEvent>(`${USER_ACCOUNT_URL}/events/public`, { limit: 12, search: term, city, status: "ACTIVE" }),
    placeholderData: keepPreviousData,
  });

  const dishesQuery = useQuery({
    queryKey: ["discover", "dishes", term],
    queryFn: () =>
      fetchList<DiscoverDish>(`${MENU_API_URL}/menu/public/menu-items`, { limit: 100, search: term, status: "AVAILABLE" }),
    placeholderData: keepPreviousData,
  });

  // Every published place (capped at 100): names restaurants and supplies the city pills.
  const directoryQuery = useQuery({
    queryKey: ["discover", "directory"],
    queryFn: () => fetchList<DiscoverPlace>(`${PLACES_API_URL}/places/public`, { limit: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  const directory = directoryQuery.data?.data;
  const restaurants = useMemo(() => {
    const all = buildRestaurants(dishesQuery.data?.data ?? [], directory ?? []);
    return city ? all.filter((r) => r.location?.toLowerCase().includes(city.toLowerCase())) : all;
  }, [dishesQuery.data, directory, city]);

  const cities = useMemo(() => {
    const counts = new Map<string, number>();
    (directory ?? []).forEach((p) => p.city && counts.set(p.city, (counts.get(p.city) ?? 0) + 1));
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);
  }, [directory]);

  return {
    places: placesQuery.data?.data ?? [],
    placesTotal: placesQuery.data?.count ?? 0,
    events: eventsQuery.data?.data ?? [],
    eventsTotal: eventsQuery.data?.count ?? 0,
    restaurants,
    cities,
    isLoading: placesQuery.isLoading || eventsQuery.isLoading || dishesQuery.isLoading,
    isFetching: placesQuery.isFetching || eventsQuery.isFetching || dishesQuery.isFetching,
  };
}
