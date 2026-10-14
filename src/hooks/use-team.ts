import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMockCollection, mockId } from "@/mocks/utils";
import type { PermissionKey, Role } from "@/lib/permissions";

export type TeamRole = Exclude<Role, "owner">;

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  /** Dashboard sections an admin-ops member may open; empty for waiters. */
  permissions: PermissionKey[];
  active: boolean;
  createdAt: string;
}

export interface CreateTeamMemberInput {
  name: string;
  email: string;
  password: string;
  role: TeamRole;
  permissions: PermissionKey[];
}

export interface UpdateTeamMemberInput {
  id: string;
  permissions?: PermissionKey[];
  active?: boolean;
  newPassword?: string;
}

// SAMPLE DATA until the backend supports merchant team accounts.
const team = createMockCollection<TeamMember>(() => [
  {
    id: "tm_1",
    name: "Adaeze Okonkwo",
    email: "adaeze.ops@kitchend4ad.com",
    role: "admin_ops",
    permissions: ["overview", "menu", "places", "events", "inventory", "customers", "settlement"],
    active: true,
    createdAt: "2026-06-02T09:30:00.000Z",
  },
  {
    id: "tm_2",
    name: "Tunde Balogun",
    email: "tunde.waiter@kitchend4ad.com",
    role: "waiter",
    permissions: [],
    active: true,
    createdAt: "2026-07-18T11:00:00.000Z",
  },
  {
    id: "tm_3",
    name: "Kemi Afolabi",
    email: "kemi.waiter@kitchend4ad.com",
    role: "waiter",
    permissions: [],
    active: false,
    createdAt: "2026-08-25T15:45:00.000Z",
  },
]);

const TEAM_KEY = ["team-members"];

/**
 * The merchant's team (admin ops and waiters) with create / update / remove.
 * SAMPLE DATA held in memory (resets on reload) until team endpoints exist — replace the mock
 * collection calls with the API when they do. Passwords are accepted but never stored or returned.
 */
export function useTeam() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<TeamMember[]>({
    queryKey: TEAM_KEY,
    queryFn: () => team.list(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: TEAM_KEY });

  const createMember = useMutation({
    // `input.password` would go to the API; the mock never stores it.
    mutationFn: async (input: CreateTeamMemberInput) => {
      const email = input.email.trim().toLowerCase();
      if (team.snapshot().some((m) => m.email === email)) {
        throw new Error("A team member with this email already exists");
      }
      return team.create({
        id: mockId("tm"),
        name: input.name.trim(),
        email,
        role: input.role,
        permissions: input.role === "waiter" ? [] : input.permissions,
        active: true,
        createdAt: new Date().toISOString(),
      });
    },
    onSuccess: invalidate,
  });

  const updateMember = useMutation({
    // `newPassword` would go to the API; the mock never stores it.
    mutationFn: ({ id, permissions, active }: UpdateTeamMemberInput) =>
      team.update(id, {
        ...(permissions !== undefined && { permissions }),
        ...(active !== undefined && { active }),
      }),
    onSuccess: invalidate,
  });

  const removeMember = useMutation({
    mutationFn: (id: string) => team.remove(id),
    onSuccess: invalidate,
  });

  return {
    members: data ?? [],
    isLoading,
    error,
    refetch,
    createMember,
    updateMember,
    removeMember,
  };
}
