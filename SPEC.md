# SpinStrip Merchant Dashboard — Technical Specification

> Reference specification for the SpinStrip merchant web app. Written to be handed to
> another model/engineer as the authoritative description of what this app is, how it is
> built, and what conventions any new code must follow.

---

## 1. Product Overview

**SpinStrip Merchant Dashboard** is a Next.js web application that lets business owners
("merchants") run their business on the SpinStrip consumer platform. Merchants sign up,
complete KYC/compliance, then enable modular "Apps/Tools" — each a self-contained business
capability (Wallet, Event Planner, Menu, Inventory, Places, Deals, Customers). Around the apps sit
an Overview, Settlement, Billing, Admin & Roles (team permissions), a waiter app and public pages.

Features the backend supports are wired to it. Features from the product prototype with no
backend endpoint yet are built on **sample data** (section 8.1) and labelled "Sample" on screen;
`docs/backend-endpoints-needed.md` lists what each one needs.

Currency is **Nigerian Naira (₦)**. Amounts arrive from the API as strings.

- App name: `spinstrip` · dev server on port **3001** (`next dev -p 3001`)
- Production host: `https://merchant.spinstrip.com`
- Metadata title template: `"%s | SpinStrip Merchant"`

### Modules

[S] = runs on sample data (fully or partly) until the backend supports it.

| Module | Route | Purpose |
|---|---|---|
| Overview | `/` | Date-range KPIs, revenue/customer charts, product performance, recent transactions and events. Entity counts live; money/customer analytics [S] |
| Apps & Tools | `/apps-tools` | Browse, search, filter, toggle apps; Default / Integrated / Available badges; "Open" link |
| Menu | `/apps-tools/menu?view=` | Tabs: items, Tables & QR [S], Table Analytics [S]; featured items, Top Menus (order counts [S]), Configure sheet |
| Places | `/apps-tools/places` | Create a new place or claim an existing one |
| Place detail | `/apps-tools/places/[id]?tab=` | Facilities, room inventory, operating hours, bookings, visitors, activities, reviews. Tagline, facility removal, manual visitors, booking status, reviews [S] |
| Event Planner | `/apps-tools/event-planner` | Create/manage events, ticket tiers, media; deep link `?create=1&placeId=`. Delete [S] |
| Event Sales & Registrations | `/apps-tools/event-planner/sales-registrations` | Registrant table with CSV export, revenue/tier stats, charts. Via-deal count [S] |
| Deals | `/apps-tools/deals` | Subscription-gated campaigns and deals, activate/pause, insights (performance [S]) |
| Deal archives | `/apps-tools/deals/archives` | Archived deals |
| Inventory | `/apps-tools/inventory` | Products, catalogs, stock levels, restock, visibility, low-stock bar |
| Inventory item detail | `/apps-tools/inventory/item?id=` | Product panels, related items, duplicate. History [S] |
| Wallet | `/apps-tools/wallet` | Create wallet, deposit details, POS, settlement accounts. Balance fallback, revenue, transactions, withdrawals [S] |
| Customers | `/apps-tools/customers` | Service filter, sort, page search, CSV export. Spend view [S] |
| Settlement | `/settlement` | Daily batches + settled transactions, CSV [S] |
| Billing | `/billing` | Monthly bill from active paid apps; invoices and card [S] |
| Admin & Roles | `/admin` | Owner only; team members, roles, permission grid [S] |
| Settings hub | `/settings` | Cards for the six sections; sub-pages share a pill tab bar |
| Compliance / KYC | `/settings/compliance` | Status summary + 4-step KYC wizard |
| Preferences | `/settings/preferences` | Theme (light/dark/system); notification and auto-settlement switches [S] |
| Security | `/settings/security` | Change password [S]; link to OTP reset |
| Payments | `/settings/payments` | Settlement bank accounts (real) |
| Integrations, Legal | `/settings/integrations`, `/settings/legal` | Informational pages |

### Waiter app (authenticated, no sidebar)

| Route | Purpose |
|---|---|
| `/waiter` | Phone-first floor plan (refreshes every 15 s), seat-guests stepper, read-only menu. Tables [S] |

### Public preview routes (unauthenticated, consumer-facing)

| Route | Purpose |
|---|---|
| `/preview/events?id=<eventId>` | Public event landing page + ticket checkout |
| `/preview/events/success` | Post-payment success |
| `/preview/places?id=<placeId>` | Public place landing page + booking checkout |
| `/preview/menu?table=<qrToken>` | Table-QR menu: the merchant's real menu when signed in, sample otherwise |
| `/discover` | SpinStrip Discover: places and events across merchants [S] |

### Auth routes

`/login`, `/register`, `/otp-verification`, `/forgot-password`, `/reset-password`

---

