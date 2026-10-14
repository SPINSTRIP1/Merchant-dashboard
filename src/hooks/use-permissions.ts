import { useCallback, useMemo } from "react";
import { useReduxAuth } from "@/hooks/use-redux-auth";
import {
  ALL_PERMISSIONS,
  ROLE_LABELS,
  landingPathFor,
  requirementForPath,
  resolveRole,
  type PermissionKey,
} from "@/lib/permissions";

/**
 * The signed-in user's role and dashboard permissions.
 *
 * `can(perm)` answers "may this user see that section?"; `canAccessPath(path)` applies the same
 * rules to a URL (used by the sidebar and the page guard). Owners can do everything; admin ops are
 * limited to `user.dashboardPermissions`; waiters have no dashboard access.
 */
export function usePermissions() {
  const { user } = useReduxAuth();
  const role = resolveRole(user);
  const permissions = useMemo<PermissionKey[]>(() => {
    if (role === "owner") return ALL_PERMISSIONS;
    if (role === "waiter") return [];
    return (user?.dashboardPermissions ?? []).filter((p): p is PermissionKey =>
      (ALL_PERMISSIONS as string[]).includes(p)
    );
  }, [role, user?.dashboardPermissions]);

  const can = useCallback((perm: PermissionKey) => permissions.includes(perm), [permissions]);

  const canAccessPath = useCallback(
    (path: string) => {
      if (role === "waiter") return false;
      const requirement = requirementForPath(path);
      if (requirement === null) return true;
      if (requirement === "owner") return role === "owner";
      return can(requirement);
    },
    [role, can]
  );

  return {
    role,
    roleLabel: ROLE_LABELS[role],
    isOwner: role === "owner",
    permissions,
    can,
    canAccessPath,
    landingPath: landingPathFor(role, can),
  };
}
