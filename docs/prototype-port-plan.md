# Prototype Port Plan

Bring the SpinStrip merchant dashboard up to the Kimi prototype
(`C:\Users\User\Downloads\Kimi_Agent_SpinStrip Dashboard Integration\app`): its look, the sections
we don't have yet, and the features our existing sections are missing.

## Ground rules

- **We port behaviour and design, not code.** The prototype is Vite + React Router + tRPC + MySQL.
  We stay on Next.js, our axios `api` client, React Query and our existing backend.
- **Keep what we already do better.** Several of our modules are ahead of the prototype (Paystack
  checkout, claim-a-place, recurring events, campaigns, server pagination, KYC wizard, confirm
  modals). Nothing gets removed to match the prototype.
- **Existing integrations are never changed (decided 2026-10-14).** In modules already connected
  to the backend, existing calls (create/get/update/delete/claim/publish…), payloads, hooks and
  submit logic stay exactly as they are; the backend won't change those endpoints. Integration
  bugs spotted along the way are reported, not fixed.
- **Upgrade the UI and add the missing features on dummy data.** Every prototype feature the
  module lacks (exports, taglines, reviews, add visitor, booking status changes…) is added through
  new hooks in `src/hooks` backed by fixtures in `src/mocks/`, and labelled as sample data. When
  the backend adds an endpoint, only that hook changes.
- **Don't copy prototype bugs.** Notably: plain-text staff passwords, deletes with no confirmation,
  no page-level permission checks, billing totals that don't add up.
- Legend: **[BE]** backend already supports it · **[MOCK]** needs mock data · **[FIX]** existing bug.

## Decisions (2026-10-14)

- **Fonts:** switch to the prototype's — Outfit (headings, numbers) and Plus Jakarta Sans (body).
  SF Pro is removed.
- **Brand purple:** keep `#6932E2`; build the gradient around it.
- **Sidebar:** flat, like the prototype. Each app gets its own top-level item, shown only when the
  app is turned on. URLs stay `/apps-tools/…`.
- **Scope:** the waiter app and the public Discover page are both in (Phase 5).

---

## Phase 0 — Foundation (design system)

Nothing visible changes much yet; everything after this builds on it.

- [x] **0.1 Tokens.** Fix the `foreground` naming clash (ours means "card surface"; shadcn's means
      text colour) by renaming `bg-foreground` → `bg-card`. Move our hex tokens
      (`primary-text`, `secondary-text`, `primary-accent`, `neutral-accent`) onto CSS variables.
      Adopt the prototype's palette, `--radius: 1rem`, and `sidebar-*` / `chart-*` variables.
- [x] **0.2 Fonts.** Load the chosen fonts with `next/font` and add a `font-display` family.
- [x] **0.3 Utilities.** `.brand-gradient`, `.brand-gradient-soft`, `.brand-text-gradient`,
      `.card-hover`, `.no-scrollbar`.
- [x] **0.4 Missing primitives.** Dialog, Sheet, Tabs, Skeleton, Badge, Progress (shadcn v3 style).
- [x] **0.5 Restyle existing primitives.** Button (add `brand` and `soft` variants, 44px touch
      targets), Input/Textarea/Select (bordered, focus ring), Switch (standard filled), Label,
      Table (small uppercase headers, row hover), SearchBar, Dropdown, PaginationButton, Loader.
- [x] **0.6 Shared components.** `PageHeader`, `StatCard` (with gradient accent), `StatusPill`
      (replaces `StatusBadge`; normalises our upper-case statuses), `EmptyState` (restyle),
      `ChartCard`, `DateRangeControl`, `PillGroup`, `ChipsInput`, `Field`, `Breadcrumb`.
- [x] **0.7 Helpers.** `formatNaira(n, compact)`, `fmtDate`, `fmtDateTime`, `timeAgo`, `rangeFor`,
      `exportCsv`.
- [x] **0.8 Charts.** One chart.js theme helper: gradient area fill, dashed y-grid, ₦ ticks,
      doughnut style, colours read from CSS variables. Fixes the `$` tooltips and "N0.00" labels.
- [x] **0.9 Motion and toasts.** Add `framer-motion`; page enter animation via
      `(dashboard)/template.tsx`. Restyle react-hot-toast (top-center, token colours).
- [x] **0.10 Mock layer.** `src/mocks/` fixtures (seed-derived: Kitchen D4AD, Nigerian names,
      ₦ amounts, `SPN-YYYYMM-XXXXXX` refs) and a small helper for mock queries and mutations.

