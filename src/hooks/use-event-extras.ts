/**
 * Event features from the prototype that the backend doesn't support yet. These sit alongside the
 * real event hooks and never replace them; each is SAMPLE DATA until its endpoint exists, at which
 * point only the hook body here changes.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { mockResponse } from "@/mocks/utils";
import { deletedEvents, sampleViaDealCount } from "@/mocks/events";

/** Ids of events deleted from the dashboard in this browser. SAMPLE DATA (no delete endpoint). */
export function useDeletedEventIds() {
  const { data } = useQuery<string[]>({
    queryKey: ["deleted-events"],
    queryFn: () => mockResponse(Object.keys(deletedEvents.all()), 0),
  });
  return data ?? [];
}

/** Deletes (hides) an event from the dashboard. SAMPLE DATA. */
export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eventId: string) => {
      deletedEvents.set(eventId, new Date().toISOString());
      return mockResponse(true, 0);
    },
    onSuccess: () => {
      toast.success("Event deleted");
      queryClient.invalidateQueries({ queryKey: ["deleted-events"] });
    },
  });
}

/** Ticket sales that came through a deal, for the Sales & Registrations page. SAMPLE DATA. */
export function useEventViaDealSales(eventId: string | null, completedSales: number) {
  return eventId ? sampleViaDealCount(eventId, completedSales) : 0;
}
