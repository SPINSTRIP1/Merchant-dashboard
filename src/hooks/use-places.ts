import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { Facility, Place } from "@/app/(dashboard)/apps-tools/places/_schemas";
import { SinglePlace } from "@/app/(dashboard)/apps-tools/places/_components/claim-places-steps/find-place";
import { useQuery } from "@tanstack/react-query";

export interface PublicPlace extends Omit<Place, "coverImage"> {
  coverImage: string;
  images: string[];
}

/**
 * Fetches a single merchant place (with stats) from `GET /places/{id}`.
 */
export function usePlace(placeId: string | null | undefined) {
  const { data, isLoading, error, refetch } = useQuery<SinglePlace | null>({
    queryKey: ["single-place", placeId],
    queryFn: async () => {
      try {
        const response = await api.get(`${SERVER_URL}/places/${placeId}`);
        return response.data.data ?? null;
      } catch (error) {
        console.log("Error fetching place:", error);
        return null;
      }
    },
    enabled: !!placeId,
  });

  return {
    place: data ?? null,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Fetches a place's facilities from `GET /places/{id}/facilities`.
 */
export function usePlaceFacilities(placeId: string | null | undefined) {
  const { data, isLoading, error, refetch } = useQuery<Facility[]>({
    queryKey: ["place-facility", placeId],
    queryFn: async () => {
      try {
        const response = await api.get(
          `${SERVER_URL}/places/${placeId}/facilities`,
        );
        return response.data.data.facilities ?? [];
      } catch (error) {
        console.log("Error fetching facilities:", error);
        return [];
      }
    },
    enabled: !!placeId,
  });

  return {
    facilities: data ?? [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Fetches a public place (unauthenticated preview/checkout pages)
 * from `GET /places/public/{id}`.
 */
export function usePublicPlace(placeId: string | null | undefined) {
  const { data, isLoading, error, refetch } = useQuery<PublicPlace | null>({
    queryKey: ["public-place", placeId],
    queryFn: async () => {
      try {
        const response = await api.get(
          `${SERVER_URL}/places/public/${placeId}`,
        );
        return response.data.data ?? null;
      } catch (error) {
        console.log("Error fetching public place:", error);
        return null;
      }
    },
    enabled: !!placeId,
  });

  return {
    place: data ?? null,
    isLoading,
    error,
    refetch,
  };
}