> Done 2026-10-14. Existing screens pick up the new palette, fonts and primitives automatically;
> their layouts are restyled module by module in later phases. `Modal`/`SideModal` were restyled in
> place — new work uses `ui/dialog` and `ui/sheet`. 9 TypeScript errors that pre-date this work
> remain (events-table, upload-images, menu-modal, places context, form-array-input); they are
> fixed in their module phases.

## Phase 1 — App shell, navigation and permissions

- [x] **1.1 Sidebar.** Add Overview (no longer "coming soon"), Settlement, Billing and
      Admin & Roles. Apply the prototype item style with the animated active bar.
- [x] **1.2 Topbar.** Sticky, blurred, full-width. Orders, Notifications, Support, user chip with
      role. Theme toggle is added in Phase 6.
- [x] **1.3 Compliance banner.** Separate card under the topbar, percentage-based progress bar,
      hidden once approved. [BE] `useComplianceStatus`
- [x] **1.4 Roles and permissions.** Owner / Admin Ops / Waiter roles and permission keys
      (overview, menu, places, events, inventory, deals, customers, wallet, settlement, billing,
      settings). Add a `usePermissions()` hook with `can()`, filter the sidebar, guard pages, and
      send each role to the right landing page after login. [MOCK] until the backend adds roles.
- [x] **1.5 Layout.** Main area padding, full width vs. the current 1200px cap.

> Done 2026-10-14. Sidebar is grouped General / Apps / Business; app items appear only while the
> app is on. Roles live in `src/lib/permissions.ts` and `usePermissions()`; any backend role we
> don't recognise is treated as the owner, since the API only returns "USER" today. Content width
> is capped at 1440px. Settlement, Billing and Admin & Roles have placeholder pages until Phase 2;
> Overview still redirects to compliance until Phase 2.1.

## Phase 2 — New sections (all [MOCK])

- [x] **2.1 Overview** (`/`). Replaces the redirect and dead placeholder.
  - Date range control (Today / This Week / This Month / This Year / Custom).
  - 11 KPI cards: Total Customers, Total Transactions, Wallet Balance (gradient), Total Revenue
    (± % vs previous period), Total Settlement, Total Menu, Total Inventory (+ stock value),
    Low Stock, Places, Deals, Events.
  - "View on SpinStrip Discover" tile.
  - Area charts: Total Revenue and Customer Onboarding (daily, or monthly when the range is over
    100 days).
  - Doughnuts: Product Performance by revenue and by volume.
  - Recent Transactions (links to Settlement) and Recent Events (links to Events).
  - Hook: `useOverview({ from, to })`.
- [x] **2.2 Settlement** (`/settlement`).
  - Daily batch strip (date, amount, count, product lines).
  - Type pills (All / Menu / Events / Places / Inventory / Deals / Wallet), search, "N settled · ₦total".
  - Table: Reference, Type, Item, Customer, Amount, Settled On, Status.
  - Real CSV export (the prototype only shows a toast) and pagination (the prototype caps at 80 rows).
  - T+1 rule: successful transactions settle the next day.
- [x] **2.3 Billing** (`/billing`).
  - Current monthly bill (gradient card), payment method, next charge.
  - Active subscriptions, calculated from our apps catalogue prices and active apps.
  - Invoices table (Invoice, Description, Period, Amount, Status, Download).
  - Fixes the prototype's bugs: invoice totals must match the bill, and "next charge" shows next month.
- [x] **2.4 Admin & Roles** (`/admin`), owner only.
  - Team member cards: avatar, role pill, permission chips, Active switch, Manage, Remove (with
    confirmation).
  - Add Team Member dialog: role (Waiter / Admin Operations), name, email, password, permission grid.
  - Manage dialog: edit permissions, reset password.
  - **Passwords are never displayed.** The prototype's "reveal password" feature is dropped.

> Done 2026-10-14.
> - Overview uses live counts for menu items (available), inventory and low stock, places, active
>   deals, events, and recent events.
> - Revenue, transactions, customers, wallet balance, settlement and the charts are sample data
>   (`src/mocks/transactions.ts`), labelled on screen with `SampleDataBadge`.
> - Settlement, invoices, the card on file and team members are sample data. Billing's
>   subscriptions and monthly bill are calculated from the real apps catalogue prices.
> - The "View on SpinStrip Discover" tile is added with the Discover page in Phase 5.
> - Removed the old placeholder overview widgets (revenue/overview charts, orders table, recent
>   messages).

