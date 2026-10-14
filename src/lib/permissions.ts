/**
 * Team roles and dashboard permissions.
 *
 * - owner: the merchant account holder; full access, and the only role that manages the team.
 * - admin_ops: dashboard access limited to the sections the owner grants.
 * - waiter: no dashboard access; uses the waiter app at /waiter.
 *
 * The backend doesn't return roles/permissions yet (accounts come back as role "USER"), so
 * `resolveRole` treats any unknown role as the owner. Team members are mocked until it does.
 */

export type Role = "owner" | "admin_ops" | "waiter";

export const PERMISSIONS = [
  { key: "overview", label: "Overview" },
  { key: "menu", label: "Menu" },
  { key: "places", label: "Places" },
  { key: "events", label: "Events" },
  { key: "inventory", label: "Inventory" },
  { key: "deals", label: "Deals" },
  { key: "customers", label: "Customers" },
  { key: "wallet", label: "Wallet" },
  { key: "settlement", label: "Settlement" },
  { key: "billing", label: "Billing" },
  { key: "settings", label: "Settings" },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]["key"];

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  admin_ops: "Admin Ops",
  waiter: "Waiter",
};

export const ALL_PERMISSIONS: PermissionKey[] = PERMISSIONS.map((p) => p.key);

/**
 * The signed-in person's merchant team role, from `user.role`.
 *
 * This is deliberately NOT read from `user.profiles`: those are SpinStrip platform roles
 * (USER, MERCHANT, ADMIN — ADMIN means a SpinStrip staff admin, not a merchant's admin ops), and
 * every account that logs in today is the merchant themself, i.e. the owner.
 */
export function resolveRole(user: { role?: string | null } | null | undefined): Role {
  const role = (user?.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  if (role === "waiter") return "waiter";
  if (role === "admin_ops" || role === "admin_operations") return "admin_ops";
  return "owner";
}

/**
 * Which permission a dashboard path needs. `null` means any dashboard user may open it
 * (e.g. the apps catalogue); "owner" means owner-only.
 */
const PATH_RULES: { prefix: string; requires: PermissionKey | "owner" | null }[] = [
  { prefix: "/admin", requires: "owner" },
  { prefix: "/apps-tools/menu", requires: "menu" },
  { prefix: "/apps-tools/places", requires: "places" },
  { prefix: "/apps-tools/event-planner", requires: "events" },
  { prefix: "/apps-tools/deals", requires: "deals" },
  { prefix: "/apps-tools/inventory", requires: "inventory" },
  { prefix: "/apps-tools/wallet", requires: "wallet" },
  { prefix: "/apps-tools/customers", requires: "customers" },
  { prefix: "/apps-tools", requires: null },
  { prefix: "/settlement", requires: "settlement" },
  { prefix: "/billing", requires: "billing" },
  { prefix: "/settings", requires: "settings" },
];

export function requirementForPath(pathname: string): PermissionKey | "owner" | null {
  if (pathname === "/") return "overview";
  const rule = PATH_RULES.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
  return rule ? rule.requires : null;
}

/** Where a user should land after login, or when they open a page they can't access. */
export function landingPathFor(role: Role, can: (perm: PermissionKey) => boolean): string {
  if (role === "waiter") return "/waiter";
  if (can("overview")) return "/";
  const firstAllowed: Record<PermissionKey, string> = {
    overview: "/",
    menu: "/apps-tools/menu",
    places: "/apps-tools/places",
    events: "/apps-tools/event-planner",
    inventory: "/apps-tools/inventory",
    deals: "/apps-tools/deals",
    customers: "/apps-tools/customers",
    wallet: "/apps-tools/wallet",
    settlement: "/settlement",
    billing: "/billing",
    settings: "/settings",
  };
  const perm = ALL_PERMISSIONS.find((p) => can(p));
  return perm ? firstAllowed[perm] : "/apps-tools";
}
