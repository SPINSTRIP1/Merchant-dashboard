import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/axios-client";

interface PaginatedResponse<T> {
  count: number;
  currentpage: number;
  data: T[];
  lastpage: number;
  nextpage: number | null;
  prevpage: number | null;
}

interface UseServerPaginationOptions {
  queryKey: string | string[];
  endpoint: string;
  initialPage?: number;
  searchQuery?: string;
  filters?: Record<string, string | boolean | number>;
  enabled?: boolean;
}

export function useServerPagination<T>({
  queryKey,
  endpoint,
  initialPage = 1,
  searchQuery = "",
  filters = {},
  enabled = true,
}: UseServerPaginationOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current page from URL or use initial page
  const currentPage = Number(searchParams.get("page")) || initialPage;
  const key = Array.isArray(queryKey)
    ? [...queryKey, currentPage, searchQuery, filters]
    : [queryKey, currentPage, searchQuery, filters];
  // Fetch paginated data from server
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: key,
    queryFn: async () => {
      try {
        // Build query params
        const params: Record<string, string | boolean | number> = {
          page: currentPage,
        };

        if (searchQuery) {
          params.search = searchQuery;
        }

        // Add filter params
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params[key] = value;
          }
        });

        const response = await api.get<{ data: PaginatedResponse<T> }>(
          endpoint,
          {
            params,
          }
        );
        return response.data.data;
      } catch (error) {
        console.log(`Error fetching ${queryKey}:`, error);
        return null;
      }
    },
    enabled,
  });

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const items = data?.data || [];
  const totalPages = data?.lastpage || 1;
  const totalItems = data?.count || 0;
  const nextPage = data?.nextpage || null;
  const prevPage = data?.prevpage || null;

  return {
    items,
    currentPage,
    totalPages,
    totalItems,
    nextPage,
    prevPage,
    isLoading,
    error,
    refetch,
    handlePageChange,
  };
}