## Phase 3 — Menu (largest module)

- [x] **3.1 Fix and restyle.**
  - [FIX] Both breadcrumbs call `router.back()`.
  - [FIX] "Configure Tool" link goes nowhere.
  - [FIX] Availability values the schema rejects.
  - [FIX] Extras can't be edited or removed.
  - [FIX] Featured list shares the main table's `?page`.
  - [FIX] Broken `ActionType` import.
  - [FIX] Stray "Brief description…" input in Deal Settings.
  - [FIX] Removed images aren't saved on edit.
- [x] **3.2 Shell.**
  - Tabs: Menu Items / Tables & QR / Table Analytics, linkable via `?view=`.
  - App status strip: Live/Off, public URL, Copy URL, Preview Menu Page.
  - Configure Tool sheet: app switch, URL copy, preview.
- [x] **3.3 Menu Items.**
  - Wizard step-1 validation gate.
  - Categories from data, plus wiring up "+ Add Category".
  - Day/time pickers for "Specific days/time".
  - Deal select limited to active deals, labelled "name — discount".
  - Working Top Menus (month selector, rank, order count). [MOCK]
  - Featured cards show order count. [MOCK]
- [x] **3.4 Tables & QR.** [MOCK]
  - Table grid with a QR per table (`qrcode.react`), encoding the public menu URL with `?table=`.
  - Add Table (label; seats 1–40, default 4), delete with confirmation, "New table QR" tile.
  - *Optional extra (not in the prototype):* download or print QR codes.
- [x] **3.5 Table Analytics.** [MOCK]
  - Card per table: guests, seatings, orders, last seated, revenue (compact ₦).
  - Detail dialog: last 50 transactions, recent seatings.
  - *Optional extra (not in the prototype):* date filter and charts.