## 2. Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js **15** (App Router), React **19** |
| Language | TypeScript 5; `@/*` path alias maps to `src/*` |
| Styling | Tailwind CSS 3.4 + `tailwindcss-animate`, `class-variance-authority`, `clsx`, `tailwind-merge` |
| UI primitives | Radix UI (checkbox, dialog, dropdown-menu, label, popover, radio-group, select, slot, switch, tabs, tooltip) — shadcn-style wrappers in `src/components/ui` (incl. `sheet`, `skeleton`, `badge`, `progress`) |
| Theme | `next-themes` (class strategy; light / dark / system) |
| Animation | `framer-motion` |
| QR codes | `qrcode.react` |
| Icons | `@hugeicons/react` + `@hugeicons/core-free-icons` (primary), `lucide-react` (secondary) |
| Server state | **TanStack React Query v5** |
| Client/global state | **Redux Toolkit** + `react-redux` + `redux-persist` (localStorage) |
| Forms | `react-hook-form` + `zod` v4 via `@hookform/resolvers` |
| HTTP | `axios` (single configured instance) |
| Charts | `chart.js` + `react-chartjs-2` |
| Dates | `date-fns`, `react-day-picker` |
| Notifications | `react-hot-toast` |
| Fonts | **Plus Jakarta Sans** (`--font-sans`) and **Outfit** (`--font-display`) via `next/font/google` |

---

## 3. Directory Structure & Conventions

```
src/
  app/
    (auth)/                 # login, register, otp-verification, forgot/reset password
      _api/index.ts         # raw axios auth calls (no bearer token needed)
      _components/
    (dashboard)/
      layout.tsx            # Sidebar + MobileSidebar + Navbar + MaxWidthWrapper
      providers.tsx         # QueryProvider + AuthProvider composition
      _components/          # shared dashboard widgets (charts, tables, cards, side-modal)
      apps-tools/
        <module>/
          page.tsx
          layout.tsx        # wraps page in the module's FormProvider
          _components/      # tables, cards; _components/steps/, _components/modals/
          _constants/       # DEFAULT_<X>_VALUES, step name arrays
          _context/         # form context built with createFormContext()
          _schemas/         # zod schemas + inferred types
          _types/           # response types
          _hooks/, _utils/  # module-local helpers
      page.tsx              # Overview
      settlement/, billing/, admin/
      settings/
        layout.tsx          # pill tab bar across settings sub-pages
        compliance/         # status summary + 4-step KYC wizard (own context/schemas/constants)
        preferences/, security/, payments/, integrations/, legal/
    waiter/                 # waiter app; layout reuses (dashboard)/providers
    discover/               # public Discover; own QueryProvider layout
    preview/                # public consumer-facing pages (events, places, menu); own QueryProvider
    layout.tsx, globals.css
  components/               # cross-app components
    ui/                     # design-system primitives
    ui/forms/               # FormInput, FormSelect, FormMultiSelect, FormArrayInput, FormUploadImage
    modals/
  constants/                # index.ts (apps list, months, API base URLs), sidebar.tsx
  data/                     # countries.ts etc.
  hooks/                    # ALL data-fetching hooks live here
  lib/
    api/axios-client.ts     # configured axios instance
    api/handle-axios-error.ts
    create-form-context.tsx # form-context factory
    permissions.ts          # roles, permission keys, path rules, landing path
    chart-theme.ts          # chart.js registration + token-based chart options
    upload-files.ts, utils.ts
  mocks/                    # sample-data fixtures; imported ONLY by hooks (section 8.1)
  providers/                # redux-provider, query-provider, auth-provider, theme-provider
  store/                    # index.ts, selectors.ts, slices/{authSlice,appsSlice}.ts
  types/index.d.ts
  utils/index.ts            # encrypt/decrypt, formatAmount, formatNaira, fmtDate, fmtDateTime,
                            # timeAgo, rangeFor, exportCsv, ...
```

**Naming:** files are kebab-case. Route-private folders are prefixed with `_`
(`_components`, `_schemas`, …) so Next.js does not treat them as routes.

---

## 4. Backend Services

All responses use the envelope `{ status, message, data }` — always unwrap `response.data.data`.
Paginated list endpoints nest one level deeper (`response.data.data.data`), returning
`{ count, currentpage, data: T[], lastpage, nextpage, prevpage }`.

| Constant (`@/constants`) | Base URL | Used for |
|---|---|---|
| `SERVER_URL` | `https://spinstrip-merchant-gateway.fly.dev/api/v1` | All authenticated merchant endpoints |
| `USER_ACCOUNT_URL` | `https://spinstrip-user-account.fly.dev/api/v1` | Wallet / user account |
| `EVENTS_SERVER_URL` | `https://spinstrip-events.fly.dev/api/v1` | Public event registration & payment |

> These are hard-coded constants, **not** environment variables.

### 4.1 Endpoint inventory

**Auth & users** (raw `axios`, no token)

```
POST   /auth/login                       { emailOrUsername, password } -> { accessToken, refreshToken, user }
POST   /users                            { email, fullName, phoneNumber, username, password, confirmPassword }
POST   /users/verify-email               { email, otp }
POST   /users/resend-email-verification  { email }
POST   /auth/forgot-password             { email }
POST   /auth/reset-password              { email, otp, newPassword, confirmPassword }
POST   /auth/refresh-token               { refreshToken }        (called by the interceptor)
```

**KYC / compliance**

```
GET    /kyc/merchant/status              -> KYCData
GET    /kyc/business/categories          -> { categories: {id,name}[] }
POST   /kyc/merchant                     complete KYC payload
POST   /kyc/upload/merchant              multipart document upload
```

**Events**

```
GET    /events                           paginated (search, status, sortBy, page)
GET    /events/stats                     -> { total, active, inactive, upcoming, past }
GET    /events/{id}
PATCH  /events/{id}
POST   /events
POST   /events/{id}/media                multipart: mediaType=images, files[]
DELETE /events/{id}/media
GET    /events/{id}/registrations?page&limit&status
GET    /events/public/{id}               unauthenticated public event
POST   {EVENTS_SERVER_URL}/events/public/{id}/register   public ticket checkout
```

