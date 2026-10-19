# Backend endpoints: what exists, what's still needed

The merchant dashboard (`merchant.spinstrip.com`) has the full prototype feature set. Features with no
backend support yet run on **sample data**, labelled "Sample" on screen.

This document was checked against the services' live Swagger docs on 2026-10-15:

| Service | Docs |
|---|---|
| Merchant gateway (proxies everything below, plus `POST /auth/waiter/login`) | `spinstrip-merchant-gateway.fly.dev/api/docs` |
| User account (auth, wallet, payouts, PIN, bank accounts, notifications) | `spinstrip-user-account.fly.dev/api/v1/docs` |
| Places | `spinstrip-places.fly.dev/api/docs` |
| Menu (incl. waiters, orders, realtime) | `spinstrip-menu.fly.dev/api/docs` |
| Events | `spinstrip-events.fly.dev/api/docs` |
| Deals | `spinstrip-deals.fly.dev/api/docs` |
| Inventory | `spinstrip-inventory.fly.dev/api/docs` |

**Part A** lists endpoints that already exist; the dashboard is wired to them as marked, and there's nothing to build.
**Part B** is what the backend team still needs to build. **Part C** has open questions.

Customer-facing pages (place, event and menu pages, booking, ticketing, ordering) now live only on the
public site, `places.spinstrip.com`. The dashboard links there instead of keeping its own copies.

Waiters use the separate SpinStrip waiter (mobile) app: waiter login, the order queue, accept/release,
guest chat and the Socket.IO live updates belong to that app. The merchant dashboard only adds, lists
and removes waiters.

---

## Part A — Already available

**Wired in the dashboard and tested end to end on staging (2026-10-15).** Withdrawals and the PIN
flow are wired but weren't exercised: the test wallet isn't set up for PINs (question 6).

