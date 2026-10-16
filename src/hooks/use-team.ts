import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import api from "@/lib/api/axios-client";
import { handleAxiosError } from "@/lib/api/handle-axios-error";
import { SERVER_URL } from "@/constants";
import { createMockCollection, mockId } from "@/mocks/utils";
import type { PermissionKey, Role } from "@/lib/permissions";

export type TeamRole = Exclude<Role, "owner">;

export interface TeamMember {
  /** The waiter's user id for waiters (what `DELETE /menu/waiters/{id}` takes); a mock id for admin ops. */
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  /** Dashboard sections an admin-ops member may open; empty for waiters. */
  permissions: PermissionKey[];
  active: boolean;
  createdAt: string | null;
  /** Waiters come from the API; admin ops are sample data until the backend has that role. */
  isSample: boolean;
}

export interface AddWaiterInput {
  email: string;
}

export interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
  permissions: PermissionKey[];
}

export interface UpdateAdminInput {
  id: string;
  permissions?: PermissionKey[];
  active?: boolean;
  newPassword?: string;
}

const WAITERS_KEY = ["menu-waiters"];
const ADMINS_KEY = ["team-admin-ops"];

type RawWaiter = Record<string, unknown> & { user?: Record<string, unknown> };

const str = (value: unknown) => (typeof value === "string" && value ? value : undefined);

/** `GET /menu/waiters` rows: `{ id, waiterUserId, email, fullName, status: "ACTIVE", createdAt, removedAt }`. */
function toWaiter(raw: RawWaiter): TeamMember {
  const user = raw.user ?? {};
  const email = str(raw.email) ?? str(user.email) ?? "";
  return {
    id: str(raw.waiterUserId) ?? str(raw.userId) ?? str(user.id) ?? str(raw.id) ?? email,
    name: str(raw.fullName) ?? str(user.fullName) ?? str(raw.name) ?? str(user.username) ?? (email.split("@")[0] || "Waiter"),
    email,
    role: "waiter",
    permissions: [],
    active: (str(raw.status) ?? "ACTIVE") === "ACTIVE" && !raw.removedAt,
    createdAt: str(raw.createdAt) ?? str(raw.addedAt) ?? null,
    isSample: false,
  };
}

function waiterRows(body: unknown): RawWaiter[] {
  const data = (body as { data?: unknown })?.data;
  if (Array.isArray(data)) return data as RawWaiter[];
  const nested = (data as { data?: unknown; waiters?: unknown })?.data ?? (data as { waiters?: unknown })?.waiters;
  return Array.isArray(nested) ? (nested as RawWaiter[]) : [];
}

/**
 * The restaurant's waiters, from the Menu service (`GET/POST/DELETE /menu/waiters`). Waiters use
 * the separate SpinStrip waiter app; the dashboard only adds an existing SpinStrip user by email,
 * lists them and removes them (which also releases any orders they are processing).
 */
export function useWaiters() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<TeamMember[]>({
    queryKey: WAITERS_KEY,
    queryFn: async () => {
      try {
        const response = await api.get(`${SERVER_URL}/menu/waiters`, { params: { page: 1, limit: 100 } });
        return waiterRows(response.data).map(toWaiter);
      } catch (error) {
        console.log("Error fetching waiters:", error);
        return [];
      }
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: WAITERS_KEY });

  const addWaiter = useMutation({
    mutationFn: async ({ email }: AddWaiterInput) => {
      try {
        const response = await api.post(`${SERVER_URL}/menu/waiters`, { email: email.trim().toLowerCase() });
        return response.data;
      } catch (error) {
        if ((error as AxiosError).response?.status === 404) {
          throw new Error("No SpinStrip account uses that email. Ask them to sign up in the SpinStrip app first.");
        }
        throw new Error(handleAxiosError(error as AxiosError));
      }
    },
    onSuccess: invalidate,
  });

  const removeWaiter = useMutation({
    mutationFn: async (waiterUserId: string) => {
      try {
        await api.delete(`${SERVER_URL}/menu/waiters/${waiterUserId}`);
      } catch (error) {
        throw new Error(handleAxiosError(error as AxiosError));
      }
    },
    onSuccess: invalidate,
  });

  return { waiters: data ?? [], isLoading, error, refetch, addWaiter, removeWaiter };
}

// SAMPLE DATA until the backend supports an admin-operations role.
const adminOps = createMockCollection<TeamMember>(() => [
  {
    id: "tm_1",
    name: "Adaeze Okonkwo",
    email: "adaeze.ops@kitchend4ad.com",
    role: "admin_ops",
    permissions: ["overview", "menu", "places", "events", "inventory", "customers", "settlement"],
    active: true,
    createdAt: "2026-06-02T09:30:00.000Z",
    isSample: true,
  },
]);

/**
 * Admin-operations team members (dashboard access limited to chosen sections).
 * SAMPLE DATA held in memory (resets on reload) until the backend has this role — see
 * docs/backend-endpoints-needed.md. Passwords are accepted but never stored or returned.
 */
export function useAdminOps() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<TeamMember[]>({
    queryKey: ADMINS_KEY,
    queryFn: () => adminOps.list(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ADMINS_KEY });

  const createAdmin = useMutation({
    mutationFn: async (input: CreateAdminInput) => {
      const email = input.email.trim().toLowerCase();
      if (adminOps.snapshot().some((m) => m.email === email)) {
        throw new Error("A team member with this email already exists");
      }
      return adminOps.create({
        id: mockId("tm"),
        name: input.name.trim(),
        email,
        role: "admin_ops",
        permissions: input.permissions,
        active: true,
        createdAt: new Date().toISOString(),
        isSample: true,
      });
    },
    onSuccess: invalidate,
  });

  const updateAdmin = useMutation({
    mutationFn: ({ id, permissions, active }: UpdateAdminInput) =>
      adminOps.update(id, {
        ...(permissions !== undefined && { permissions }),
        ...(active !== undefined && { active }),
      }),
    onSuccess: invalidate,
  });

  const removeAdmin = useMutation({
    mutationFn: (id: string) => adminOps.remove(id),
    onSuccess: invalidate,
  });

  return { admins: data ?? [], isLoading, createAdmin, updateAdmin, removeAdmin };
}
