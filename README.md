# SpinStrip Merchant Dashboard

The web app merchants use to run their business on the SpinStrip platform. Merchants sign up, complete KYC, then turn on modular "Apps/Tools" (Wallet, Event Planner, Menu, Inventory, Places, Deals, Customers). It also serves the public, consumer-facing event and place pages, including event ticket checkout.

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
9. [Deployment](#deployment)
10. [Production considerations](#production-considerations)
11. [Project structure](#project-structure)
12. [Development conventions](#development-conventions)
13. [Troubleshooting](#troubleshooting)
14. [Known gaps](#known-gaps)

---

## What the service does

### Merchant dashboard (needs login)

| Area | Route | What merchants can do |
|---|---|---|
| Apps/Tools catalogue | `/apps-tools` | Browse, search, filter and turn apps on or off |
| Wallet | `/apps-tools/wallet` | Create a wallet, deposit/withdraw, POS, settlement bank accounts, transaction history, revenue chart |
| Event Planner | `/apps-tools/event-planner` | Create and manage events, ticket tiers, media |
| Event sales | `/apps-tools/event-planner/sales-registrations` | Registrations, revenue and ticket-tier stats |
| Menu | `/apps-tools/menu` | Menu items, pricing, availability schedules, add-ons, allergens |
| Inventory | `/apps-tools/inventory` | Products, catalogues, stock levels, variants, slot booking |
| Places | `/apps-tools/places`, `/apps-tools/places/[id]` | Create or claim a place; facilities, operating hours, bookings, visitors |
| Deals | `/apps-tools/deals` | Subscription-gated discount campaigns and performance |
| Customers | `/apps-tools/customers` | Customer list with search, filter and pagination |
| Settings / KYC | `/settings`, `/settings/compliance` | Account settings and the 4-step KYC wizard |
| Overview, Billing | `/`, `/billing` | Placeholders ("coming soon") |

### Public pages (no login)

| Route | Purpose |
|---|---|
| `/preview/events?id=<eventId>` | Public event page and ticket checkout |
| `/preview/events/success` | Return page after Paystack payment; verifies the payment |
| `/preview/places?id=<placeId>` | Public place page |

### Auth pages

`/login`, `/register`, `/otp-verification`, `/forgot-password`, `/reset-password`

---

## Responsibility

**This app is responsible for:**

- The merchant-facing UI for every module above.
- Client-side session handling: storing access and refresh tokens, attaching them to requests, refreshing on `401`, and logging out when refresh fails.
- Client-side route protection for the dashboard.
- Client-side form validation (zod schemas) before data is sent to the API.
- Starting the Paystack checkout for public event tickets and showing the verification result.
- Per-browser app on/off state in the Apps/Tools catalogue.

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
| Styling | Tailwind CSS 3.4, shadcn-style Radix UI primitives |
| Server state | TanStack React Query v5 |
| Client state | Redux Toolkit + redux-persist (localStorage) |
| Forms | react-hook-form + zod v4 |
| HTTP | axios (one configured instance in `src/lib/api/axios-client.ts`) |
| Charts | chart.js + react-chartjs-2 |
| Toasts | react-hot-toast |
| Fonts | Self-hosted SF Pro Display (`public/fonts`) |

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

# Create your local env file (see "Environment variables")
echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key-here" > .env.local

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
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Yes, for the map on public pages | `src/app/preview/events/page.tsx`, `src/app/preview/places/page.tsx` | Google Maps Embed API key for the location map on public event and place pages. Without it the map iframe shows an error; the rest of the app still works. |
| `NODE_ENV` | Set automatically | `src/store/index.ts` | Redux DevTools are turned off when `production` |
| `PORT` | No | `next start` | Port for the production server (default 3000) |

**Not environment variables:** the backend API base URLs are hard-coded constants in `src/constants/index.ts`. See [Configuration](#configuration).

---

## Service and API keys

| Key / account | Where it is used | Notes |
|---|---|---|
| **Google Maps Embed API key** | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Create in Google Cloud Console with the **Maps Embed API** enabled. Because it is visible in the browser, **restrict it by HTTP referrer** (for example `https://merchant.spinstrip.com/*` and `http://localhost:3001/*`) and to the Maps Embed API only. |
| **Paystack** | None held by this app | The app sends `paymentProvider: "PAYSTACK"` to the events service and redirects to the `authorizationUrl` it returns. Paystack secret keys live in the backend, never here. |
| **Merchant access / refresh tokens** | Issued at login by the merchant gateway | Stored in the browser; not configured by developers. |

No other secrets are needed to build or run this app.

---

## Dependencies on other services

All backend responses use the envelope `{ status, message, data }`. Paginated lists nest one level deeper.

| Service | Base URL | Used for | Auth |
|---|---|---|---|
| **Merchant gateway** (`SERVER_URL`) | `https://spinstrip-merchant-gateway.fly.dev/api/v1` | Login, registration, OTP, password reset, token refresh, KYC, events, places, inventory, menu, deals, customers, media uploads | Bearer token (except auth endpoints and `/events/public/*`, `/places/public/*`) |
| **User account** (`USER_ACCOUNT_URL`) | `https://spinstrip-user-account.fly.dev/api/v1` | Wallets, banks, bank account resolution, settlement bank accounts | Bearer token |
| **Events** (`EVENTS_SERVER_URL`) | `https://spinstrip-events.fly.dev/api/v1` | Public ticket registration (`/events/public/{id}/register`) and payment verification (`/events/payments/verify/{reference}`) | None (public) |
| **Paystack** | Hosted checkout | Ticket payments. Paystack redirects back to `/preview/events/success?reference=...` | Handled by the events service |
| **Google Maps Embed API** | `https://www.google.com/maps/embed/v1/place` | Maps on public event and place pages | API key |
| **DigitalOcean Spaces** | `spin-strip.sfo3.digitaloceanspaces.com` | Serves uploaded images and documents (written by the backend) | Public read |
| **flagcdn.com** | `https://flagcdn.com` | Country flag images in country pickers | Public |

The backend services are hosted on **Fly.io**. If any of them is down, the matching parts of the dashboard fail (lists show empty states, forms show error toasts). Login needs the merchant gateway.

The full endpoint list is in [SPEC.md, section 4](SPEC.md#4-backend-services).

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
| Sidebar navigation | `src/constants/sidebar.tsx` | |
| Theme and colours | `tailwind.config.ts`, `src/app/globals.css` | Primary `#6932E2`. Light theme only. |
| UI component generator | `components.json` | shadcn config (`new-york` style) |
| Path alias | `tsconfig.json` | `@/*` → `src/*` |
| Persisted client state | `src/store/index.ts` | redux-persist key `root`, whitelist `auth`, `apps` |

---

## Deployment

The repo has **no deployment config** (no Dockerfile, no `vercel.json`, no CI). It is a standard Next.js app, so either option below works. _Confirm with the deployment owner which one production actually uses and update this section._

### Option A: Vercel (simplest)

1. Import the GitHub repo into Vercel. Framework preset: **Next.js**. No build settings need changing.
2. Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` under **Settings → Environment Variables** for Production (and Preview if needed).
3. Add the custom domain `merchant.spinstrip.com`.
4. Pushes to `main` deploy to production; other branches get preview URLs.

### Option B: Any Node.js host (VM, container, Fly.io, etc.)

```bash
npm ci
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=... npm run build   # the key must be present at build time
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
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm", "run", "start"]
```

Build with `docker build --build-arg NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=... -t spinstrip-merchant .`

### Deployment checklist

- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` set **before** the build runs.
- [ ] Backend URLs in `src/constants/index.ts` point at the right environment.
- [ ] `npx tsc --noEmit` and `npm run lint` pass locally (the build will not catch these, see below).
- [ ] The production domain is allowed on the Google Maps key's referrer list.
- [ ] The backend's CORS settings allow the dashboard's domain.
- [ ] The events service and Paystack accept the domain used for the payment `callbackUrl` (it is built from `window.location.origin`, so each domain, including preview deployments, sends its own).
- [ ] After deploy: log in, open a module, and load a public event page with a map.

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

- App on/off choices in the catalogue are stored only in the browser (Redux + localStorage) and are not synced to the server. Clearing site data or changing device resets them.

---

## Project structure

```
src/
  app/
    (auth)/          Login, register, OTP, forgot/reset password (no auth guard)
    (dashboard)/     Merchant dashboard, wrapped in React Query + AuthProvider
      apps-tools/    One folder per module (_components, _schemas, _context, _constants, _types)
      settings/      Settings and the KYC wizard
    preview/         Public event and place pages
    layout.tsx       Root layout: Redux provider, toaster, metadata
  components/        Shared components; ui/ holds design-system primitives and form inputs
  constants/         API base URLs, apps catalogue, sidebar
  hooks/             All data-fetching hooks (use-<domain>.ts)
  lib/               axios client, error handler, form-context factory, upload helpers
  providers/         Redux, React Query and auth providers
  store/             Redux store, slices (auth, apps), selectors
  utils/             Formatting, token obfuscation helpers
public/              Images, icons, fonts
SPEC.md              Full technical specification
```

---

## Development conventions

The full rules are in [SPEC.md, section 14](SPEC.md#14-rules-for-new-code). The key ones:

1. **Every endpoint gets a reusable hook** in `src/hooks/use-<domain>.ts`. Never call `useQuery` or axios directly in a component.
2. Export response types from the hook file; components import them from there.
3. Always use `api` from `@/lib/api/axios-client` (it adds the token and handles refresh). Pass an absolute URL to reach a non-default service, e.g. `` api.get(`${USER_ACCOUNT_URL}/wallet`) ``.
4. Forms use react-hook-form + zod; multi-step flows use `createFormContext`.
5. Use the Tailwind design tokens, not ad-hoc hex colours.
6. Files are kebab-case; route-private folders start with `_`.

---

## Troubleshooting

| Problem | Likely cause / fix |
|---|---|
| Redirected to `/login` straight away | No valid token in the browser. Log in again. If it loops, clear site data (localStorage keys `spinstrip_at`, `spinstrip_rt`, `spinstrip_user`, `persist:root`). |
| "Session expired. Please login again." | The refresh token was rejected by the merchant gateway. Log in again. |
| Map on a public page shows an error | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` missing at build time, Maps Embed API not enabled, or the domain is not on the key's referrer list. |
| Remote image fails with a Next.js host error | Add the host to `images.domains` in `next.config.ts`. |
| Requests fail with CORS errors | The backend does not allow the current origin. Ask the backend owner to add it. |
| Lists show empty states everywhere | A backend service is down or unreachable. Check the base URLs and the Fly.io services. |
| App opens on port 3001 locally but 3000 in production | Expected: `dev` uses `-p 3001`, `start` uses the default. |

---

## Known gaps

- Overview (`/`) and Billing are placeholders. Chat, Groups, Socials, Reviews, Payment Method, Memberships and Ads are commented out of the catalogue.
- Settings links to `/settings/preferences`, which does not exist yet.
- Pagination response shapes are not consistent across endpoints (see [SPEC.md, section 15](SPEC.md#15-known-gaps--caveats)).
- `darkMode` is configured in Tailwind but there is no dark theme.
- SPEC.md was written before the Customers and bank account features; their endpoints (`/places/customers`, `/banks`, `/banks/resolve`, `/bank-accounts`) are listed in this README but not yet in SPEC.md.