**Places**

```
GET    /places                           paginated
GET    /places/unclaimed                 paginated (claim flow search)
POST   /places/{id}/claim
GET    /places/{id}
GET    /places/{id}/facilities           -> { facilities: Facility[] }
GET    /places/{id}/appointments         paginated bookings
GET    /places/{id}/visitors             paginated
GET    /places/public/{id}
POST   /places
PATCH  /places/{id}
POST   /places/{id}/media                multipart
POST   /places/facilities                create facility
POST   /places/facilities/{id}/images    multipart
GET    /places/customers                 paginated (service, sort) — Customers module
```

**Inventory**

```
GET    /inventory/products               paginated (stockStatus=lowStock for the low-stock bar)
GET    /inventory/products/stats         -> { totalItems, inStock, lowStock, outOfStock, recentlyUpdated }
GET    /inventory/products/{id}
POST   /inventory/products
PATCH  /inventory/products/{id}          (also used for restock: { quantity })
POST   /inventory/products/{id}/duplicate
POST   /inventory/products/{id}/images   multipart
DELETE /inventory/products/{id}/images
GET    /inventory/catalogs
POST   /inventory/catalogs
```

**Menu**

```
GET    /menu/menu-items                  paginated (search, status, category, isFeatured)
POST   /menu/menu-items
PATCH  /menu/menu-items/{id}
DELETE /menu/menu-items/{id}
POST   /menu/menu-items/{id}/images      multipart
POST   /menu/menu-items/{id}/duplicate
PATCH  /menu/menu-items/{id}/toggle-hidden
```

**Deals**

```
GET    /deals/subscriptions              -> { subscribed: boolean }
PATCH  /deals/subscriptions/activate
GET    /deals/stats                      -> { active, archived, canceled, inactive, total }
GET    /deals/campaigns                  paginated
POST   /deals/campaigns
GET    /deals                            paginated (status filter)
POST   /deals
PATCH  /deals/{id}
PATCH  /deals/{id}/status
```

**Wallet** (`USER_ACCOUNT_URL`)

```
GET    /auth/me                          current user (useMe syncs it into Redux)
GET    /wallet
POST   /wallet   { currency, customer_email, customer_mobile, customer_name, bvn, nin, address, dob }
GET    /banks
GET    /banks/resolve                    account number + bank code -> account name
GET    /bank-accounts                    settlement accounts
POST   /bank-accounts
PATCH  /bank-accounts/{id}               { label?, isDefault? }
DELETE /bank-accounts/{id}
```

**Not built yet.** Endpoints the sample-data features need are listed, with suggested shapes, in
`docs/backend-endpoints-needed.md`.

---

## 5. HTTP Client

`src/lib/api/axios-client.ts` exports a single configured axios instance (default export `api`).

- `baseURL: SERVER_URL`, `timeout: 100000`, `Content-Type: application/json`
- **Request interceptor** reads `accessToken` directly from the Redux store
  (`store.getState().auth`) and sets `Authorization: Bearer <token>`.
- **Response interceptor** on `401` (once, guarded by `originalRequest._retry`):
  1. POST `/auth/refresh-token` with the stored refresh token.
  2. On success dispatch `setTokens({ tokens, user })` and replay the original request.
  3. On failure (or no refresh token) dispatch `logout()`, toast, and redirect to `/login`.
- To hit a non-default service, pass an **absolute URL**: `api.get(USER_ACCOUNT_URL + "/wallet")`.
- `handleAxiosError(error)` returns `error.response.data.message` or a generic fallback.

---

## 6. Authentication & Session

- Redux slice `auth` (`src/store/slices/authSlice.ts`) holds
  `{ user, accessToken, refreshToken, isAuthenticated, isLoading, error }`.
- `loginUser` async thunk calls `loginApi`; if the API replies "Email not verified…" it
  auto-calls `resendToken` before rejecting.
- Tokens persist to `localStorage` under `spinstrip_at`, `spinstrip_rt`, `spinstrip_user`,
  obfuscated with `encrypt`/`decrypt` in `src/utils`
  (**base64 + a static salt `"spinstrip2024"` — obfuscation, not real encryption**).
- The store is additionally wrapped in `redux-persist` (`key: "root"`, whitelist `["auth", "apps"]`).
- Actions: `logout`, `clearError`, `updateUser`, `setTokens`.
- `UserData`: `{ email, fullName, userName, role, avatarUrl?, profilePicture?, emailVerified?,
  phoneNumber?, dob?, complianceStatus?, profiles?, capabilities?, dashboardPermissions? }`.
  `profiles` are SpinStrip platform profiles (USER / MERCHANT / ADMIN), **not** merchant roles.
  `capabilities` is the login response's `permissions` block (`canCreateWallet`, …).
- `useMe()` refreshes the user from `GET {USER_ACCOUNT_URL}/auth/me`.
- The refresh interceptor accepts both the enveloped and the bare refresh response.

### Roles and permissions (`src/lib/permissions.ts`)

- Roles: `owner` (everything), `admin_ops` (only `user.dashboardPermissions`), `waiter` (only `/waiter`).
  `resolveRole(user)` reads `user.role`; anything unknown is treated as `owner`, which is every
  account today because the backend has no merchant team accounts yet.
