---
name: spinstrip-frontend
description: SpinStrip merchant dashboard — API integration and data-fetching conventions. Use when integrating an endpoint, fetching data in a component, or creating hooks.
---

# SpinStrip Frontend — Integration Conventions

## API services

All responses use the envelope `{ status, message, data }` — unwrap `response.data.data`.

| Constant (`@/constants`) | Base URL | Use for |
|---|---|---|
| `SERVER_URL` | spinstrip-merchant-gateway.fly.dev/api/v1 | Authenticated dashboard endpoints (events, kyc, wallet…) |
| `EVENTS_SERVER_URL` | spinstrip-events.fly.dev/api/v1 | Public event registration/payment endpoints |
| `USER_ACCOUNT_URL` | spinstrip-user-account.fly.dev/api/v1 | User account endpoints |

Always call through `api` from `@/lib/api/axios-client` — it injects the Bearer token from the Redux store and handles 401 refresh/logout. Pass an absolute URL (`${SERVER_URL}/...`) to pick the service.

## Data fetching: ALWAYS create reusable hooks

Never inline `useQuery`/axios calls in a component. Every endpoint gets a reusable hook in `src/hooks/use-<domain>.ts`, even if it currently has one consumer. Existing examples: `use-event-registrations.ts`, `use-events.ts`, `use-deals.ts`, `use-inventory.ts`, `use-places.ts`, `use-kyc.ts`, `use-wallet.ts`, `use-catalogs.ts`. For paginated lists, reuse `use-server-pagination.ts` instead of writing a new query. Domain types shared between a hook and its consumers (e.g. `PublicEvent`, `PublicPlace`, `RegistrationStats`) live in and are exported from the hook file.

Hook pattern (see `src/hooks/use-event-registrations.ts` as the reference):

- Export all response types (interfaces) from the hook file — components import types from the hook, never redeclare them.
- Use `useQuery` from `@tanstack/react-query` with a descriptive `queryKey` that includes every request parameter (id, page, limit, filters) so param changes refetch and cache correctly.
- Accept an options object (`{ eventId, page, limit, status }`), not positional args. Gate with `enabled: !!requiredParam`.
- Catch errors inside `queryFn`, `console.log` them, and return a safe fallback (`null` / `[]`).
- Return a named object with defaults applied (`registrations: data?.registrations ?? []`), plus `isLoading`, `error`, `refetch` — not the raw query result.
- JSDoc the hook: which endpoint it wraps and any cheap-usage tips (e.g. `{ limit: 1 }` to fetch only stats).

For one-off mutations from forms/buttons, `useHandleRequest` / `useFetch` from `src/hooks/use-fetch.ts` are also available; prefer building payloads at submit time (`form.handleSubmit`), never at render time.

## UI conventions

- Forms: react-hook-form + zod resolver + `FormInput` (`@/components/ui/forms/form-input`); use `mode: "onChange"` when a button disables on `formState.isValid`.
- Toasts: `react-hot-toast`.
- Payment/registration status badges: `COMPLETED` → `bg-green-100 text-green-700`, `PENDING` → `bg-amber-100 text-amber-700`, `FAILED` → `bg-red-100 text-red-600`.
- Loading: `Loader` (`@/components/loader`) for pages, small `animate-spin border-b-2 border-primary` circle inline; empty states via `EmptyState` (`@/components/empty-state`).
- Currency is Naira: `₦{Number(value).toLocaleString()}` (API sends amounts as strings).
