# Backend endpoints needed by the merchant dashboard

The merchant dashboard (`merchant.spinstrip.com`) now has the full prototype feature set. Most of it
is connected to the existing APIs. The features below are **built and visible to merchants, but run
on sample data** because no backend endpoint exists for them yet. On screen they carry a "Sample"
badge.

For each feature this document lists what the screen needs and a **suggested** endpoint. The
paths and field names are suggestions only. Use whatever fits your conventions and tell the
frontend team, who will swap the matching hook (named under each section) for the real call. Nothing
else in the dashboard depends on the sample data, so each item can ship on its own.

**Conventions the dashboard already expects**

- Responses use the envelope `{ status, message, data }`.
- Paginated lists return `data: { count, currentpage, lastpage, nextpage, prevpage, data: T[] }` and
  accept `page`, `limit` and `search`.
- Money is in naira. Dates are ISO 8601 strings.
- Every endpoint is for the signed-in merchant (Bearer token) unless marked **public**.

**Priority guide:** P1 = a whole page is sample data today; P2 = one feature on a working page;
P3 = nice to have.

---

## 1. Transactions, Overview and Settlement (P1)

One transaction feed powers the Overview KPIs and charts, the Settlement page, Wallet history and
Table Analytics. Building it unlocks the most screens.

**Hooks to swap:** `useOverview` (`src/hooks/use-overview.ts`), `useSettlements`
(`src/hooks/use-settlements.ts`), `useWalletActivity` (`src/hooks/use-wallet-extras.ts`). Sample
source: `src/mocks/transactions.ts`.

| Need | Suggested endpoint |
|---|---|
| All of the merchant's transactions across products, filterable | `GET /transactions?from&to&type&status&settled&search&page&limit` |
| Overview totals for a date range | `GET /analytics/overview?from&to` |
| Settlement batches (one per settlement day) | `GET /settlements?from&to` |

**Transaction:** `id, ref, type (menu | event | place | inventory | deal | wallet), itemLabel,
customerName, amount, status (success | pending | failed), settled, settledAt, tableId (menu orders
only), createdAt`.

**Overview analytics** (all for the range):

- totals: `totalCustomers`, `newCustomers`, `totalTransactions`, `revenue`, `revenuePrev` (the same
  length of time immediately before, for the % change), `walletBalance`, `totalSettlement`,
  `settledCount`;
- `series[]`: `{ date, revenue, newCustomers }`, daily (the frontend groups by month for long ranges);
- `performance[]`: `{ type, revenue, count }` per product line.

**Settlement batch:** `date, count, amount, byType: { menu?: number, event?: number, … }`.
The dashboard states settlement is **T+1** (successful payments settle the next business day). Please
confirm that rule or tell us the real one.

## 2. Wallet (P1)

**Hooks to swap:** `useWalletActivity`, `SAMPLE_WALLET_BALANCE` (`src/hooks/use-wallet-extras.ts`).

| Need | Suggested endpoint |
|---|---|
| Confirm the balance and funding-account field names on the existing `GET /wallet` (the page reads `balance` / `availableBalance`, `accountNumber`, `bankName`) | existing `GET {USER_ACCOUNT_URL}/wallet` |
| Wallet transaction history, with a receipt per transaction | `GET /wallet/transactions?from&to&type&page&limit`, `GET /wallet/transactions/{id}/receipt` |
| Inflow, revenue and withdrawal totals per period | `GET /wallet/summary?period=week\|month\|year` |
| Submit a withdrawal to the default settlement account, with transaction PIN | `POST /wallet/withdrawals { amount, bankAccountId, pin }` |
| A real POS payment QR or payment link for the merchant (the popup shows a static image today) | `GET /wallet/payment-link` → `{ url, qrPayload }` |

## 3. Admin & Roles (team accounts) (P1)

The dashboard supports three merchant roles: **owner**, **admin_ops** (sees only the sections the owner
grants) and **waiter** (only the waiter app at `/waiter`). Permission keys: `overview, menu, places,
events, inventory, deals, customers, wallet, settlement, billing, settings`.