- Permission keys: `overview, menu, places, events, inventory, deals, customers, wallet, settlement,
  billing, settings`. `requirementForPath()` maps routes to keys; `/admin` is owner-only.
- `usePermissions()` → `{ role, roleLabel, isOwner, permissions, can, canAccessPath, landingPath }`.
  `<PermissionGate>` in the dashboard layout redirects to `landingPath` (waiters to `/waiter`), and
  login redirects there too. The sidebar hides items the user can't open.
- `AuthProvider` (client-side route guard) redirects unauthenticated users to `/login`
  and authenticated users away from `/login`, showing a spinner while resolving.

`ComplianceStatus = "REJECTED" | "PENDING" | "ACTIVE" | "UNVERIFIED"`.

---

## 7. Apps State

`appsSlice` seeds `appsState` from the static `apps` array in `src/constants/index.ts`
(`{ [appName]: { isActive, default } }`) and holds `searchQuery` + `categoryFilter`.
Actions: `toggleApp`, `setAppState`, `setSearchQuery`, `setCategoryFilter`, `resetAppsState`,
`bulkUpdateApps`. `selectFilteredApps` (in `store/selectors.ts`) drives the catalogue page.
Filters: All / Free / Paid / Default Apps / Community Apps.

Each app entry: `{ name, description, isActive, default?, amount?, route, icon, integrated?, publisher? }`.
The catalogue badge is derived: `default` → "Default", active → "Integrated", otherwise "Available"
(the `integrated` field is no longer displayed). `publisher` defaults to "SpinStrip".
Sidebar app links show only while the app is active.
Apps priced at 288–588 are "paid"; `default: true` apps are free/always-on.
Several apps (Chat, Groups/Community, Socials, Reviews, Payment Method, Memberships, Ads)
are commented out — reserved for future releases.

---

## 8. Data-Fetching Convention (MANDATORY)

> **Never inline `useQuery` or axios calls in a component.** Every endpoint gets a reusable
> hook in `src/hooks/use-<domain>.ts`, even with only one consumer.

Rules, taken from `src/hooks/use-event-registrations.ts` (the reference implementation):

1. Export all response interfaces **from the hook file**; components import types from the hook
   and never redeclare them.
2. `useQuery` with a `queryKey` containing **every** request parameter (id, page, limit, filters).
3. Accept a single **options object**, not positional args. Gate with `enabled: !!requiredParam`.
4. `try/catch` inside `queryFn`; `console.log` the error and return a safe fallback
   (`null` / `[]` / zeroed stats).
5. Return a **named object with defaults applied** (`registrations: data?.registrations ?? []`)
   plus `isLoading`, `error`, `refetch` — never the raw query result.
6. JSDoc the hook with the endpoint it wraps and any cheap-usage tips
   (e.g. "pass `{ limit: 1 }` to fetch only stats").
7. For paginated lists use `useServerPagination` rather than a new query.
8. Derive, do not duplicate: `useComplianceStatus()` reuses `useKyc()`'s cache instead of refetching.

### Existing hooks

Real API hooks:

| Hook file | Exports |
|---|---|
| `use-events.ts` | `useEvent`, `useEventStats`, `usePublicEvent`, `useRecentEvents`; types `EventStatsResponse`, `PublicEvent`, `PublicTicketTier` |
| `use-event-registrations.ts` | `useEventRegistrations`; types `EventRegistration`, `TicketTransaction`, `RegistrationStats`, `RegistrationsPagination` |
| `use-places.ts` | `usePlace`, `usePlaceFacilities`, `usePublicPlace`, `usePlacesCount`; type `PublicPlace` |
| `use-inventory.ts` | `useInventoryStats`, `useInventoryProducts`, `useInventoryItem` |
| `use-catalogs.ts` | `useCatalogs`; types `Catalog`, `CatalogCategory` |
| `use-deals.ts` | `useDealSubscription`, `useDealStats`, `useDealCampaigns`, `useActiveDeals` |
| `use-menu.ts` | `useMenuItems`, `useMenuItemsCount`, `useFeaturedMenuItems`, `useMenuCategories`, `useMenuItemActions`, `useTopMenus` (order counts sample), `usePublicMenu` (sample when signed out) |
| `use-customers.ts` | `useCustomers` (`GET /places/customers`) |
| `use-kyc.ts` | `useKyc({ enabled })`, `useBusinessCategories`; types `KYCData`, `UBO` |
| `use-compliance.ts` | `useComplianceStatus` (derived from `useKyc`: status, steps, percent, adminNotes), `complianceSteps` |
| `use-wallet.ts` | `useWallet` — wallets query + `createWallet(kyc)` flow |
| `use-bank-accounts.ts` | `useBanks`, `useResolveBankAccount`, `useBankAccounts` (list, create, set default, delete) |
| `use-me.ts` | `useMe` (`GET /auth/me` → Redux) |
| `use-permissions.ts` | `usePermissions` |
| `use-server-pagination.ts` | URL-synced pagination (`?page=`) + query |
| `use-fetch.ts` | `useFetch` / `useHandleRequest` for one-off mutations |
| `use-optimistic-delete.ts` | optimistic `DELETE {endpoint}/{id}` |
| `use-debounce.ts`, `use-redux-auth.ts`, `use-redux-apps.ts`, `redux.ts` | utility hooks |

### 8.1 Sample-data hooks

