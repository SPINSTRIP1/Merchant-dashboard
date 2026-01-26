import apiClient from "@/lib/api/axios-client";
import { handleAxiosError } from "@/lib/api/handle-axios-error";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import { useState, useEffect, useCallback } from "react";

interface Request {
  route: string;
  action?: "post" | "delete" | "put" | "patch";
  onSuccess?: (data: unknown) => void;
  params?: object;
  successMessage?: string;
}

export function useHandleRequest({
  route,
  action = "post",
  onSuccess,
  params,
  successMessage,
}: Request) {
  const [loading, setLoading] = useState(false);
  const handleRequest = async () => {
    setLoading(true);
    try {
      const res = await apiClient[action](route, params);
      onSuccess?.(res.data.data);
      toast.success(successMessage || "Success");
    } catch (error) {
      const err = handleAxiosError(error as AxiosError);
      console.log(error);
      toast.error(err || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return {
    handleRequest,
    loading,
  };
}

// Types for the reusable fetch hook
type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

interface UseFetchOptions<T> {
  route: string;
  method?: HttpMethod;
  params?: object;
  body?: object;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  showSuccessMessage?: boolean;
  showErrorMessage?: boolean;
  successMessage?: string;
  dependencies?: unknown[];
}

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  execute: (overrideBody?: object) => Promise<T | null>;
}

export function useFetch<T = unknown>({
  route,
  method = "get",
  params,
  body,
  enabled = true,
  onSuccess,
  onError,
  showSuccessMessage = false,
  showErrorMessage = true,
  successMessage = "Success",
  dependencies = [],
}: UseFetchOptions<T>): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (overrideBody?: object): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        let response;
        const requestBody = overrideBody || body;

        // Build query string for GET requests with params
        let requestUrl = route;
        if (method === "get" && params) {
          const queryString = new URLSearchParams(
            Object.entries(params).reduce(
              (acc, [key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                  acc[key] = String(value);
                }
                return acc;
              },
              {} as Record<string, string>,
            ),
          ).toString();
          if (queryString) {
            requestUrl = `${route}?${queryString}`;
          }
        }

        switch (method) {
          case "get":
            response = await apiClient.get(requestUrl);
            break;
          case "post":
            response = await apiClient.post(route, requestBody);
            break;
          case "put":
            response = await apiClient.put(route, requestBody);
            break;
          case "patch":
            response = await apiClient.patch(route, requestBody);
            break;
          case "delete":
            response = await apiClient.delete(route, { data: requestBody });
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }

        const responseData = response.data as T;
        setData(responseData);
        onSuccess?.(responseData);

        if (showSuccessMessage) {
          toast.success(successMessage || "Success");
        }

        return responseData;
      } catch (err) {
        const errorMessage = handleAxiosError(err as AxiosError);
        setError(errorMessage);
        onError?.(errorMessage);

        if (showErrorMessage) {
          toast.error(errorMessage || "Something went wrong");
        }

        return null;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [route, method, JSON.stringify(params), JSON.stringify(body)],
  );

  const refetch = useCallback(async () => {
    await execute();
  }, [execute]);

  // Auto-fetch on mount and when dependencies change (for GET requests by default)
  useEffect(() => {
    if (enabled && method === "get") {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch,
    execute,
  };
}
