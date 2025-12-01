import { INVENTORY_SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { useQuery } from "@tanstack/react-query";

interface Catalog {
  id: string;
  name: string;
  description: string;
  industry: string;
  tags: string[];
  categories: {
    id: string;
    name: string;
    description: string;
    tags: string[];
  }[];
  createdAt: string;
  updatedAt: string;
}

interface UseCatalogsReturn {
  catalogs: Catalog[] | undefined;
  isLoadingCatalogs: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useCatalogs(): UseCatalogsReturn {
  const { error, data, isLoading, refetch } = useQuery({
    queryKey: ["inventory-catalogs"],
    queryFn: async () => {
      try {
        const response = await api.get(INVENTORY_SERVER_URL + "/catalogs");
        return response.data.data;
      } catch (error) {
        console.log("Error fetching compliance status:", error);
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