- [x] **3.6 Public menu page** (`/preview/menu?table=`). [MOCK]
  - Header, banner, restaurant card ("Ordering from your table" when there's a table token).
  - Search, "🔥 Popular here", category chips, dish grid.
  - Cart stepper and cart bar; "Place order" shows a toast.

> Done 2026-10-14.
> - **Availability** offers only the values the backend schema accepts: Always Available,
>   Specific days/time (with day + time pickers) and Unavailable. The prototype's "On Demand" and
>   "Other" were dropped because the API rejects them. Add them back if the backend adds them.
> - **To verify with backend:** on edit, the remaining `images` URLs are now sent in the PATCH so
>   removed images are deleted. Confirm the API accepts `images` on PATCH.
> - **Public menu** (`/preview/menu`): a signed-in merchant sees their real available items;
>   visitors see a labelled sample menu until a public menu endpoint exists.
> - Tables, seatings, table analytics and Top Menus order counts are sample data.
> - Also fixed: `/preview` pages had no React Query provider (public event/place pages would
>   throw); added `src/app/preview/layout.tsx`.
> - Removed the unused `(dashboard)/_components/top-menus.tsx` and `item-card.tsx`.
> - Not done (optional extras): QR download/print, date filter/charts on Table Analytics.

## Phase 4 — Other existing modules

- [x] **4.1 Places**
  - Fixes:
    - [FIX] Claim never stores which place was picked.
    - [FIX] Only page 1 of the list is shown.
    - [FIX] "OTHER" place type fails validation.
    - [FIX] Bookings table shows wrong values (Visitor ID shows the name, Facility shows a raw id, Fee formats the fee id, status colours never match).
    - [FIX] Dead quicklinks to Reviews and Bookings.
    - [FIX] Saved holidays can't be removed.
    - [FIX] Edit drops hours, amenities and video URL.
    - [FIX] Facility form skips validation.
  - Add:
    - Tagline. [MOCK]
    - Publish action. [MOCK]
    - "Preview Public Page" button.
    - Status line under the title.
    - Quicklinks that switch tabs.
    - Amenities and landmarks as chips.
    - Monday auto-fill for open days only.
    - Facility delete. [MOCK]
    - Add Visitor. [MOCK]
    - Visitors and bookings CSV export.
    - Booking status change. [MOCK]
    - Reviews tab. [MOCK]
  - Public page:
    - Type, tagline, views and hours table.
    - Reviews. [MOCK]
    - Booking bar driven by facilities and their real fees, replacing the hardcoded ₦200,000.
  > Done 2026-10-14. UI upgraded: list, card, chooser, add/edit form, claim form, detail page
  > with tabs, facilities, visitors, bookings, activities, reviews, and the public place page.
  > Existing API calls were left exactly as they were. Fixed on request: claim now stores the
  > selected place id.
  >
  > New features on sample data (`src/hooks/use-place-extras.ts`):
  > - tagline (edit on the detail page)
  > - remove facility
  > - add visitor
  > - booking status change
  > - reviews
  >
  > New features on real data:
  > - CSV export for visitors and bookings
  > - Activities tab (the merchant's events linked to the place)
  > - booking table shows real facility names and fees
  >
  > Reported, not changed (existing integration):
  > - The "Other" place type fails the form's zod enum.
  > - Edit PATCH doesn't send operating hours, amenities or the video URL.
  > - The public checkout shows a fixed ₦200,000 and its "Register" button does nothing.
  >
  > Still to wire: "Add Event" passes `?create=1&placeId=`. The Events page handles it in 4.2.

- [x] **4.2 Events**
  - Fixes:
    - [FIX] Insights Edit, Delete and Form Builder buttons do nothing.
    - [FIX] Sort options don't match their handlers.
    - [FIX] No pagination controls.
    - [FIX] Export Sheet does nothing.
    - [FIX] "Via deal" is hardcoded to 0.
  - Add:
    - Upcoming/Past filters.
    - Featured and cancelled badges, image fallback.
    - Attendee avatars. [MOCK]
    - Editable and removable ticket tiers.
    - `?create=1` deep link from Places.
    - Nigeria / Africa/Lagos defaults; merged timezone list.
    - Deal select limited to active deals.
  - Sales page:
    - 6 stat cards, Back and Public Page links.
    - Revenue badge and monthly sales chart.
    - CSV export.
  - Public page: kind, expected guests, views, end date, and a ticket card per tier that opens checkout.
  > Done 2026-10-14. UI upgraded across the Event Planner: header and stats, event cards
  > (fallback image, featured/cancelled/draft badges, date and time, views), filters and sort,
  > pagination, Insights popup (Edit wired, Form Builder "coming soon"), the create/edit form, the
  > sales page and the public event page. Existing API calls are unchanged.
  >
  > New features on real data:
  > - Upcoming/Past filter
  > - editable and removable ticket tiers
  > - active-only deal picker with discount label
  > - more timezones
  > - Nigeria / Africa/Lagos defaults for new events
  > - `?create=1&placeId=` deep link from Places
  > - sales CSV export
  > - Public Page link and revenue badge
  > - per-tier ticket cards on the public page
  >
  > New features on sample data (`src/hooks/use-event-extras.ts`):
  > - delete event (only offered once an event is cancelled)
  > - ticket sales via deal
  >
  > The public page dropped the review form and the Posts section; neither had a backend, and the
  > form did nothing.

- [x] **4.3 Deals**
  - Fixes:
    - [FIX] Insights charts show fixed fake data.
    - [FIX] Top/Poor Performing panels are always empty.
    - [FIX] Archives shows hardcoded menu items.
    - [FIX] Deactivate toast says "archived".
    - [FIX] "ENDED" filter isn't a valid status.
  - Add:
    - Table layout with campaign name, threshold, validity and redemptions. [MOCK]
    - Inline status change, Activate and Archive.
    - Top/Poor Performing panels. [MOCK]
    - Insights with redemptions, revenue and per-deal charts. [MOCK]
    - Download Report (CSV).
  > Done 2026-10-14. UI upgraded: header and stats, subscription screen, deals as a table, inline
  > Active/Paused status change, Manage menu, the deal form, Insights and Archives. Existing calls are
  > unchanged. Activate reuses the existing status endpoint (as Archives' reactivate already did).
  >
  > Fixed: the "Ended" filter value → "Expired"; the deactivate toast said "archived"; Archives showed
  > hard-coded menu items (now the deal's real products).
  >
  > Sample data (`src/hooks/use-deal-extras.ts`): redemptions, revenue, monthly performance charts,
  > Top/Poor Performing panels and the Download Report CSV. "Analyse with AI" shows "coming soon".
  >
  > Removed the old static charts (`performance-chart.tsx`, `revenue-chart.tsx`).

- [x] **4.4 Inventory**
  - Fixes:
    - [FIX] "Indefinite" sends `INFINITE`.
    - [FIX] Restock and Hide do nothing.
    - [FIX] Low-stock warning is hardcoded off.
    - [FIX] Item page has hardcoded panels (rating 4.2, stock log, price history, chart, related items).
  - Add:
    - Thumbnail and SKU in rows.
    - Inline visibility switch. [BE]
    - Restock +50 / +500. [BE] via quantity
    - "Updated" as time ago.
    - Default sort "Recently Updated"; "Stock: Low to High".
    - "Visible in storefront" toggle in the wizard.
  - Item page: real or [MOCK] data for each panel.
  > Done 2026-10-14. UI upgraded: header, stats, onboarding, table (thumbnail, SKU, time-ago,
  > visibility switch, Manage menu), the item form in the side panel, and the item detail page.
  > Existing calls are unchanged.
  >
  > New features on existing endpoints:
  > - Restock +50 / +500: the product update call with `quantity` (current + N)
  > - Show/Hide on the item page: the same status update the table already used
  > - low-stock warning: products list with `stockStatus=lowStock`
  > - related items: the products list filtered by category
  > - real rating, stock and pricing on the item page (the 4.2 rating and the hard-coded panels are gone)
  >
  > Sample data (`src/hooks/use-inventory-extras.ts`): item activity log, price history and monthly
  > units sold. Removed the old static `inventory-chart.tsx` and `item/_components/table.tsx`.
  >
  > Reported, not changed:
  > - "Indefinite" product type sends `INFINITE`, but the schema expects `INDEFINITE`.
  > - `upload-images.tsx` passes a `fileName` prop the upload component doesn't accept (an existing
  >   type error).

- [x] **4.5 Wallet**
  - Fixes:
    - [FIX] Balance, revenue and withdrawal show hardcoded N0.00.
    - [FIX] Transaction filter shows inventory options.
    - [FIX] "Loading inventory…" text.
    - [FIX] Chart is always empty.
    - [FIX] Period dropdowns do nothing.
    - [FIX] Deposit modal is static.
  - Add:
    - Gradient balance hero.
    - Inflow card and T+1 cadence card.
    - Recent activity list and transaction history. [MOCK]
    - Settled status.
    - Withdraw submits to the mock.
  > Done 2026-10-14. UI upgraded: gradient balance card (Deposit / Withdraw / POS, settlement
  > account chip), inflow and T+1 cadence cards, revenue/withdrawal stats, revenue chart and transaction
  > history. Wallet creation, settlement accounts and the withdraw flow are unchanged.
  >
  > The balance, deposit account number and bank name are read from the `GET /wallet` response when
  > present (`balance`/`availableBalance`, `accountNumber`, `bankName`). Otherwise the balance falls
  > back to a labelled sample, and the deposit popup says details aren't available. The old deposit
  > popup's fake ₦30,000, account number and timer are gone.
  >
  > Sample data (`src/hooks/use-wallet-extras.ts`, the same ledger as Overview/Settlement): revenue,
  > inflow, withdrawals, the revenue chart (week/month/year) and transaction history with working
  > filters, search, pagination and receipt download.
  >
  > Not changed: the POS popup still shows a static QR image; Withdraw still doesn't call an API
  > (as before).

- [x] **4.6 Customers**
  - Add:
    - ₦ spend per service and total spent, alongside the visit counts. [MOCK]
    - Initials avatars.
    - CSV export.
  - Note: search stays page-only until the backend adds a search parameter.

  > Done. `useCustomers` and `GET /places/customers` are unchanged (service filter, sort, server
  > pagination). The page now has a breadcrumb, a header with the real total, Select filters, a
  > restyled table with initials avatars, a skeleton while loading and an "Export Sheet" CSV of
  > the rows shown (real data).
  >
  > Sample data (`src/hooks/use-customer-extras.ts`): a Visits / Spend toggle. Spend is the
  > customer's real visit counts multiplied by a stable per-customer amount, labelled
  > "Sample spend".
- [x] **4.7 Apps & Tools**
  - Add:
    - "Open" link on active apps.
    - Default / Integrated / Available badge based on the app's real state.
    - Toasts.
    - "More integrations" banner.
    - Saved activation. [MOCK], except Deals, which already has a real subscription endpoint.
  - Fix:
    - [FIX] "John Doe" publisher placeholder.
  - **Open question (backend):** login and `GET /auth/me` return capability flags
    (`canCreateWallet`, `canCreateMenuItems`, `canCreatePlaces`, `canCreateEvents`,
    `canCreateInventory`, `canCreateDeal`, …), now stored on `user.capabilities`. They may be the
    persisted app toggles, possibly updated with `PUT /profile`, but they may also be KYC-gated
    permissions. Confirm with the backend team before wiring app activation to them.

  > Done. App on/off still uses the existing Redux `apps` slice, which redux-persist already saves,
  > so no mock was needed. Deals' `GET /deals/subscriptions` is untouched. The page has the
  > prototype's cards: a Default / Integrated / Available badge from the app's real state, an "Open"
  > link on active apps, an "Activate" switch with toasts, a Select category filter, an empty state
  > and the "More integrations" banner. "Read more" is now a Dialog with the same controls. The
  > "John Doe" publisher on Deals is removed, so it shows "SpinStrip". The open question about
  > capability flags is still open.
- [x] **4.8 Settings**
  - Turn the 5 "coming soon" cards into working pages:
    - Preferences: notification and auto-settlement switches. [MOCK]
    - Security: change password. [MOCK]; the backend only has OTP reset.
    - Payments: reuse the real settlement bank accounts.
    - Integrations and Legal: placeholders.
  - Compliance:
    - Status summary card with progress and checklist.
    - Approved and rejected states, showing `adminNotes` on rejection.
    - "Why compliance matters" card.
  - Fixes:
    - [FIX] "Sucessful" typo.
    - [FIX] Hardcoded sub-category list.
    - [FIX] Country dropdown not wired up.

  > Done. The KYC submit (`POST /kyc/merchant`), the status query and the wizard logic are unchanged.
  > - Hub: cards for all six sections (none "coming soon"), showing compliance status and progress.
  >   Sub-pages share a pill tab bar (`settings/layout.tsx`).
  > - Compliance: status card (progress, milestones, verified / in-review / rejected with
  >   `adminNotes`) and "Why compliance matters". The wizard is hidden once verified and titled
  >   "resubmit" when rejected. "Sucessful" typo fixed.
  > - Sub-category options follow the chosen business category (`subCategoriesFor` in
  >   `settings/_constants`); the country dropdown now shows the form's value (new optional `value`
  >   prop on `CountrySelectDropdown`).
  > - Payments: the real settlement accounts (list, make default, remove, add via the existing
  >   wallet modal).
  > - Sample data (`src/hooks/use-settings-extras.ts`): Preferences saved in the browser; Change
  >   Password simulated, with a link to the real OTP reset.
  > - Integrations and Legal: informational pages (link to Apps & Tools; documents "published soon").

## Phase 5 — Extra public pages and the waiter app (confirm scope)

- [x] **5.1 Discover** (`/discover`, public). Hero, published places, live events, merchant CTA. [MOCK]
- [x] **5.2 Waiter app** (`/waiter`, waiter role only). Floor plan (refreshes every 15s, guests
      today, open orders), seat-guests stepper, read-only menu. Shares Menu's table data. [MOCK]
- [x] **5.3 Login.** Redirect by role; optional visual refresh.

> Done 2026-10-15.
> - Discover (`src/app/discover`, public, own QueryProvider): hero with search, city pills, place
>   and event cards with a detail dialog, merchant CTA ("Back to Dashboard" / "List a Place" when
>   signed in). Listings are sample data (`src/hooks/use-discover.ts`, `src/mocks/discover.ts`).
>   Overview now has the "View on SpinStrip Discover" tile.
> - Waiter app (`src/app/waiter`, signed in, no sidebar): floor plan from `useWaiterFloor`
>   (sample tables shared with Menu → Tables & QR; refreshes every 15s; guests today, occupied,
>   open orders), seat-guests stepper via `useSeatGuests`, and a read-only menu from the existing
>   `usePublicMenu` (the real menu when signed in). Owners and admins see a "back to dashboard"
>   button; waiters are still sent here by `PermissionGate`.
> - Login: role redirect was done in Phase 1; no visual refresh.

## Phase 6 — Dark mode

- [x] Move the ~507 remaining hex colours and ~120 `color="#…"` icon props onto tokens (most are
      done along the way in Phases 1–4).
- [x] Add `next-themes`, the topbar toggle and the Preferences switch.

> Done 2026-10-15.
> - `next-themes` (`src/providers/theme-provider.tsx`): light / dark / system, saved per browser.
>   Dark mode covers the dashboard, the waiter app and Discover. The sign-in screens and the
>   public `/preview/*` pages are forced to light (they keep their light brand styling).
> - Toggles: sun/moon button in the topbar, the waiter header and Discover; Light / Dark / System
>   in Settings → Preferences.
> - Remaining hard-coded greys, whites and hex colours in the dashboard and shared components
>   were moved to tokens (class names only; no logic changed). Left as is: status tints in Room
>   Inventory, white buttons on gradient cards, and the white background behind table QR codes
>   (needed for scanning).
> - Charts re-read their colours on theme change (`useChartThemeKey` in `src/lib/chart-theme.ts`).
> - Not verified in a browser by me: please click through in dark mode and send screenshots of
>   anything that looks off.

## Phase 7 — Wrap-up

- [x] Update README.md and SPEC.md (new routes, mock layer, permissions model, what's mocked).
- [x] List of endpoints the backend team needs to build to replace each mock.

> Done 2026-10-15. README and SPEC.md describe every route, the roles model, the sample-data layer,
> dark mode and the known bugs. The endpoints list is now its own document for the backend team:
> [docs/backend-endpoints-needed.md](backend-endpoints-needed.md) (it supersedes the list below,
> and adds Overview, Settlement, Billing, Admin & Roles and Menu tables).

## Endpoints needed by mocked features

> Superseded by [docs/backend-endpoints-needed.md](backend-endpoints-needed.md), which is the maintained version.

Features added on dummy data in already-integrated modules. Each needs a backend endpoint before its
mock hook can be swapped for the real call.

**Places**
- Place tagline (field on create/update and in GET responses)
- Publish / change approval status from the dashboard
- Delete or edit a facility
- Add a visitor manually
- Change a booking's status (PENDING / CONFIRMED / CANCELLED / COMPLETED / NO_SHOW)
- Reviews for a place (list, and on the public page)
- Follow a place (public page)
- Public booking request for a facility (the checkout's "Register" currently does nothing)

**Events**
- Delete an event
- Ticket sales via deal (count per event, or a `viaDeal` flag on registrations)
- Event reviews / posts on the public page
- Form Builder

**Deals**
- Redemptions and revenue per deal (totals and per month)
- Archive as a status separate from Paused, if the product needs both
- AI analysis

**Inventory**
- Stock activity log per item (restocks, sales, adjustments, who made them)
- Price history per item
- Units sold per month per item
- A dedicated restock endpoint, if the backend prefers one over updating `quantity`

**Wallet**
- Wallet balance and funding account fields documented on `GET /wallet` (confirm field names)
- Wallet transactions / payment history (with receipts)
- Revenue and withdrawal totals per period
- Withdrawal submission (with transaction PIN)
- A merchant POS payment QR / payment link

**Customers**
- Spend per service (menu, events, places) and total spent per customer
- A search parameter on `GET /places/customers` (search currently filters only the loaded page)

**Settings**
- Notification / auto-settlement preferences (get and update)
- Change password while signed in (current + new password)
- Business sub-categories per category (currently a static list)
- Legal documents (URLs, versions, acceptance history)

**Discover**
- Public listing of published places and live events across merchants (with city and search filters)

**Waiter app**
- Dining tables, seat guests and open orders per table (shared with Menu → Tables & QR)


## Follow-up (2026-10-15): public site and backend docs

- [x] Customer-facing pages moved to the public site (`https://places.spinstrip.com`): dashboard links
      and table QR codes point there (`src/lib/public-links.ts`); `/preview/*` redirects there
      (`next.config.ts`); the dashboard's copies of the preview pages were removed.
- [x] Discover uses real public listings (places, events, restaurants derived from menu items).
- [x] `docs/backend-endpoints-needed.md` rewritten against the services' Swagger docs: Part A lists
      endpoints that already exist (waiters, waiter login and orders, realtime, place status /
      facilities / bookings / visits, event status, deal delete, inventory stock, wallet history,
      payouts, PIN, notifications); Part B is what's still needed.
- [x] Wire the Part A endpoints into the dashboard, replacing the matching sample hooks: waiters
      (Admin & Roles), place submit-for-review / tagline / facility delete / booking status / walk-in
      visitors, inventory restock, wallet history + withdrawals + PIN, notifications. The dashboard
      `/waiter` page was removed: waiters use the separate SpinStrip waiter app. Fixed the inventory
      product-type enum and the Deals subscription path (documented path first, old path as fallback).
