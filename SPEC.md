# SpinStrip Merchant Dashboard — Technical Specification

> Reference specification for the SpinStrip merchant web app. Written to be handed to
> another model/engineer as the authoritative description of what this app is, how it is
> built, and what conventions any new code must follow.

---

## 1. Product Overview

**SpinStrip Merchant Dashboard** is a Next.js web application that lets business owners
("merchants") run their business on the SpinStrip consumer platform. Merchants sign up,
complete KYC/compliance, then enable modular "Apps/Tools" — each a self-contained business
capability (Wallet, Event Planner, Menu, Inventory, Places, Deals, Customers).

Currency is **Nigerian Naira (₦)**. Amounts arrive from the API as strings.

- App name: `spinstrip` · dev server on port **3001** (`next dev -p 3001`)
- Production host: `https://merchant.spinstrip.com`
- Metadata title template: `"%s | SpinStrip Merchant"`

### Modules

| Module | Route | Purpose |
|---|---|---|
| Apps/Tools catalogue | `/apps-tools` | Browse, search, filter, and toggle apps on/off |
| Wallet | `/apps-tools/wallet` | Create wallet, deposit/withdraw, POS, settlement account, transaction history, revenue chart |
| Event Planner | `/apps-tools/event-planner` | Create/manage events, ticket tiers, media, impressions |
| Event Sales & Registrations | `/apps-tools/event-planner/sales-registrations` | Paginated registrant table, revenue/tier stats, charts |
| Menu | `/apps-tools/menu` | Menu items with pricing, availability schedules, add-ons/extras, allergens |
| Inventory | `/apps-tools/inventory` | Products, catalogs/categories, stock levels, variants, slot booking config |
| Inventory item detail | `/apps-tools/inventory/item?id=` | Single product view + duplicate |
| Places | `/apps-tools/places` | Create a new place or claim an existing one |
| Place detail | `/apps-tools/places/[id]` | Facilities, room inventory, operating hours, bookings, visitors, reviews |
| Deals | `/apps-tools/deals` | Subscription-gated discount campaigns; performance/revenue charts |
| Deal archives | `/apps-tools/deals/archives` | Archived deals |
| Settings | `/settings` | Account settings |
| Compliance / KYC | `/settings/compliance` | 4-step KYC wizard |
| Overview | `/` | Dashboard home (coming soon) |
| Billing | `/billing` | Coming soon |

### Public preview routes (unauthenticated, consumer-facing)

| Route | Purpose |
|---|---|
| `/preview/events?id=<eventId>` | Public event landing page + ticket checkout |
| `/preview/events/success` | Post-payment success |
| `/preview/places?id=<placeId>` | Public place landing page + booking checkout |

### Auth routes

`/login`, `/register`, `/otp-verification`, `/forgot-password`, `/reset-password`

---

## 2. Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js **15** (App Router), React **19** |
| Language | TypeScript 5; `@/*` path alias maps to `src/*` |
| Styling | Tailwind CSS 3.4 + `tailwindcss-animate`, `class-variance-authority`, `clsx`, `tailwind-merge` |
| UI primitives | Radix UI (checkbox, dropdown-menu, label, popover, radio-group, select, slot, switch, tooltip) — shadcn-style wrappers in `src/components/ui` |
| Icons | `@hugeicons/react` + `@hugeicons/core-free-icons` (primary), `lucide-react` (secondary) |
| Server state | **TanStack React Query v5** |
| Client/global state | **Redux Toolkit** + `react-redux` + `redux-persist` (localStorage) |
| Forms | `react-hook-form` + `zod` v4 via `@hookform/resolvers` |
| HTTP | `axios` (single configured instance) |
| Charts | `chart.js` + `react-chartjs-2` |
| Dates | `date-fns`, `react-day-picker` |
| Notifications | `react-hot-toast` |
| Fonts | Self-hosted **SF Pro Display** (`/public/fonts/*.OTF`) |

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
      settings/
        compliance/         # 4-step KYC wizard (own context/schemas/constants)
    preview/                # public consumer-facing pages
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
    upload-files.ts, utils.ts
  providers/                # redux-provider, query-provider, auth-provider
  store/                    # index.ts, selectors.ts, slices/{authSlice,appsSlice}.ts
  types/index.d.ts
  utils/index.ts            # encrypt/decrypt, formatAmount, formatISODate, ...
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
GET    /places/{id}
GET    /places/{id}/facilities           -> { facilities: Facility[] }
GET    /places/public/{id}
POST   /places
PATCH  /places/{id}
POST   /places/facilities                create facility
POST   /places/facilities/{id}/images    multipart
```

**Inventory**

```
GET    /inventory/products               paginated
GET    /inventory/products/stats         -> { totalItems, inStock, lowStock, outOfStock, recentlyUpdated }
GET    /inventory/products/{id}
POST   /inventory/products
PATCH  /inventory/products/{id}
POST   /inventory/products/{id}/duplicate
GET    /inventory/catalogs
POST   /inventory/catalogs
```

**Menu**

```
POST   /menu/menu-items
PATCH  /menu/menu-items/{id}
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
POST   /deals
PATCH  /deals/{id}
PATCH  /deals/{id}/status
```

**Wallet** (`USER_ACCOUNT_URL`)

```
GET    /wallet
POST   /wallet   { currency, customer_email, customer_mobile, customer_name, bvn, nin, address, dob }
```

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
- `UserData`: `{ email, fullName, userName, role, avatarUrl?, emailVerified?, phoneNumber?, dob?, complianceStatus? }`.
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

| Hook file | Exports |
|---|---|
| `use-events.ts` | `useEvent`, `useEventStats`, `usePublicEvent`; types `EventStatsResponse`, `PublicEvent`, `PublicTicketTier` |
| `use-event-registrations.ts` | `useEventRegistrations`; types `EventRegistration`, `TicketTransaction`, `RegistrationStats`, `RegistrationsPagination` |
| `use-places.ts` | `usePlace`, `usePlaceFacilities`, `usePublicPlace`; type `PublicPlace` |
| `use-inventory.ts` | `useInventoryStats`, `useInventoryProducts`, `useInventoryItem` |
| `use-catalogs.ts` | `useCatalogs`; types `Catalog`, `CatalogCategory` |
| `use-deals.ts` | `useDealSubscription`, `useDealStats`, `useDealCampaigns` |
| `use-kyc.ts` | `useKyc`, `useBusinessCategories`; types `KYCData`, `UBO` |
| `use-compliance.ts` | `useComplianceStatus` (derived from `useKyc`) |
| `use-wallet.ts` | `useWallet` — wallets query + `createWallet(kyc)` flow |
| `use-server-pagination.ts` | URL-synced pagination (`?page=`) + query |
| `use-fetch.ts` | `useFetch` / `useHandleRequest` for one-off mutations |
| `use-optimistic-delete.ts` | optimistic `DELETE {endpoint}/{id}` |
| `use-debounce.ts`, `use-redux-auth.ts`, `use-redux-apps.ts`, `redux.ts` | utility hooks |

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

### Colors (`tailwind.config.ts`)

| Token | Value |
|---|---|
| `primary` | `#6932E2` (purple) |
| `primary-accent` | `#EBE2FF` |
| `primary-text` | `#0F0F0F` |
| `primary-background` | `#D9D9D9` |
| `background` | `#F3F3F3` (`background-light` `#E0E0E0`) |
| `foreground` | `#F8F8F8` (card surfaces) |
| `neutral` / `neutral-accent` | `#F3F3F3` / `#C8C8C8` |
| `secondary-text` | `#6F6D6D` (default body text) |
| card / popover / muted / accent / destructive / border / input / ring / chart-1..5 | HSL CSS variables in `globals.css` |