Features with no backend endpoint yet read fixtures from `src/mocks/` through these hooks. Rules:
fixtures are imported **only** by hooks; hooks keep the same return shape a real call would have
(swap the body, not the consumers); the UI marks the data with `SampleDataBadge` or
`<StatCard sample>`; existing real calls are never replaced or changed.

| Hook file | Sample features | Fixtures |
|---|---|---|
| `use-overview.ts` | `useOverview` money/customer analytics (counts are real) | `mocks/transactions.ts` |
| `use-settlements.ts` | `useSettlements` | `mocks/transactions.ts` |
| `use-billing.ts` | `useBilling` invoices, card (subscriptions from the real catalogue) | — |
| `use-team.ts` | `useTeam` | in memory |
| `use-menu-tables.ts` | `useMenuTables`, `useTableDetail`, `useSeatGuests`, `useTableByToken`, `useWaiterFloor` | `mocks/menu-tables.ts` |
| `use-place-extras.ts` | taglines, facility removal, manual visitors, booking status, reviews (`usePlaceEvents` is real) | `mocks/places.ts` |
| `use-event-extras.ts` | delete event, via-deal count | `mocks/events.ts` |
| `use-deal-extras.ts` | deal performance | `mocks/deals.ts` |
| `use-inventory-extras.ts` | `useItemHistory` (`useRestockItem`, `useLowStockItem` are real) | `mocks/inventory.ts` |
| `use-wallet-extras.ts` | `useWalletActivity`, `SAMPLE_WALLET_BALANCE` | `mocks/transactions.ts` |
| `use-customer-extras.ts` | `useCustomerSpend` | seeded per customer |
| `use-settings-extras.ts` | `usePreferences`, `useChangePassword` | localStorage |
| `use-discover.ts` | `useDiscover` | `mocks/discover.ts` |

`mocks/utils.ts` provides seeded random helpers (`seededRandom`, `between`, `pick`, …),
`mockResponse` (delayed promise), `createMockCollection` (in-memory CRUD) and
`createPersistentMap` (localStorage-backed map). Seeds are fixed so numbers are stable across reloads.

### `useServerPagination<T>` contract

```ts
useServerPagination<T>({ queryKey, endpoint, initialPage?, searchQuery?, filters?, enabled? })
// -> { items, currentPage, totalPages, totalItems, nextPage, prevPage,
//      isLoading, error, refetch, handlePageChange }
```

Current page is read from and written to the URL `?page=` via `useRouter` / `useSearchParams`.
Server response shape: `{ count, currentpage, data, lastpage, nextpage, prevpage }`.

### Reference hook (copy this shape)

```ts
/**
 * Fetches X from `GET /x/{id}`.
 */
export function useX({ id, page = 1, limit = 15, status }: UseXOptions) {
  const { data, isLoading, error, refetch } = useQuery<XData | null>({
    queryKey: ["x", id, page, limit, status ?? "All"],
    queryFn: async () => {
      try {
        const response = await api.get(`${SERVER_URL}/x/${id}?page=${page}`);
        return response.data.data ?? null;
      } catch (error) {
        console.log("Error fetching x:", error);
        return null;
      }
    },
    enabled: !!id,
  });

  return { items: data?.items ?? [], isLoading, error, refetch };
}
```

---

## 9. Form Architecture

### `createFormContext<T>()` — `src/lib/create-form-context.tsx`

A factory that returns `{ Provider, useFormContext }` for a module's create/edit flow.

Config:

```ts
{ name, schema, defaultValues, steps, queryKeys?, onSubmit?, stepValidation?, localStorageKey? }
```

The returned context (`BaseFormContextType<T>`) provides:

- `form` (react-hook-form, `zodResolver`, `mode: "onChange"`)
- `loading` / `setLoading`
- `searchQuery` / `setSearchQuery` / `debouncedSearch`, `statusFilter`, `sortBy` (+ setters)
- `action` / `setAction` (`ActionType` = add | edit | null) for modal state
- `currentStep` / `setCurrentStep`, `steps`, `handleNext`, `handlePrevious`
- `handleFieldChange`, `resetForm`

Modules that need custom submit logic wrap the base provider in an **extended provider**
(see `event-planner/_context/index.tsx`) that adds e.g. `submitEvent()` and `handleReset()`.

### Standard submit sequence

1. `flushPendingArrayInputs()` (and module-specific flushers such as `flushPendingTicketInputs()`)
   to commit un-blurred array/tag inputs.
2. `form.trigger([...fields])` for targeted validation; toast on failure.
3. Build the payload at submit time from `form.getValues()` — **never at render time**.
4. `POST` to create or `PATCH /{id}` to update, chosen by presence of `id`.
5. On `status === "success"`, upload files separately as `multipart/form-data`
   (`uploadFiles` / `uploadNamedFiles` in `src/lib/upload-files.ts`, or an inline `FormData`).
   A failed upload toasts "<Entity> created but failed to upload images" — it does not fail the create.
6. `toast.success(message || fallback)`, reset the form, `refetch()`, and
   `queryClient.invalidateQueries({ queryKey: [...] })`.
7. `catch` → `handleAxiosError` → toast. `finally` → `setLoading(false)`.

### Multi-step wizards

- Inventory: `["General Info", "Pricing", "Stock Management", "Visibility"]`
- Menu: `["General Info", "Media", "Configuration", "Deal Settings"]`
- Places (new): General Info → Location & Verification → Operating Hours → Safety Policies
- Places (claim): Find Place → General Info → Safety Policies
- Compliance/KYC: Survey → About Business → Upload Documents → UBO
- Event Planner: single step (`["Event Details"]`)

