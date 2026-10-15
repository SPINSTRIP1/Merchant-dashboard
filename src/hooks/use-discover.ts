/**
 * Public SpinStrip Discover listings. SAMPLE DATA from src/mocks/discover.ts until the backend
 * exposes public listings of published places and live events.
 */
import { useQuery } from "@tanstack/react-query";
import { mockResponse } from "@/mocks/utils";
import { sampleDiscoverEvents, sampleDiscoverPlaces } from "@/mocks/discover";

export function useDiscover() {
  const { data, isLoading } = useQuery({
    queryKey: ["discover-sample"],
    queryFn: () => mockResponse({ places: sampleDiscoverPlaces(), events: sampleDiscoverEvents() }),
    staleTime: Infinity,
  });

  return {
    places: data?.places ?? [],
    events: data?.events ?? [],
    isLoading,
  };
}