| Dashboard feature | Endpoint(s) | Hook |
|---|---|---|
| Discover listings | `GET /places/public`, `GET /events/public` (user-account), `GET /menu/public/menu-items` | `useDiscover` |
| Admin & Roles → Waiters: add (existing SpinStrip user, by email), list, remove | `POST` / `GET /menu/waiters`, `DELETE /menu/waiters/{waiterUserId}` | `useWaiters` |
| Places: submit a draft / rejected place for review | `POST /places/{id}/publish` | `useSubmitPlaceForReview` |
| Places: remove a facility | `DELETE /places/facilities/{id}` | `useRemoveFacility` |
| Places: customer bookings from the public site (list, filter by status, cancel) | `GET /places/{placeId}/bookings`, `DELETE /places/bookings/{id}` | `usePlaceBookings`, `useCancelBooking` |
| Places: appointments (list, change status, cancel) | `GET /places/{id}/appointments` (returns `{ appointments, pagination }`), `PATCH` / `DELETE /places/appointments/{id}` | `usePlaceAppointments`, `useUpdateBookingStatus`, `useCancelAppointment` |
| Places: add a walk-in visitor | `POST /places/{id}/visit` | `useAddPlaceVisitor` |
| Inventory: restock | `PATCH /inventory/products/{id}/inventory { quantity: +n, reason }` | `useRestockItem` |
| Wallet: transaction history, money-in / funding / withdrawal totals, chart | `GET /wallet/transaction-history` | `useWalletActivity` |
| Wallet: withdraw to a settlement account | `POST /payouts` (BANK_TRANSFER) → `POST /payouts/{id}/authorize { authToken, walletPin }` | `useWithdraw` |
| Wallet: set / reset the transaction PIN | `GET /pin/status`, `POST /pin/otp`, `POST /pin`, `PATCH /pin` | `useWalletPin` |
| Top bar notifications | `GET /notifications` | `useNotifications` |
| Menu → Tables & QR: create, edit, delete tables (server-assigned numbers; QR encodes the number) | `GET` / `POST /menu/tables`, `PATCH` / `DELETE /menu/tables/{id}` (2026-10-19) | `useMenuTables` |
| Menu → Table Analytics: revenue, average order, items sold; per-table guests, paid orders, items, revenue; date filter; a table's orders | `GET /menu/analytics`, `GET /menu/analytics/tables`, `GET /menu/orders?tableNumber=` | `useMenuAnalytics`, `useTableAnalytics`, `useTableOrders` |
| Reviews: Menu → Reviews tab, place → Reviews tab, event → Sales & Registrations (paged, newest first) | `GET /menu/reviews`, `GET /places/reviews?placeId=`, `GET /events/reviews?eventId=` | `useReviews` |
| Top Menus (paid units per month; PROCESSING counts as paid) | `GET /menu/orders` | `useTopMenus` |
| Public site: table orders carry the real table (`tableId` + number), matched via the public table list | `GET /menu/public/tables`, `POST /menu/public/orders` | `usePublicTables` (places repo) |
| Public site: guests review a place, an event or a restaurant (place / event / restaurant pages, the event success page and a paid order's page). Posted straight to each service with the checkout email; ineligible guests see the service's 403 reason | `POST /places/{id}/reviews`, `POST /events/{id}/reviews`, `POST /menu/reviews` | `useSubmitReview` (places repo) |

**Available, not wired yet:**

| Feature | Endpoint(s) | Why not yet |
|---|---|---|
| Feature / unfeature a menu item | `PATCH /menu/menu-items/{id}/toggle-featured` | The existing edit form already sets `isFeatured` |
| Places: unpublish; edit a facility; fee tiers; delete a place; place sales | `PATCH /places/{id}/status`, `PATCH /places/facilities/{id}`, fee-tier endpoints, `DELETE /places/{id}`, `GET /places/{placeId}/bookings`, `GET /places/transactions` | Next round |
| Events app on/off | `GET /events/activation/status`, `POST /events/activation/toggle` | See question 5 |
| Deals: delete; campaign edit / delete / status; unsubscribe | `DELETE /deals/{id}`, campaign endpoints, `PATCH /deals/subscriptions/deactivate` | Next round |

Event publish / unpublish already uses the existing `PATCH /events/{id}` call.

---

## Part B — Still needed from the backend

**Priority:** P1 = a whole page is sample data; P2 = one feature on a working page; P3 = nice to have.
Paths are suggestions only. Use whatever fits your conventions and tell the frontend team.

### B1. Overview and Settlement: one view of all transactions (P1)

Sales are spread across services: place transactions, menu orders, event registrations and wallet
history. Each can be fetched separately, but the Overview KPIs and the Settlement page need them
combined.

| Need | Suggested endpoint |
|---|---|
| Overview totals for a date range: customers, new customers, transactions, revenue, revenue for the previous period, settled amount and count, a daily series, revenue and count per product line | `GET /analytics/overview?from&to` |
| Settlement batches: one per settlement day, with amount, count and amount per product line. Please confirm the dashboard's stated **T+1** rule | `GET /settlements?from&to`, `GET /settlements/{date}/transactions` |
| Optional: a single cross-product transaction feed | `GET /transactions?from&to&type&status&settled&page&limit` |

**Hook to swap:** `useOverview` and `useSettlements`.

### B2. Team roles beyond waiters (P1)

Waiters are covered (Part A). Still missing:

| Need | Suggested endpoint |
|---|---|
| An **Admin Ops** role: a staff member who can open only the dashboard sections the owner grants (overview, menu, places, events, inventory, deals, customers, wallet, settlement, billing, settings) | `POST /team { email, role: "admin_ops", permissions[] }`, `PATCH /team/{id}`, `DELETE /team/{id}`, `GET /team` |
| The role and permissions on the signed-in user, so the dashboard can restrict pages | `role` and `dashboardPermissions[]` on the login and `GET /auth/me` user |
| Inviting staff who don't have a SpinStrip account yet (`POST /menu/waiters` needs an existing user) | an invite endpoint, or document the expected sign-up flow |
| Optional: pausing a waiter without removing them (today the only option is remove) | `PATCH /menu/waiters/{userId} { active }` |

**Hook to swap:** `useTeam`.

### B3. Billing and app activation (P1)

| Need | Suggested endpoint |
|---|---|
| On/off for Menu, Places and Inventory (Events and Deals already have one) | `GET` / `POST /{service}/activation/…`, matching Events |
| Active subscriptions and the monthly bill | `GET /billing/subscriptions` |
| Invoices, with a PDF | `GET /billing/invoices`, `GET /billing/invoices/{id}/pdf` |
| Card on file | `GET` / `PUT /billing/payment-method` |

**Hook to swap:** `useBilling`; app toggles in the Redux `apps` slice.

### B4. Wallet extras (P2)

| Need | Suggested endpoint |
|---|---|
| Inflow, revenue and withdrawal totals per period (or confirm we should total `transaction-history` ourselves) | `GET /wallet/summary?period=week\|month\|year` |
| Confirm the balance and account-number field names on `GET /wallet` (we read `balance` / `availableBalance`, `accountNumber`, `bankName`) | existing endpoint |
| A merchant "pay me" QR or link for the POS popup (it shows a static image today) | `GET /wallet/payment-link` → `{ url, qrPayload }` |

### B5. Dining tables (P2)

Tables, table analytics and reviews shipped on 2026-10-19 and are wired (Part A). Open points (the review ones apply to places and events too):

| Need | Notes |
|---|---|
| What table bank `accounts` are for (`POST /menu/tables` accepts them, resolved with Paystack) | Not shown in the dashboard until we know whether they receive that table's payments or waiter tips |
| Table numbering after deletes | A deleted test table had number 1; does the next table reuse it? |
| Reviews: reviewer name and an average | Rows are `{ id, email, userId, stars, comment, createdAt }` plus `place` / `event` (verified with test reviews on all three services). The dashboard shows the email; a `customerName` and an average rating / star breakdown from the API would let us show more without computing it |
| Reviews through the gateway without sign-in | Guest `POST …/reviews` returns 401 at the gateway, so the public site posts straight to the service hosts (which accept guests). A public gateway route would let it use one host |
| Public list of reviews | Every `GET …/reviews` needs merchant auth, so the public pages can collect reviews but can't show them. Needed: public `GET /places/public/{id}/reviews`, `GET /events/public/{id}/reviews`, `GET /menu/public/reviews?merchantUserId=` with an average |
| "Already reviewed" | No way to tell a guest has reviewed; the site remembers it on the phone. Does a second review from the same email replace the first, or get rejected? |
| Analytics for every item in one call | Top Menus calls `GET /menu/analytics/items/{id}` once per dish; an all-items breakdown (or top-N) endpoint would replace that |

### B6. Places (P2)

| Need | Suggested endpoint |
|---|---|
| **Bug:** `PATCH /places/{id}` returns 200 but ignores `metadata` (JSON object, JSON string or multipart), so amenities can't be edited and there's nowhere to store a tagline | persist `metadata` on update, or add a `tagline` field |
| **Bug:** `PATCH /places/facilities/{id}` returns 200 but ignores `accessType` and `isGated`, so a facility can't be switched between free and paid after creation (verified on staging, 2026-10-19). The public site now decides free vs paid from the facility's active rates | persist `accessType` / `isGated` on update |
| Change a customer booking's status (e.g. COMPLETED after check-out) — only cancel exists | `PATCH /places/bookings/{id} { status }` |
| Delete a mistakenly recorded walk-in visitor | `DELETE /places/visitors/{id}` |
| Following a place (`POST /followers/follow` follows a *user*; is following the place's merchant enough?) | confirm, or `POST /places/public/{id}/follow` |
| `RESTAURANT` place type is in live data and the API, but the dashboard's create form doesn't offer it | frontend fix; please confirm the full enum |

### B7. Events (P2)

| Need | Suggested endpoint |
|---|---|
| Delete an event (only status changes exist) | `DELETE /events/{id}` |
| Tickets sold via a deal | `viaDeal` on registrations, or a count on event stats |
| Posts on the public event page | needs a product spec first |
| Form Builder (custom registration questions, `formId`) | needs a product spec first |

### B7b. Checkout contact details (P2)

The public site's checkouts now ask only for **full name, email and phone**. The frontend splits the name
into `firstName` / `lastName` and copies the email into `confirmEmail`.

| Need | Suggested change |
|---|---|
| Event registration rejects `phone` ("property phone should not exist"), so the phone a guest enters isn't saved | add optional `phone` to `RegisterEventDto` (`POST /events/public/{id}/register`) |
| `confirmEmail` is redundant now that the form asks for the email once | make `confirmEmail` optional on event registration and facility booking |
| Single-word names fail (`lastName should not be empty`); the form asks for first and last name | optional: accept a single `fullName` like menu orders' `customerName` |

### B8. Deals (P2)

| Need | Suggested endpoint |
|---|---|
| Redemptions and revenue per deal, as totals and per month | `GET /deals/{id}/performance`, `GET /deals/performance?from&to` |
| AI campaign analysis | P3, needs a spec |

### B9. Inventory (P2)

| Need | Suggested endpoint |
|---|---|
| Stock activity per item (the adjust/set endpoints take a `reason`; can we read it back?) | `GET /inventory/products/{id}/activity` |
| Price history; units sold per month | `GET /inventory/products/{id}/price-history`, `GET /inventory/products/{id}/sales?months=12` |

### B10. Customers (P2)

| Need | Suggested endpoint |
|---|---|
| Spend per customer (menu, events, places, total) | add spend fields to `GET /places/customers` |
| Server-side search (today only the loaded page is searched) | `search` on `GET /places/customers` |

### B11. Settings (P2)

| Need | Suggested endpoint |
|---|---|
| Notification and auto-settlement settings (`/preference` exists but stores interest tags, not settings) | `GET` / `PATCH /settings/notifications` |
| Change password while signed in | `POST /auth/change-password { currentPassword, newPassword }` |
| Business sub-categories per KYC category | `GET /kyc/business/categories/{id}/sub-categories` |
| Legal documents and acceptance history | `GET /legal/documents`, `POST /legal/documents/{id}/accept` |

---

## Part C — Questions for the backend team

1. **Capability flags.** Login and `/auth/me` return `canCreateWallet`, `canCreateMenuItems`, … What do
   they mean? Are they meant to drive the dashboard's app on/off toggles?
2. **Wallet PIN.** `GET /pin/status` returns 400 "Create a wallet before managing your PIN" for an
   account that does have a wallet (`GET /wallet` → one NGN wallet with `status: null`). What step
   finishes wallet setup so PINs and withdrawals work?
3. **Payout response.** Swagger doesn't document what `POST /payouts` returns. The dashboard reads
   `id` / `payoutId` and `authToken` from `data`, then calls `POST /payouts/{id}/authorize`. Please confirm.
4. **Events activation.** What does turning the Events service off do: hide the merchant's events
   publicly, block creating events, or only change billing? We'll link it to the Event Planner app
   switch once that's clear.

Answered by testing on staging (2026-10-15):
- `GET /deals/subscriptions` is routed to `GET /deals/{id}` and 404s ("Deal with ID subscriptions not
  found"), so the dashboard always thought the merchant was unsubscribed. It now calls `/status`.
- Bookings (`/places/{placeId}/bookings`, made by customers on the public site) and appointments
  (`/places/{id}/appointments`) are separate records.
- Response shapes for waiters, notifications, menu orders and wallet history match what the dashboard reads.

## Frontend bugs found while checking the docs (frontend team)

- **Places appointments** (fixed): the list used the generic paginated reader, but this endpoint returns
  `{ appointments, pagination }`, so appointments never showed.
- **Inventory product type** (fixed): the API accepts `DEFINITE`, `DEFINITE_INFINITE` and `INFINITE`; the
  form's validation only allowed `DEFINITE` / `INDEFINITE`, so "Indefinite" products failed validation.
- **Places edit:** the PATCH payload omits operating hours, metadata and `ownershipVideoUrl`, although
  `UpdatePlaceDto` accepts them.
- **Public place checkout** on the old dashboard copy showed a fixed ₦200,000. Resolved by removing
  that copy; the public site's checkout uses real fees.