- `darkMode: ["class"]` is configured; the app currently ships light-only.
- Extra font size: `xxs` = `0.625rem`. Border radius derives from `--radius`.
- Font family: `font-sf-pro` (also the default `sans`).
- Body defaults: `font-sf-pro bg-background text-secondary-text antialiased overflow-x-hidden`.
- Heavily rounded surfaces are the house style — `rounded-2xl` / `rounded-[32px]` for cards
  and hero blocks; circular icon chips (`size-12 rounded-full bg-primary`).

### Status badge palette

| Status | Classes |
|---|---|
| `COMPLETED` | `bg-green-100 text-green-700` |
| `PENDING` | `bg-amber-100 text-amber-700` |
| `FAILED` | `bg-red-100 text-red-600` |

### Toasts

`react-hot-toast`, `position="bottom-right"`, `duration: 3000`,
style `{ background: "#EBE2FF", color: "#6932E2", fontWeight: 500 }`.

### Loading & empty states

- Page-level: `Loader` (`@/components/loader`).
- Inline: `<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />`.
- Empty: `EmptyState` (`@/components/empty-state`), often paired with `/icons/work-in-progress.svg`.

### Currency & dates

- `₦{Number(value).toLocaleString()}` inline, or `formatAmount()` from `@/utils`
  (`en-NG`, 2 decimal places).
- `formatISODate()` → `DD/MM/YYYY`; `formatDateDisplay()` for human-readable dates.

### Shared components

`Sidebar`, `MobileSidebar`, `Navbar`, `MaxWidthWrapper`, `ContainerWrapper`, `Modal`, `SideModal`,
`SearchBar`, `Dropdown`, `SelectDropdown`, `CountrySelectDropdown`, `CategorySelectWithAdd`,
`MultiSelectWithTooltip`, `StatusBadge`, `PaginationButton`, `FileUpload`, `ItemCard`,
`DeleteModal`, plus chart widgets (`RevenueChart`, `OverviewChart`, `PerformanceChart`,
`RegistrationChart`, `TicketSalesChart`).

### Navigation (`src/constants/sidebar.tsx`)

`Overview /` (coming soon) · `Billing /billing` (coming soon) · `Apps/Tools /apps-tools`
(has children) · `Settings /settings`. Admin is commented out.

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
<html><body>
  <ReduxProvider>          {/* redux store + PersistGate */}
    <Providers>            {/* QueryProvider (React Query) + AuthProvider (route guard) */}
      {children}
      <Toaster />
    </Providers>
  </ReduxProvider>
</body></html>
```

The dashboard layout adds `Sidebar` + `MobileSidebar` + `Navbar` inside `MaxWidthWrapper`
(`flex lg:pl-64`). Each module layout wraps its page in the module's `FormProvider`.

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
10. Reuse the design tokens above — no ad-hoc hex colors.

---

## 15. Known Gaps / Caveats

- API base URLs are hard-coded constants; there is no `.env` configuration.
- Token "encryption" is base64 + a static salt — obfuscation only.
- The auth guard is client-side (`AuthProvider`); there is no middleware-based route protection.
- Overview (`/`), Billing and Customers are placeholders; Chat, Groups/Community, Socials,
  Reviews, Payment Method, Memberships and Ads are commented out of the apps catalogue.
- Pagination shapes are not uniform: `useServerPagination` expects
  `{ count, currentpage, lastpage, nextpage, prevpage }` while `useEventRegistrations` receives
  `{ page, limit, total, totalPages, hasNext, hasPrev }`.
- App enable/disable state is local (Redux + localStorage) only — it is not synced to the server.
- There is no test suite, no CI config, and no dark-mode implementation despite `darkMode: ["class"]`.
