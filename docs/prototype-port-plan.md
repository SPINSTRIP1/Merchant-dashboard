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
- **Mock data only for brand-new sections.** Overview analytics, Settlement, Billing, Admin &
  Roles, the waiter app and Discover use fixtures from `src/mocks/` behind hooks in `src/hooks`.
- **Integrated modules use real data only (decided 2026-10-14).** Places, Events, Deals, Inventory,
  Wallet, Customers and Settings get the redesign, bug fixes and features the existing endpoints
  support. Prototype features with no endpoint are **left out** and listed under "Backend requests"
  at the end of this file. Every `[MOCK]` item in Phase 4 below is therefore out of scope until
  the backend adds the endpoint.
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

- [ ] **4.1 Places**
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
- [ ] **4.2 Events**
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
- [ ] **4.3 Deals**
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
- [ ] **4.4 Inventory**
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
- [ ] **4.5 Wallet**
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
- [ ] **4.6 Customers**
  - Add:
    - ₦ spend per service and total spent, alongside the visit counts. [MOCK]
    - Initials avatars.
    - CSV export.
  - Note: search stays page-only until the backend adds a search parameter.
- [ ] **4.7 Apps & Tools**
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
- [ ] **4.8 Settings**
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

## Phase 5 — Extra public pages and the waiter app (confirm scope)

- [ ] **5.1 Discover** (`/discover`, public). Hero, published places, live events, merchant CTA. [MOCK]
- [ ] **5.2 Waiter app** (`/waiter`, waiter role only). Floor plan (refreshes every 15s, guests
      today, open orders), seat-guests stepper, read-only menu. Shares Menu's table data. [MOCK]
- [ ] **5.3 Login.** Redirect by role; optional visual refresh.

## Phase 6 — Dark mode

- [ ] Move the ~507 remaining hex colours and ~120 `color="#…"` icon props onto tokens (most are
      done along the way in Phases 1–4).
- [ ] Add `next-themes`, the topbar toggle and the Preferences switch.

## Phase 7 — Wrap-up

- [ ] Update README.md and SPEC.md (new routes, mock layer, permissions model, what's mocked).
- [ ] List of endpoints the backend team needs to build to replace each mock.

## Backend requests

Prototype features left out of integrated modules because no endpoint exists yet. Each one can be
built as soon as the backend adds it.

**Places**
- Place tagline (field on create/update and in GET responses)
- Publish / change approval status from the dashboard
- Delete or edit a facility
- Add a visitor manually
- Change a booking's status (PENDING / CONFIRMED / CANCELLED / COMPLETED / NO_SHOW)
- Reviews for a place (list, and on the public page)
- Follow a place (public page)
- Public booking request for a facility (the checkout's "Register" currently does nothing)

