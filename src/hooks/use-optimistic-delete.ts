import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/axios-client";
import toast from "react-hot-toast";

interface UseOptimisticDeleteOptions {
  queryKey: (string | number)[];
  deleteEndpoint: string;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useOptimisticDelete<T extends { id: string }>({
  queryKey,
  deleteEndpoint,
  //   successMessage = "Item deleted successfully",
  errorMessage = "Failed to delete item",
  onSuccess,
  onError,
}: UseOptimisticDeleteOptions) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`${deleteEndpoint}/${id}`);
      return response.data;
    },
    onMutate: async (deletedId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update the cache
      queryClient.setQueryData(queryKey, (old: unknown) => {
        if (!old) return old;

        // Handle paginated response structure
        if (
          typeof old === "object" &&
          old !== null &&
          "data" in old &&
          Array.isArray(old.data)
        ) {
          return {
            ...old,
            data: old.data.filter((item: T) => item.id !== deletedId),
            count:
              "count" in old && typeof old.count === "number"
                ? old.count - 1
                : undefined,
          };
        }

        // Handle simple array structure
        if (Array.isArray(old)) {
          return old.filter((item: T) => item.id !== deletedId);
        }

        return old;
      });

      // Return context with previous data for rollback
      return { previousData };
    },
    onError: (error, deletedId, context) => {
      // Rollback to previous data on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast.error(errorMessage);
      onError?.(error);
    },
    onSuccess: () => {
      //   toast.success(successMessage);
      onSuccess?.();
    },
    onSettled: () => {
      // Refetch to ensure data is in sync with server
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    deleteItem: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    deleteAsync: deleteMutation.mutateAsync,
  };
}