### Form components (`src/components/ui/forms`)

`FormInput`, `FormSelect`, `FormMultiSelect`, `FormArrayInput`, `FormUploadImage`.
Use `mode: "onChange"` whenever a submit button disables on `formState.isValid`.

---

## 10. Domain Models (zod schemas)

### Event — `apps-tools/event-planner/_schemas`

```
name, description, frequency: ONE_OFF|RECURRING,
recurringPattern?: WEEKLY|BIWEEKLY|MONTHLY|CUSTOM, customRecurrenceDays?,
startDate, endDate, startTime, endTime, timezone,
location, city, state, country, contactPhone, contactEmail,
expectedGuests (>=1), soldOutThreshold?, isFeatured?,
status?: ACTIVE|INACTIVE|DRAFT,
dealId?, formId?, placeId?,
ticketTiers?: { id?, name, description?, price, quantityAvailable, sortOrder? }[],
files: File[] (>=1 on create), images?: string[],
totalImpressions?, totalTransactions?, dropOffRate?, tagline?,
ticketSalesBreakdown?: { ticketTierId, ticketTierName, status, count, totalAmount }[]
```

Dates and times are merged via `mergeDateTime(date, time)` before submit.
A `placeId` substitutes for the manual location fields.

`PublicEvent` (from `GET /events/public/{id}`) adds `id, userId, placeId, dealId, formId,
impressions, totalImpressions, totalRegistrations, isFeatured, videos, createdAt, updatedAt, deletedAt`.

### Place — `apps-tools/places/_schemas`

```
name, description, address, landmarks?, city, state, country, longitude, latitude,
placeType: HOTEL | SHORT_LET | BEACH_RESORT | RECREATION_CENTER | BUSINESS_HUB | STADIUM |
           SPORT_FACILITY | COUNTRY_CLUB | SPORT_RECREATION_CLUB | HOSPITAL | CLINIC |
           PHARMACY | SPA_WELLNESS_CENTER | GYM | STUDIO | AIRPORT | RAIL_STATION |
           ROAD_TRANSPORT_HUB | WATER_TRANSPORT_HUB | RELIGIOUS_CENTRE | POLICE_STATION |
           COURT | MILITARY_BARRACKS | BANK | STRIP_CLUB,
emails: string[] (>=1), phoneNumbers: string[] (>=1),
coverImage: File, website?,
status?: PUBLISHED|UNPUBLISHED|DRAFT|REJECTED, rejectionReason?,
documents (File + matching *Url string): environmentalSafetyPolicy, privacyPolicy,
           disclaimers, ownershipDocument, ownershipVideo,
operatingHours?: { schedule: {day,isOpen,openingTime,closingTime}[],
                   holidays: {name,date,isRecurring,isOpen,openingTime,closingTime}[] },
facilities?: Facility[], views?, metadata?: { amenities, rating, category }
```

**Facility:** `{ placeId, name, facilityCategory, description, fees: {name, amount, description?}[],
files?, accessType?: OPEN|PRICED, isGated?, images? }`

Default operating hours are Monday–Sunday, `08:00`–`18:00`, `isOpen: true`.

### InventoryProduct — `apps-tools/inventory/_schemas`

```
catalogId?, name, description, categoryId, tags[] (>=1), brand?,
productType: DEFINITE|INDEFINITE,
sellingPrice, costPrice, taxPercentage (0-100),
quantity, maxStockLevel, minStockLevel (percent, 0-100),
status: DRAFT|ACTIVE|INACTIVE|ARCHIVED, showInMenu, isFeatured,
variant?: { color, size, dimensions, shape, form },
slotConfig?: { slotCapacityPerCycle, cycleType: DAILY|WEEKLY|MONTHLY,
               cycleStartTime "HH:MM", excludedDays?, excludedDates? "YYYY-MM-DD" },
dealIds?, files?, media?, category, catalog,
inventory: { stockLevel, stockStatus: IN_STOCK|LOW_STOCK|OUT_OF_STOCK,
             quantity, maxStockLevel, minStockLevel },
averageRating?, totalSales?, totalViews?, discountPercentage?, reorderThreshold?
```

Refinements: `sellingPrice >= costPrice`; `quantity <= maxStockLevel`.
**Catalog:** `{ name, description, industry?, tags[], categories: {name, description, tags[]}[] }`.

### Menu — `apps-tools/menu/_schemas`

```
name, description, price, quantity, category,
status: DRAFT|AVAILABLE|PENDING|UNAVAILABLE, tag?, isFeatured,
availabilityType: ALWAYS_AVAILABLE|SCHEDULED|UNAVAILABLE,
availabilitySchedule?: { days[], startTime, endTime },
nutritionAllergens?: { name, type: allergen|nutrition }[],
addOns?: { name, price }[], extras?: { name, price }[], sizeOptions?: string[],
dealId?, files?, images?, code?, isHidden?, rating?
```

### Deal — `apps-tools/deals/_schemas`

```
campaignId, name, description, discountPercentage (1-100), maximumThreshold?,
startDate, endDate, productIds[], products: InventoryProduct[],
status: DRAFT|ACTIVE|PAUSED|EXPIRED, isFeatured
```

