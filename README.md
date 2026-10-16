# SpinStrip Merchant Dashboard

The web app merchants use to run their business on the SpinStrip platform. Merchants sign up, complete KYC, then turn on modular "Apps/Tools" (Wallet, Event Planner, Menu, Inventory, Places, Deals, Customers). It also has a business overview, settlement and billing pages, team roles and a Discover page. Waiters use the separate **SpinStrip waiter app** (mobile) for login, the order queue, guest chat and live order updates. This dashboard only adds, lists and removes waiters (Admin & Roles).

Customer-facing pages (place, event and restaurant pages, booking, ticketing and ordering) live on the separate public site, **https://places.spinstrip.com** (repo `SpinStrip-Projects/places`). The dashboard links there and forwards its old `/preview/*` URLs there.

> **Some features run on sample data.** Everything the backend supports is wired to it. Features from the product prototype that have no backend endpoint yet are fully built but use generated sample data, marked on screen with a "Sample" badge. See [Sample data](#sample-data) and [docs/backend-endpoints-needed.md](docs/backend-endpoints-needed.md).

- **Production URL:** https://merchant.spinstrip.com
- **Repository:** https://github.com/SPINSTRIP1/Merchant-dashboard
- **Type:** Frontend only (Next.js 15 App Router, React 19, TypeScript). It has no database or server-side API of its own. All data comes from the SpinStrip backend services listed below.
- **Currency:** Nigerian Naira (₦)

> For full detail on architecture, endpoints, domain models, form patterns and coding rules, see [SPEC.md](SPEC.md). This README covers what you need to run, configure and deploy the app.

---

## Contents

1. [What the service does](#what-the-service-does)
2. [Responsibility](#responsibility)
3. [Tech stack](#tech-stack)
4. [Running locally](#running-locally)
5. [Environment variables](#environment-variables)
6. [Service and API keys](#service-and-api-keys)
7. [Dependencies on other services](#dependencies-on-other-services)
8. [Configuration](#configuration)
9. [Roles and permissions](#roles-and-permissions)
10. [Sample data](#sample-data)
11. [Deployment](#deployment)
12. [Production considerations](#production-considerations)
13. [Project structure](#project-structure)
14. [Development conventions](#development-conventions)
15. [Troubleshooting](#troubleshooting)
16. [Known gaps](#known-gaps)

---

## What the service does

### Merchant dashboard (needs login)

"Sample" marks parts that run on [sample data](#sample-data) until the backend supports them.

| Area | Route | What merchants can do |
|---|---|---|
| Overview | `/` | KPIs for a date range, revenue and customer charts, product performance, recent transactions and events. Counts of menu items, inventory, places, deals and events are live; money and customer analytics are sample |
| Apps & Tools | `/apps-tools` | Browse, search and filter apps; turn them on or off; open active apps |
| Menu | `/apps-tools/menu` | Menu items, pricing, availability, add-ons, allergens, featured items, configuration. Table Analytics and Top Menus use real orders (`GET /menu/orders`); the Tables & QR list is saved in the browser until a tables endpoint exists |
| Places | `/apps-tools/places`, `/apps-tools/places/[id]` | Create or claim a place; facilities, operating hours, bookings, visitors, activities. Customer bookings (from the public site) with cancel, appointments, submit for review, facility removal and walk-in visitors use the API; taglines are saved on the device and reviews are sample |
| Event Planner | `/apps-tools/event-planner`, `…/sales-registrations` | Create and manage events and ticket tiers; registrations, revenue and tier stats with CSV export. Delete and via-deal counts are sample |
| Deals | `/apps-tools/deals`, `…/archives` | Subscription-gated campaigns and deals, activate/pause. Redemption and revenue insights are sample |
| Inventory | `/apps-tools/inventory`, `…/item?id=` | Products, catalogues, stock levels, restock (stock endpoint), visibility, low-stock warnings. Item history is sample |
| Wallet | `/apps-tools/wallet` | Create a wallet, deposit details, POS, settlement accounts, transaction history, money-in chart, withdrawals with transaction PIN. Only the balance falls back to a sample when the API doesn't return one |
| Customers | `/apps-tools/customers` | Customer list with service filter, sort, search, CSV export. Spend per service is sample |
| Settlement | `/settlement` | Daily settlement batches and settled transactions with CSV export (sample) |
| Billing | `/billing` | Monthly bill from the active paid apps; invoices and card on file are sample |
| Admin & Roles | `/admin` | Owner only. Waiters: add an existing SpinStrip user by email, list, remove (API). Admin Ops with chosen permissions (sample) |
| Settings | `/settings/*` | Compliance (KYC wizard and status), Preferences (theme; sample notifications), Security (sample change password), Payments (real settlement accounts), Integrations, Legal |

### Public pages (no login)

| Route | Purpose |
|---|---|
| `/discover` | SpinStrip Discover: published places, live events and restaurants across merchants, from the public listing endpoints. Cards open the public site |
| `/preview/*` | **Redirects** to the same path on the public site, keeping the query string (old links and Paystack callbacks keep working). `/preview/menu` without an `id` goes to the public home |

Links to the public site are built in `src/lib/public-links.ts`: place, event, dish and restaurant pages, and table QR codes (`/restaurants/{merchantUserId}?number=7`).

### Auth pages

`/login`, `/register`, `/otp-verification`, `/forgot-password`, `/reset-password`

---

## Responsibility

**This app is responsible for:**

- The merchant-facing UI for every module above.
- Client-side session handling: storing access and refresh tokens, attaching them to requests, refreshing on `401`, and logging out when refresh fails.
- Client-side route protection for the dashboard.
- Client-side form validation (zod schemas) before data is sent to the API.
- Linking merchants to their public pages on places.spinstrip.com, and generating table QR codes for them.
- Per-browser app on/off state in the Apps/Tools catalogue, and the light/dark theme choice.
- Hiding dashboard sections a team member's role doesn't allow (the backend must still enforce access).
- Generating sample data for features the backend doesn't support yet (see [Sample data](#sample-data)).

**This app is not responsible for (handled by backend services):**

- Authentication, user accounts and token issuing.
- Business data storage, business rules and authorisation.
- KYC review and approval.
- Payment processing, payment verification and wallet ledgers.
- Media storage (files are uploaded to the API, which stores them in DigitalOcean Spaces).
- Email and OTP delivery.

**Ownership and contacts:** _To be completed by the team._

| Role | Name / team | Contact |
|---|---|---|
| Frontend owner | _TBC_ | _TBC_ |
| Backend (merchant gateway) owner | _TBC_ | _TBC_ |
| Deployment / hosting owner | _TBC_ | _TBC_ |

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript 5 |
| Styling | Tailwind CSS 3.4 with CSS-variable design tokens, shadcn-style Radix UI primitives (dialog, sheet, tabs, select, popover, …) |
| Theme | `next-themes`: light, dark or system |
| Animation | framer-motion |
| Server state | TanStack React Query v5 |
| Client state | Redux Toolkit + redux-persist (localStorage) |
| Forms | react-hook-form + zod v4 |
| HTTP | axios (one configured instance in `src/lib/api/axios-client.ts`) |
| Charts | chart.js + react-chartjs-2 |
| Toasts | react-hot-toast |
| Fonts | Plus Jakarta Sans (body) and Outfit (headings, totals) through `next/font/google` |
| QR codes | qrcode.react (table QR codes) |

---

## Running locally

### Prerequisites

- **Node.js 18.18 or later** (Next.js 15 minimum). Node 22 is known to work.
- **npm** (the repo has a `package-lock.json`; use npm so the lockfile stays consistent).
- Network access to the SpinStrip backend services (see [Dependencies](#dependencies-on-other-services)).

### Steps

```bash
git clone https://github.com/SPINSTRIP1/Merchant-dashboard.git
cd Merchant-dashboard
npm install

npm run dev
```

Open **http://localhost:3001**. The dev server runs on port **3001**, not the Next.js default of 3000.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server on port 3001 with hot reload |
| `npm run build` | Production build into `.next/` |
| `npm run start` | Serves the production build (port 3000 by default; use `npm run start -- -p <port>` or set `PORT`) |
| `npm run lint` | Runs ESLint (`next lint`) |

There is no test suite.

### Logging in locally

Local dev talks to the **live** backend services (the URLs are hard-coded, see [Configuration](#configuration)). Use a real merchant account, or register one through `/register`. Anything you create locally is created in that backend.

---

## Environment variables

Next.js loads these from `.env.local` locally (git-ignored) and from the hosting provider's settings in production. Variables prefixed `NEXT_PUBLIC_` are **embedded into the browser bundle at build time**, so they are public and changing them needs a rebuild.

| Variable | Required | Used in | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_PUBLIC_SITE_URL` | No (default `https://places.spinstrip.com`) | `src/lib/public-links.ts`, `next.config.ts` | Base URL of the public, customer-facing site. Set it to a staging site to test links and QR codes. |
| `NODE_ENV` | Set automatically | `src/store/index.ts` | Redux DevTools are turned off when `production` |
| `PORT` | No | `next start` | Port for the production server (default 3000) |

**Not environment variables:** the backend API base URLs are hard-coded constants in `src/constants/index.ts`. See [Configuration](#configuration).

---

## Service and API keys

| Key / account | Where it is used | Notes |
|---|---|---|
| **Merchant access / refresh tokens** | Issued at login by the merchant gateway | Stored in the browser; not configured by developers. |

No other secrets are needed to build or run this app. The Google Maps key and Paystack checkout now belong to the public site, not this app.

---

## Dependencies on other services

All backend responses use the envelope `{ status, message, data }`. Paginated lists nest one level deeper.

| Service | Base URL | Used for | Auth |
|---|---|---|---|
| **Merchant gateway** (`SERVER_URL`) | `https://spinstrip-merchant-gateway.fly.dev/api/v1` | Login, registration, OTP, password reset, token refresh, KYC, events, places, inventory, menu, deals, customers, media uploads | Bearer token (except auth endpoints and `/events/public/*`, `/places/public/*`) |
| **User account** (`USER_ACCOUNT_URL`) | `https://spinstrip-user-account.fly.dev/api/v1` | Current user (`/auth/me`), wallets, banks, bank account resolution, settlement bank accounts | Bearer token |
| **Places** (`PLACES_API_URL`) | `https://spinstrip-places.fly.dev/api/v1` | Public place listings for Discover | None (public) |
| **Menu** (`MENU_API_URL`) | `https://spinstrip-menu.fly.dev/api/v1` | Public menu items for Discover's restaurants | None (public) |
| **Public site** | `https://places.spinstrip.com` | Customer-facing place, event and restaurant pages that the dashboard links to | — |
| **DigitalOcean Spaces** | `spin-strip.sfo3.digitaloceanspaces.com` | Serves uploaded images and documents (written by the backend) | Public read |
| **flagcdn.com** | `https://flagcdn.com` | Country flag images in country pickers | Public |

The backend services are hosted on **Fly.io**. If any of them is down, the matching parts of the dashboard fail (lists show empty states, forms show error toasts). Login needs the merchant gateway.

The full endpoint list is in [SPEC.md, section 4](SPEC.md#4-backend-services). Every service publishes Swagger docs (for example `https://spinstrip-places.fly.dev/api/docs`); [docs/backend-endpoints-needed.md](docs/backend-endpoints-needed.md) lists them and what is still missing.

---

## Configuration

| What | Where | Notes |
|---|---|---|
| Backend base URLs | `src/constants/index.ts` (`SERVER_URL`, `USER_ACCOUNT_URL`, `EVENTS_SERVER_URL`) | Hard-coded. To point at staging or a local backend, edit these constants. |
| HTTP client | `src/lib/api/axios-client.ts` | 100 s timeout, Bearer token injection, one refresh attempt on `401`, then logout and redirect to `/login` |
| Allowed remote image hosts | `next.config.ts` → `images.domains` | Add a host here before using it with `next/image`, otherwise images fail to load |
| Build checks | `next.config.ts` | `eslint.ignoreDuringBuilds: true` and `typescript.ignoreBuildErrors: true` (see [Production considerations](#production-considerations)) |
| Site metadata / SEO | `src/app/layout.tsx` | `metadataBase` is `https://merchant.spinstrip.com`; title template `"%s \| SpinStrip Merchant"` |
| Apps catalogue | `src/constants/index.ts` (`apps`) | Which apps exist, prices, default on/off, routes. Several future apps are commented out. |
| Sidebar navigation | `src/constants/sidebar.tsx` | Sections General / Apps / Business. App links show only when the app is on and the user has the permission. |
| Theme and colours | `tailwind.config.ts`, `src/app/globals.css`, `src/providers/theme-provider.tsx` | Primary `#6932E2`. Colours are tokens in `globals.css` with light (`:root`) and dark (`.dark`) values. Dark mode covers the dashboard and `/discover`; sign-in screens are forced to light. |
| Chart colours | `src/lib/chart-theme.ts` | Charts read the colour tokens; `useChartThemeKey` redraws them when the theme changes |
| Roles and permissions | `src/lib/permissions.ts` | See [Roles and permissions](#roles-and-permissions) |
| UI component generator | `components.json` | shadcn config (`new-york` style) |
| Path alias | `tsconfig.json` | `@/*` → `src/*` |
| Persisted client state | `src/store/index.ts` | redux-persist key `root`, whitelist `auth`, `apps` |

---

## Roles and permissions

`src/lib/permissions.ts`, used through `usePermissions()` and `<PermissionGate>`.

| Role | Access |
|---|---|
| `owner` | Everything, including Admin & Roles |
| `admin_ops` | Only the sections in `user.dashboardPermissions` (overview, menu, places, events, inventory, deals, customers, wallet, settlement, billing, settings) |
| `waiter` | No dashboard access: they use the SpinStrip waiter app. A waiter who signs in here is told to use the app |

The role comes from `user.role`. **Today every account is treated as the owner**: the backend doesn't have merchant team accounts yet, and the platform profiles (`USER`, `MERCHANT`, `ADMIN`) are not merchant roles. After login, users land on the first page their role allows. Hiding pages is a convenience only. The backend must enforce access on every request.

---

## Sample data

Features from the product prototype that the backend can't serve yet are fully built, but read generated data instead of calling an API:

- **Where:** fixtures in `src/mocks/`, always reached through a hook in `src/hooks/` (for example `use-overview.ts`, `use-settlements.ts`, `use-team.ts`, `use-menu-tables.ts` and the `use-*-extras.ts` files).
- **On screen:** marked with a "Sample" badge (`SampleDataBadge`, or `sample` on `StatCard`).
- **Stability:** generated from fixed seeds, so the numbers stay the same across reloads. Changes made to sample data, such as adding a table or a team member, last until the page is reloaded; a few (preferences, taglines, booking status) are kept in `localStorage`.
- **Existing calls untouched:** sample features sit alongside the real API calls and never replace them.

To connect one to the backend, change only its hook. The list of endpoints needed, with suggested shapes, is in [docs/backend-endpoints-needed.md](docs/backend-endpoints-needed.md).

---

## Deployment

The repo has **no deployment config** (no Dockerfile, no `vercel.json`, no CI). It is a standard Next.js app, so either option below works. _Confirm with the deployment owner which one production actually uses and update this section._

### Option A: Vercel (simplest)

1. Import the GitHub repo into Vercel. Framework preset: **Next.js**. No build settings need changing.
2. Add the custom domain `merchant.spinstrip.com`.
3. Pushes to `main` deploy to production; other branches get preview URLs.

### Option B: Any Node.js host (VM, container, Fly.io, etc.)

```bash
npm ci
npm run build
PORT=3000 npm run start
```

Put it behind a reverse proxy or load balancer that terminates HTTPS. The process is stateless, so you can run several instances.

A minimal Dockerfile for this option:

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm", "run", "start"]
```

Build with `docker build -t spinstrip-merchant .`

### Deployment checklist

- [ ] Backend URLs in `src/constants/index.ts` point at the right environment.
- [ ] `npx tsc --noEmit` and `npm run lint` pass locally (the build will not catch these, see below).
- [ ] The backend's CORS settings allow the dashboard's domain.
- [ ] After deploy: log in, open a module, open a place's "Preview Public Page" (it should land on places.spinstrip.com), and load `/discover`.

---

## Production considerations

**Build safety**

- `next.config.ts` ignores TypeScript and ESLint errors during build. A broken type will **not** fail the deploy. Run `npx tsc --noEmit` and `npm run lint` before releasing, and ideally add them to CI.
- There are no automated tests and no CI pipeline. Every release relies on manual checks.

**Environments**

- Backend URLs are hard-coded, so staging and production cannot be switched with env vars. Pointing a build at another backend means a code change. Moving these to `NEXT_PUBLIC_*` variables is recommended.
- `NEXT_PUBLIC_*` values are fixed at build time. Changing the Maps key needs a rebuild and redeploy.

**Security**

- Access and refresh tokens are stored in `localStorage`, "encrypted" with base64 and a static salt. This is **obfuscation, not encryption**. Any XSS bug could leak tokens, so avoid `dangerouslySetInnerHTML` and untrusted third-party scripts. Moving to httpOnly cookies would be safer.
- Route protection is client-side only (`src/providers/auth-provider.tsx`). Dashboard page code is still downloadable without login; real protection depends on the backend checking the Bearer token on every request.
- The Google Maps key is public by design. Restrict it by referrer and API.
- Consider adding security headers (CSP, `X-Frame-Options`, `Referrer-Policy`) through `next.config.ts` `headers()` or the hosting layer.

**Payments**

- The success page verifies the payment with the events service using the `reference` / `trxref` query parameter. It only displays the result; the backend is the source of truth for whether a ticket is paid.

**Reliability and performance**

- The axios timeout is 100 seconds, so a slow backend makes the UI wait a long time before showing an error.
- Errors are only logged to the browser console. There is no error tracking (for example Sentry) or analytics. Add one before relying on production monitoring.
- `images.domains` in `next.config.ts` is deprecated in Next.js 15; plan to move to `images.remotePatterns`.

**State**

- App on/off choices in the catalogue, the theme and the sample Preferences are stored only in the browser and are not synced to the server. Clearing site data or changing device resets them.
- Sample data is generated in the browser. It is clearly labelled, but merchants can see it in production until the matching endpoints exist. Decide before launch whether any sample-only page (Settlement, Billing) or section (Admin Ops) should be hidden.

---

## Project structure

```
src/
  app/
    (auth)/          Login, register, OTP, forgot/reset password (no auth guard)
    (dashboard)/     Merchant dashboard, wrapped in React Query + AuthProvider
      page.tsx       Overview
      apps-tools/    One folder per module (_components, _schemas, _context, _constants, _types)
      settlement/, billing/, admin/
      settings/      Settings hub, compliance (KYC), preferences, security, payments, integrations, legal
    discover/        Public Discover page (real listings; cards open the public site)
    layout.tsx       Root layout: Redux and theme providers, toaster, fonts, metadata
  components/        Shared components; ui/ holds design-system primitives and form inputs
  constants/         API base URLs, apps catalogue, sidebar
  hooks/             All data-fetching hooks (use-<domain>.ts; use-*-extras.ts for sample features)
  lib/               axios client, permissions, chart theme, form-context factory, upload helpers
  mocks/             Sample-data fixtures (only imported by hooks)
  providers/         Redux, React Query, auth and theme providers
  store/             Redux store, slices (auth, apps), selectors
  utils/             Formatting, token obfuscation helpers
public/              Images, icons
docs/                Port plan and the backend endpoints list
SPEC.md              Full technical specification
```

---

## Development conventions

The full rules are in [SPEC.md, section 14](SPEC.md#14-rules-for-new-code). The key ones:

1. **Every endpoint gets a reusable hook** in `src/hooks/use-<domain>.ts`. Never call `useQuery` or axios directly in a component.
2. Export response types from the hook file; components import them from there.
3. Always use `api` from `@/lib/api/axios-client` (it adds the token and handles refresh). Pass an absolute URL to reach a non-default service, e.g. `` api.get(`${USER_ACCOUNT_URL}/wallet`) ``.
4. Forms use react-hook-form + zod; multi-step flows use `createFormContext`.
5. Use the Tailwind design tokens, not ad-hoc hex colours, so dark mode keeps working.
6. Files are kebab-case; route-private folders start with `_`.
7. Never change an existing, working API call to add a feature. A feature without a backend endpoint gets its own hook backed by `src/mocks/`, a "Sample" badge, and an entry in `docs/backend-endpoints-needed.md`.

---

## Troubleshooting

| Problem | Likely cause / fix |
|---|---|
| Redirected to `/login` straight away | No valid token in the browser. Log in again. If it loops, clear site data (localStorage keys `spinstrip_at`, `spinstrip_rt`, `spinstrip_user`, `persist:root`). |
| "Session expired. Please login again." | The refresh token was rejected by the merchant gateway. Log in again. |
| "Preview Public Page" opens places.spinstrip.com | Expected: customer-facing pages live on the public site. Set `NEXT_PUBLIC_PUBLIC_SITE_URL` to use another one. |
| Remote image fails with a Next.js host error | Add the host to `images.domains` in `next.config.ts`. |
| Requests fail with CORS errors | The backend does not allow the current origin. Ask the backend owner to add it. |
| Lists show empty states everywhere | A backend service is down or unreachable. Check the base URLs and the Fly.io services. |
| App opens on port 3001 locally but 3000 in production | Expected: `dev` uses `-p 3001`, `start` uses the default. |
| A number has a "Sample" badge | Expected: that feature has no backend endpoint yet. See [Sample data](#sample-data). |
| `npm run dev` starts returning 500s after a build | `next build` and `next dev` share `.next`. Stop the dev server before building in the same folder, or build in a copy. |

---

## Known gaps

- The features listed in [docs/backend-endpoints-needed.md](docs/backend-endpoints-needed.md) run on sample data.
- Merchant team accounts and roles are not supported by the backend yet, so everyone signs in as the owner.
- Known bugs left as they are, because fixing them needs a backend decision or would change a working integration:
  - Places: editing doesn't send operating hours, metadata or the video URL; the "Other" place type fails validation.
  - Editing a place can't change its `metadata` (amenities): the API ignores it, so taglines are saved on the device for now.
  - Wallet's POS popup shows a static QR, and Withdraw doesn't call an API.
- Chat, Groups, Socials, Reviews, Payment Method, Memberships and Ads are commented out of the catalogue.
- Pagination response shapes are not consistent across endpoints (see [SPEC.md, section 15](SPEC.md#15-known-gaps--caveats)).
- Pre-existing TypeScript errors remain in `inventory/_components/steps/upload-images.tsx`, `places/_context/index.tsx` and `components/ui/forms/form-array-input.tsx` (the build ignores type errors).
