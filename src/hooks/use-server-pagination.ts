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
  queryKey: string;
  endpoint: string;
  initialPage?: number;
  searchQuery?: string;
  filters?: Record<string, string>;
}

export function useServerPagination<T>({
  queryKey,
  endpoint,
  initialPage = 1,
  searchQuery = "",
  filters = {},
}: UseServerPaginationOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current page from URL or use initial page
  const currentPage = Number(searchParams.get("page")) || initialPage;

  // Fetch paginated data from server
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [queryKey, currentPage, searchQuery, filters],
    queryFn: async () => {
      try {
        // Build query params
        const params = new URLSearchParams();
        params.set("page", currentPage.toString());

        if (searchQuery) {
          params.set("search", searchQuery);
        }

        // Add filter params
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            params.set(key, value);
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
        console.error(`Error fetching ${queryKey}:`, error);
        return null;
      }
    },
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