Refinement: `endDate` must be after `startDate`.
**Campaign:** `{ id, name, description, status?, startDate, endDate }`.
Deals are **subscription-gated** — `useDealSubscription()` decides whether the module is usable;
`PATCH /deals/subscriptions/activate` unlocks it. Deals also attach to inventory products and
menu items via `dealIds` / `dealId`.

### KYC — `settings/compliance/_schemas`

Four merged step schemas → `completeKycSchema`:

1. **Survey:** `businessCategory, customerBase, businessModel, monthlyProcessingAmount`
2. **Business info:** `businessSubCategory, businessDescription, countryOfIncorporation,
   companyName, companyWebsite?, registrationNumber, logo?`
3. **Company documents:** `certificateOfIncorporation, articlesOfAssociation, proofOfAddress,
   bankStatement` (stored as uploaded file keys/URLs)
4. **UBOs:** array of `{ fullName, email, address, phoneNumber,
   identityMetadata: { bvn (11 digits), nin (11 digits) }, bankStatement }`

`KYCData` (server) additionally returns `status`, `adminNotes`, `expiryDate`, the `*Url`
document fields, `logoUrl`, `ubos[]`, and timestamps. The Wallet module reads
`ubos[0].identityMetadata.{bvn,nin}`, `ubos[0].address` and `countryOfIncorporation`
(mapped to a currency via `src/data/countries`) to create a wallet.

### Event registration (public checkout)

```
EventRegistration { id, eventId, firstName, lastName, email,
  marketingConsentEvents, marketingConsentNews, totalAmount, paymentProvider,
  status, transactionRef, userId, ticketTransactions[] }
TicketTransaction { id, eventId, ticketTierId, transactionRef, amount, quantity,
  status, initiatedAt, completedAt, registrationId, ticketTier? }
RegistrationStats { totalRegistrations, completedRegistrations, totalRevenue,
  ticketTiers: { id, name, price, sold, available }[] }
RegistrationsPagination { page, limit, total, totalPages, hasNext, hasPrev }
```

---

## 11. Design System

### Colors and theme

Every colour is an HSL token in `src/app/globals.css` (`:root` = light, `.dark` = dark), consumed
by `tailwind.config.ts` as `hsl(var(--x) / <alpha-value>)` so opacity modifiers work
(`bg-primary/10`). Tokens: `background, foreground, card, popover, primary (#6932E2), primary-accent,
secondary, muted, accent, destructive, border, input, ring, neutral-accent, sidebar-*, chart-1..6`.
Legacy aliases (`primary-text`, `secondary-text`, `neutral`, `background-light`, `font-sf-pro`) map
onto these tokens so older screens keep working.

- **Dark mode:** `next-themes` (`src/providers/theme-provider.tsx`, class strategy, light / dark /
  system). It covers the dashboard, `/waiter` and `/discover`; `/preview/*` and the auth pages are
  forced to light. Toggles: `ThemeToggle` (topbar, waiter, Discover) and Settings → Preferences.
- Utilities: `.brand-gradient`, `.brand-gradient-soft`, `.brand-text-gradient`, `.card-hover`,
  `.no-scrollbar`.
- Fonts: `font-sans` (Plus Jakarta Sans) for body, `font-display` (Outfit) for headings and totals.
- House style: `rounded-2xl` bordered cards (`border bg-card`), pill buttons and filters
  (`rounded-full`), icon chips (`bg-primary/10 text-primary`), framer-motion fade/slide-in on entry.
- Charts: `src/lib/chart-theme.ts` (`lineChartOptions`, `areaDataset`, `doughnutChartOptions`,
  `chartPalette`, `themeColor`). Call `useChartThemeKey()` and pass it as the chart `key` so colours
  update on theme change.

### Status pills

`<StatusPill status="…" label? tone?>` (`src/components/status-pill.tsx`) maps backend and prototype
statuses (ACTIVE, PENDING, REJECTED, COMPLETED, FAILED, …) to success / warning / danger / info /
muted tones that work in both themes.

### Toasts

`react-hot-toast`, `position="top-center"`, `duration: 3000`, styled from the tokens
(`hsl(var(--card))` background, `hsl(var(--foreground))` text, border).

### Loading & empty states

- Lists and cards: `Skeleton` (`@/components/ui/skeleton`) rows/blocks.
- Page-level: `Loader` (`@/components/loader`).
- Inline: `<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />`.
- Empty: `EmptyState` (`@/components/empty-state`), often paired with `/icons/work-in-progress.svg`.

### Currency & dates

- `formatNaira(value, compact?)` from `@/utils` (compact gives ₦1.2M); `formatAmount()` (`en-NG`,
  2 decimal places) in older screens.
- `fmtDate`, `fmtDateTime`, `timeAgo`, `rangeFor(preset)`; `exportCsv(filename, headers, rows)`.
- `formatISODate()` → `DD/MM/YYYY`; `formatDateDisplay()` for human-readable dates.

### Shared components

Layout: `Sidebar`, `MobileSidebar`, `Navbar`, `ComplianceBanner`, `PermissionGate`,
`MaxWidthWrapper`. Page building blocks: `PageHeader`, `Breadcrumb`, `StatCard` (`index`, `accent`,
`sample`), `ChartCard`, `StatusPill`, `EmptyState`, `SampleDataBadge`, `DateRangeControl`,
`PillGroup`, `StepProgress`, `ChipsInput`, `Field`, `ThemeToggle`. Older shared pieces: `Modal`,
`SideModal`, `SearchBar`, `Dropdown`, `SelectDropdown`, `CountrySelectDropdown` (optional controlled
`value`), `CategorySelectWithAdd`, `MultiSelectWithTooltip`, `PaginationButton`, `FileUpload`,
`ItemCard`, `DeleteModal`. New dialogs and side panels use the Radix `Dialog` / `Sheet` primitives.

