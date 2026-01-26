import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { useQuery } from "@tanstack/react-query";

export interface Catalog {
  id: string;
  name: string;
  description: string;
  industry: string;
  tags: string[];
  categories: CatalogCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface CatalogCategory {
  id: string;
  name: string;
  description: string;
  tags: string[];
}

interface UseCatalogsReturn {
  catalogs: Catalog[] | undefined;
  isLoadingCatalogs: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch inventory/menu catalogs
 * Used by both inventory and menu modules
 */
export function useCatalogs(): UseCatalogsReturn {
  const { error, data, isLoading, refetch } = useQuery({
    queryKey: ["inventory-catalogs"],
    queryFn: async () => {
      try {
        const response = await api.get(SERVER_URL + "/inventory/catalogs");
        return response.data.data;
      } catch (error) {
        console.log("Error fetching catalogs:", error);
        return null;
      }
    },
  });

  return {
    catalogs: data?.data,
    isLoadingCatalogs: isLoading,
    error,
    refetch,
  };
}