**Hook to swap:** `useTeam` (`src/hooks/use-team.ts`). The role is read from `user.role` in
`src/lib/permissions.ts`.

| Need | Suggested endpoint |
|---|---|
| List team members | `GET /team` → `{ id, name, email, role, permissions[], active, createdAt }[]` |
| Add a member (owner sets the initial password) | `POST /team { name, email, password, role, permissions[] }` |
| Change permissions, activate or deactivate | `PATCH /team/{id} { permissions?, active? }` |
| Reset a member's password | `POST /team/{id}/reset-password { newPassword }` |
| Remove a member | `DELETE /team/{id}` |
| Team members can log in, and the login / `GET /auth/me` user carries `role` (`owner \| admin_ops \| waiter`) and `dashboardPermissions[]` | existing auth endpoints |

**Open question:** login and `/auth/me` already return capability flags (`canCreateWallet`,
`canCreateMenuItems`, `canCreatePlaces`, …). Are these the merchant's app on/off settings,
KYC-gated permissions, or something else? See also §4.

## 4. Billing and app activation (P1)

**Hook to swap:** `useBilling` (`src/hooks/use-billing.ts`). The app toggles are in the Redux `apps`
slice.

| Need | Suggested endpoint |
|---|---|
| Save which apps are switched on (today only this browser remembers) | `GET /apps`, `PATCH /apps/{key} { active }`, or `PUT /profile` if that's what the capability flags are for |
| Active subscriptions and the monthly bill | `GET /billing/subscriptions` |
| Invoices (with downloadable PDF) | `GET /billing/invoices?page&limit`, `GET /billing/invoices/{id}/pdf` |
| Card on file | `GET /billing/payment-method`, `PUT /billing/payment-method` |

App prices today are in the frontend catalogue (`src/constants/index.ts`): Event Planner ₦288,
Menu / Inventory / Places ₦588 a month, while Wallet, Customers and Deals are free.

## 5. Menu: tables, QR codes and orders (P1)

Tables & QR, Table Analytics, the waiter app and the public table menu share one set of tables.

**Hooks to swap:** `useMenuTables`, `useTableDetail`, `useSeatGuests`, `useTableByToken`,
`useWaiterFloor` (`src/hooks/use-menu-tables.ts`); `useTopMenus`, `usePublicMenu`
(`src/hooks/use-menu.ts`).

| Need | Suggested endpoint |
|---|---|
| Dining tables: list, create, delete | `GET /menu/tables`, `POST /menu/tables { label, seats }`, `DELETE /menu/tables/{id}` |
| Each table's QR token (encoded in `/preview/menu?table=<token>`) | `qrToken` field on the table |
| Seat guests at a table (waiter app) | `POST /menu/tables/{id}/seatings { guests }` |
| Per-table activity: seatings, guests, orders, revenue, last seated | `GET /menu/tables/summary` and `GET /menu/tables/{id}?include=seatings,orders` |
| Live floor: guests today and open orders per table | `GET /menu/tables/floor` |
| Order counts per menu item per month (Top Menus, Featured cards) | `GET /menu/menu-items/top?month=YYYY-MM` |
| **Public** menu for a business, reachable from a table QR without login | `GET /menu/public?table=<qrToken>` → business name + available items |

## 6. Places (P2)

**Hooks to swap:** `src/hooks/use-place-extras.ts`. Sample source: `src/mocks/places.ts`.

| Need | Suggested endpoint |
|---|---|
| Place tagline | `tagline` field on create / update / GET |
| Publish or unpublish from the dashboard | `PATCH /places/{id}/status { status }` |
| Edit and delete a facility | `PATCH /places/facilities/{id}`, `DELETE /places/facilities/{id}` |
| Add a visitor manually | `POST /places/{id}/visitors { name, email, phone, visitDate }` |
| Change a booking's status (PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW) | `PATCH /places/{id}/appointments/{appointmentId} { status }` |
| Reviews for a place (dashboard and public page) | `GET /places/{id}/reviews`, **public** `GET /places/public/{id}/reviews` |
| Follow a place (public page) | `POST /places/public/{id}/follow` |
| Book a facility from the public page (its "Register" button does nothing today) | **public** `POST /places/public/{id}/bookings { facilityId, date, name, email, … }` |