### Navigation (`src/constants/sidebar.tsx`)

`navigationSections` in three groups, each item with an optional `permission`, `app` (shown only
while that app is active) or `ownerOnly`:

- **General:** Overview `/`, Apps & Tools `/apps-tools`
- **Apps:** Menu, Places, Events, Deals, Inventory, Wallet, Customers
- **Business:** Settlement `/settlement`, Billing `/billing`, Admin & Roles `/admin` (owner),
  Settings `/settings`

The active item uses an icon chip with a sliding `bg-primary-accent` pill (framer-motion `layoutId`).

---

## 12. File Uploads

Two helpers in `src/lib/upload-files.ts`, both `multipart/form-data` via the `api` instance:

- `uploadFiles({ files, endpoint, entityName, isUpdating?, fieldName = "files" })` —
  many files into one field.
- `uploadNamedFiles({ files: Record<string, File>, endpoint, entityName, isUpdating? })` —
  distinct files into distinct fields (cover image, policy documents…).

Both return `boolean`, toast on failure, and never throw — entity creation succeeds
independently of media upload. KYC documents upload through `POST /kyc/upload/merchant`
(`src/components/file-upload.tsx`).

---

## 13. Provider Tree

```
<html suppressHydrationWarning><body>
  <ReduxProvider>               {/* redux store + PersistGate */}
    <ThemeProvider>{children}</ThemeProvider>   {/* next-themes; light forced on /preview + auth */}
    <Toaster />
  </ReduxProvider>
</body></html>

(dashboard)/layout   -> Providers (AuthProvider + QueryProvider) -> Sidebar, Navbar,
                        ComplianceBanner, PermissionGate, template.tsx (page fade)
waiter/layout        -> the same Providers, no sidebar
preview/, discover/  -> QueryProvider only (public)
```

Each module layout wraps its page in the module's `FormProvider`.

---

## 14. Rules for New Code

1. **Hooks, always.** New endpoint → new/extended `src/hooks/use-<domain>.ts`. No `useQuery`
   or `axios` inside a component.
2. **Types live with the hook.** Export interfaces from the hook file; import them in consumers.
3. **Use `api` from `@/lib/api/axios-client`** — never a bare `axios` call (except the
   unauthenticated auth endpoints in `(auth)/_api`).
4. Unwrap `response.data.data`; for paginated lists, `response.data.data.data`.
5. Errors: catch inside `queryFn`, `console.log`, return a safe fallback. For mutations use
   `handleAxiosError` + `toast.error`.
6. Forms: `react-hook-form` + `zodResolver` + the `FormInput` family; `mode: "onChange"` when a
   button depends on `formState.isValid`. Build payloads at submit time.
7. Multi-step flows go through `createFormContext`, not bespoke state.
8. Invalidate related query keys after a successful mutation; keep query keys parameter-complete.
9. Keep route-private code under `_components` / `_schemas` / `_constants` / `_context` / `_types`;
   promote to `src/components` or `src/hooks` only when genuinely shared.
10. Reuse the design tokens above — no ad-hoc hex colors, `bg-white` or `text-gray-*` (they break
    dark mode). White is fine only on gradients and behind QR codes.
11. **Never change a working integration to add a feature.** Existing API calls, payloads, hooks and
    submit logic stay as they are. A feature without a backend endpoint gets its own hook (usually
    `use-<domain>-extras.ts`) backed by `src/mocks/`, a "Sample" label in the UI, and an entry in
    `docs/backend-endpoints-needed.md`.
12. New pages: `Breadcrumb` + `PageHeader`, `Skeleton` while loading, `EmptyState` when empty, and a
    layout that works at phone width.

---

## 15. Known Gaps / Caveats

- API base URLs are hard-coded constants; there is no `.env` configuration.
- Token "encryption" is base64 + a static salt — obfuscation only.
- The auth guard is client-side (`AuthProvider`); there is no middleware-based route protection.
- The features in section 8.1 run on sample data until the endpoints in
  `docs/backend-endpoints-needed.md` exist. Merchant team accounts don't exist on the backend, so
  every user resolves to `owner`.
- Chat, Groups/Community, Socials, Reviews, Payment Method, Memberships and Ads are commented out
  of the apps catalogue.
- Known, unfixed integration bugs: the place edit PATCH omits operating hours, metadata and video
  URL; the "Other" place type fails the `placeType` enum; the public place checkout shows a fixed
  ₦200,000; Inventory's "Indefinite" radio sends `INFINITE` while the schema expects `INDEFINITE`;
  the Wallet POS QR is static and Withdraw doesn't call an API.
- Pagination shapes are not uniform: `useServerPagination` expects
  `{ count, currentpage, lastpage, nextpage, prevpage }` while `useEventRegistrations` receives
  `{ page, limit, total, totalPages, hasNext, hasPrev }`.
- App enable/disable state is local (Redux + localStorage) only — it is not synced to the server.
- There is no test suite and no CI config. `next.config.ts` ignores type and lint errors during
  build; three pre-existing type errors remain (`upload-images.tsx`, `places/_context/index.tsx`,
  `form-array-input.tsx`).
