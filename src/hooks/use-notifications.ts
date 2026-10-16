import { useQuery } from "@tanstack/react-query";
import { USER_ACCOUNT_URL } from "@/constants";
import api from "@/lib/api/axios-client";

export interface AppNotification {
  id: string;
  title: string;
  body: string | null;
  read: boolean;
  createdAt: string | null;
}

const str = (value: unknown) => (typeof value === "string" && value ? value : null);

/** Notification rows, normalised (Swagger doesn't document the response shape). */
function toNotification(raw: Record<string, unknown>, index: number): AppNotification {
  const title = str(raw.title) ?? str(raw.subject) ?? str(raw.type)?.replace(/_/g, " ") ?? "Notification";
  return {
    id: str(raw.id) ?? String(index),
    title,
    body: str(raw.message) ?? str(raw.body) ?? str(raw.content) ?? str(raw.description),
    read: raw.read === true || raw.isRead === true || raw.readAt != null,
    createdAt: str(raw.createdAt) ?? str(raw.sentAt),
  };
}

function rowsOf(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data;
  const record = data as Record<string, unknown> | null;
  const nested = record?.notifications ?? record?.data ?? record?.items;
  return Array.isArray(nested) ? (nested as Record<string, unknown>[]) : [];
}

/** The signed-in user's latest notifications (`GET /notifications`, user-account service). */
export function useNotifications({ pageSize = 20 }: { pageSize?: number } = {}) {
  const { data, isLoading, error, refetch } = useQuery<AppNotification[]>({
    queryKey: ["notifications", pageSize],
    queryFn: async () => {
      try {
        const response = await api.get(`${USER_ACCOUNT_URL}/notifications`, { params: { page: 1, pageSize } });
        return rowsOf(response.data?.data).map(toNotification);
      } catch (error) {
        console.log("Error fetching notifications:", error);
        return [];
      }
    },
    refetchInterval: 60_000,
  });

  const notifications = data ?? [];
  return { notifications, unreadCount: notifications.filter((n) => !n.read).length, isLoading, error, refetch };
}