## 7. Events (P2)

**Hooks to swap:** `src/hooks/use-event-extras.ts`. Sample source: `src/mocks/events.ts`.

| Need | Suggested endpoint |
|---|---|
| Delete an event | `DELETE /events/{id}` |
| Tickets sold via a deal | `viaDeal` flag on registrations, or a `viaDealCount` field on event stats |
| Reviews / posts on the public event page | **public** `GET /events/public/{id}/reviews` |
| Form Builder (custom registration questions, referenced by the event's `formId`) | `GET/POST/PATCH /forms` (needs a product spec first) |

## 8. Deals (P2)

**Hooks to swap:** `useDealsPerformance`, `useDealPerformance` (`src/hooks/use-deal-extras.ts`).

| Need | Suggested endpoint |
|---|---|
| Redemptions and revenue per deal, as totals and per month | `GET /deals/{id}/performance`, `GET /deals/performance?from&to` |
| "Archived" as its own status, if the product needs it separate from Paused | new value on `PATCH /deals/{id}/status` |
| AI analysis of a campaign | P3, needs a product spec |

## 9. Inventory (P2)

**Hooks to swap:** `useItemHistory` (`src/hooks/use-inventory-extras.ts`).

| Need | Suggested endpoint |
|---|---|
| Stock activity per item (restocks, sales, adjustments, by whom) | `GET /inventory/products/{id}/activity` |
| Price history per item | `GET /inventory/products/{id}/price-history` |
| Units sold per month per item | `GET /inventory/products/{id}/sales?months=12` |
| Optional: a dedicated restock action (the dashboard currently PATCHes `quantity`) | `POST /inventory/products/{id}/restock { quantity }` |

## 10. Customers (P2)

**Hook to swap:** `useCustomerSpend` (`src/hooks/use-customer-extras.ts`).

| Need | Suggested endpoint |
|---|---|
| Spend per customer: menu, events, places and total (₦) | add `menuSpend, eventsSpend, placesSpend, totalSpend` to `GET /places/customers` |
| Server-side search (today only the loaded page is searched) | `search` param on `GET /places/customers` |

## 11. Settings (P2)

**Hooks to swap:** `usePreferences`, `useChangePassword` (`src/hooks/use-settings-extras.ts`); the
sub-category list in `src/app/(dashboard)/settings/_constants`.

| Need | Suggested endpoint |
|---|---|
| Notification and auto-settlement preferences | `GET /preferences`, `PATCH /preferences { emailNotifications, pushNotifications, weeklySummary, autoSettlement }` |
| Change password while signed in | `POST /auth/change-password { currentPassword, newPassword }` |
| Business sub-categories for each KYC business category | `GET /kyc/business/categories/{id}/sub-categories`, or nest them in the existing categories response |
| Legal documents: links, versions, the merchant's acceptance history | `GET /legal/documents`, `POST /legal/documents/{id}/accept` |

## 12. Discover (P3, public)

**Hook to swap:** `useDiscover` (`src/hooks/use-discover.ts`). Sample source: `src/mocks/discover.ts`.

| Need | Suggested endpoint |
|---|---|
| Published places across all merchants, filterable by city and search | **public** `GET /discover/places?city&search&page` → `id, name, type, tagline, city, area, coverImage, views, rating, priceLevel` |
| Live and upcoming events across merchants | **public** `GET /discover/events?city&search&page` → `id, name, kind, city, venue, image, startsAt, priceFrom` |

---

## Existing bugs found while building (backend side to confirm)

- **Places:** the edit (PATCH) payload omits operating hours, metadata and the video URL, so those
  can't be changed after creation. The "Other" place type fails validation because it isn't in the
  `placeType` enum.
- **Inventory:** the product form's "Indefinite" option sends `productType: "INFINITE"`, while the
  form validation (and the old dropdown) use `INDEFINITE`. Which value does the API accept? The
  frontend will align to it.
- **Public place checkout** shows a fixed ₦200,000 total (see §6, public booking).
