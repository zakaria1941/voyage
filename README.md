# Voyago

**Your journey starts here.** A full-stack travel booking platform for flights, hotels, car rentals, and airport transfers — built on React, TypeScript, Firebase, Cloudinary, and Netlify.

> This is a demo/portfolio platform. Inventory, availability, and payments are simulated (see [Demo mode](#demo-mode)). No real money moves and no real reservations are made.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Firebase setup](#firebase-setup)
- [Cloudinary setup](#cloudinary-setup)
- [Netlify setup](#netlify-setup)
- [Firestore data model](#firestore-data-model)
- [Security](#security)
- [Seed data](#seed-data)
- [Running locally](#running-locally)
- [Building for production](#building-for-production)
- [Deployment](#deployment)
- [Demo accounts](#demo-accounts)
- [Demo mode](#demo-mode)
- [Currency](#currency)
- [Known limitations & future work](#known-limitations--future-work)

---

## Features

- **Search & book** flights (round trip / one way / multi-city start), hotels, car rentals, and airport transfers, each with dedicated search, filterable/sortable results, and detail pages.
- **Authentication**: email/password and Google sign-in, email verification, password reset, protected routes, role-based admin access.
- **Booking pipeline**: guest/passenger forms → coupon code → demo payment → server-side booking creation → printable confirmation.
- **User dashboard**: overview with stats, trips (upcoming/completed/cancelled), full booking history, favorites, profile (with photo upload), notifications, settings.
- **Admin dashboard**: analytics overview with charts, full CRUD for airports, airlines, flights, hotels + rooms, cars, car suppliers, transfers, and coupons; booking status management; user role management; review moderation; platform settings.
- **Reviews & favorites**: users can save items and review completed bookings (one review per booking, enforced by security rules).
- **Multi-currency display** (EUR/USD/GBP/DZD) with a demo static conversion table.
- Responsive, accessible UI with loading/empty/error states throughout.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router v7 · React Hook Form · Zod · Firebase (Auth, Firestore) · Cloudinary (image storage) · Netlify Functions (server-side booking + Cloudinary signing) · Recharts · Lucide React

No Firebase Storage, no Firebase Cloud Functions, no Blaze plan required — see [Architecture](#architecture).

## Architecture

```
src/
  components/
    ui/          Design-system primitives (Button, Input, Modal, DataTable, ImageUploader, …)
    layout/       Navbar, Footer, RootLayout, route guards, ErrorBoundary
    booking/      Cross-vertical booking UI (PriceBreakdown, DemoPaymentForm, CouponInput, …)
    flight/ hotel/ car/ transfer/   Vertical-specific components
    dashboard/    User dashboard shell + widgets
    admin/        Admin shell + generic CRUD infrastructure (DataTable, Modal, useAdminCrud)
  pages/           One folder per route group; each page composes components + services
  services/        Firestore/Cloudinary access — the ONLY layer that talks to them directly
  context/         Auth, Currency, Language, Toast — global app state
  hooks/           useAsync (data fetching), useAdminCrud, useClickOutside
  utils/           pricing preview engine, currency formatting, date helpers, error mapping
  types/           Shared TypeScript types
  lib/
    firebase.ts    Firebase SDK initialization (Auth + Firestore only) + emulator wiring
    apiClient.ts   Calls Netlify Functions with the caller's Firebase ID token attached
    apiError.ts    Error shape shared between apiClient and utils/errors.ts
netlify/
  functions/       create-booking.ts, cancel-booking.ts, cloudinary-sign.ts — HTTP handlers only
  lib/             The actual business logic + shared helpers (Admin SDK init, auth, pricing, …)
scripts/seed.ts    Seeds demo data via firebase-admin
```

**Service layer.** Components never call Firestore or Cloudinary directly — every collection has a `services/*Service.ts` file. This keeps query logic, index usage, and denormalization (e.g. `citySearch`) in one place per entity.

**Booking & pricing architecture (important).** Two things are enforced **server-side**, not just in the UI, inside [`netlify/functions/create-booking.ts`](netlify/functions/create-booking.ts) (thin HTTP handler) / [`netlify/lib/booking.ts`](netlify/lib/booking.ts) (the actual logic):

1. **Pricing.** `src/utils/pricing.ts` computes a live preview client-side (so the UI can show a running total), but it is only a preview. `create-booking` independently loads the canonical price from Firestore and recomputes the total itself — a client can never influence what actually gets charged.
2. **Inventory safety.** `create-booking` runs inside a Firestore transaction: it decrements flight seats atomically (both legs for round trips), and for hotels/cars/transfers it counts overlapping active bookings for the same resource before confirming, preventing double-booking.

**Cancellation is server-side too**, in [`netlify/functions/cancel-booking.ts`](netlify/functions/cancel-booking.ts): for flights it restores the exact seat count the original booking reserved, read from the booking document itself (never trusted from the client), atomically with the status change inside a transaction — which is also what makes a duplicate/concurrent cancel attempt fail cleanly instead of double-restoring seats.

Because none of this can be expressed as a Firestore security rule (a rule can't recompute business pricing or atomically adjust a second document's counters), **Firestore security rules make all inventory collections admin-write-only, and disallow direct client writes to `bookings`** (`allow create: if false`; `allow update: if isAdmin()` only — see the header comment in `firestore.rules`). Both Functions run with the Firebase Admin SDK, which bypasses these rules by design; that's the trust boundary.

**Images live entirely in Cloudinary**, never Firebase Storage. Uploads are *signed*, not unsigned-preset: the browser asks [`netlify/functions/cloudinary-sign.ts`](netlify/functions/cloudinary-sign.ts) for a signature, which first verifies the caller's Firebase ID token and checks they're allowed to write to the requested folder (their own `users/{uid}/...` folder, or any inventory folder if they're an admin — mirroring `firestore.rules`' `isAdmin()` check) before signing. The Cloudinary API secret never reaches the browser. The file itself still uploads directly from the browser to Cloudinary (not proxied through the function), keeping large uploads off Netlify's function compute. Deletion works the same way, except the function performs the delete directly (Cloudinary has no concept of an unsigned/client-side delete). Both the secure URL and the `public_id` are stored in Firestore (the URL for display, the `public_id` for future deletes) — see `imagePublicIds`/`imagePublicId`/`logoPublicId`/`photoPublicId` in [Firestore data model](#firestore-data-model).

**Provider abstractions** (`src/services/payment/`) exist so a real gateway (Stripe, etc.) or real supplier APIs (Amadeus, Duffel, …) can be swapped in later without touching UI code — see [Known limitations](#known-limitations--future-work).

## Getting started

Prerequisites: **Node.js 20+**, **Java 11+** (required by the Firestore emulator only — not needed for a production build), and the Firebase and Netlify CLIs (both installed locally via `npm install`; no global install needed).

```bash
npm install
cp .env.example .env    # see below — emulator/placeholder defaults already work out of the box
```

## Environment variables

Copy `.env.example` to `.env` (read automatically by `netlify dev`, git-ignored). It's split into two parts:

**Frontend (`VITE_*`, bundled into the browser build — never a secret):**

| Variable | Where to find it |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase console → Project settings → General → Your apps |
| `VITE_FIREBASE_AUTH_DOMAIN` | same |
| `VITE_FIREBASE_PROJECT_ID` | same |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | same |
| `VITE_FIREBASE_APP_ID` | same |
| `VITE_USE_FIREBASE_EMULATORS` | `true` for local dev, `false`/unset for a real project |
| `VITE_FIREBASE_EMULATOR_HOST` | usually `localhost` |

**Netlify Functions (server-side only — read by `netlify/functions/*`, never prefixed `VITE_`):**

| Variable | Where to find it |
|---|---|
| `FIREBASE_PROJECT_ID` | same Firebase project id as above |
| `FIREBASE_CLIENT_EMAIL` | Firebase console → Project settings → Service accounts → Generate new private key |
| `FIREBASE_PRIVATE_KEY` | same downloaded JSON |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary console → Dashboard |
| `CLOUDINARY_API_KEY` | same |
| `CLOUDINARY_API_SECRET` | same — **never** exposed to the browser |
| `FIRESTORE_EMULATOR_HOST` | local dev only, e.g. `localhost:8080` — unset in production |
| `FIREBASE_AUTH_EMULATOR_HOST` | local dev only, e.g. `localhost:9099` — unset in production |

**For local development you do not need real Firebase or Cloudinary accounts at all.** With `VITE_USE_FIREBASE_EMULATORS=true` and the two `*_EMULATOR_HOST` vars set, the Firebase Admin SDK in the Netlify Functions talks to the local emulators instead of requiring `FIREBASE_CLIENT_EMAIL`/`FIREBASE_PRIVATE_KEY`. Cloudinary has no local emulator — placeholder credentials are enough to exercise the signing/authorization logic (it's local HMAC computation), but real uploads will be rejected by Cloudinary's actual API until you set real ones. This repo was built and tested this way.

Never commit `.env` or `.env.local` (both are git-ignored) and never hardcode credentials in source.

## Firebase setup

To run against a **real** Firebase project instead of the emulators:

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com) — the free **Spark** plan is all you need (no Blaze/Functions required).
2. Add a Web app and copy its config into `.env`/`.env.local`, with `VITE_USE_FIREBASE_EMULATORS=false`.
3. Enable **Authentication** → Sign-in method → **Email/Password** and **Google**.
4. Enable **Firestore Database** (production mode — this repo's rules will govern access).
5. Generate a service account key (Project settings → Service accounts) and set `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` as Netlify environment variables (see [Netlify setup](#netlify-setup)).
6. Deploy rules and indexes:
   ```bash
   firebase login
   firebase use --add          # select your project
   firebase deploy --only firestore:rules,firestore:indexes
   ```
7. Run `npm run seed` against the real project (temporarily point the seed script at it by unsetting the emulator env vars — see the guard at the top of `scripts/seed.ts`) or recreate demo data manually via the admin dashboard.

## Cloudinary setup

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. From the Dashboard, copy your **Cloud name**, **API Key**, and **API Secret**.
3. Set them as `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — as Netlify environment variables in production, or in `.env` for local dev.
4. Nothing else to configure — uploads are signed by `netlify/functions/cloudinary-sign.ts` at request time (no unsigned upload preset needed), scoped to `voyago/<scope>/<id>` folders.

## Netlify setup

1. Create a site at [app.netlify.com](https://app.netlify.com) pointed at this repo (or run `netlify init` from the Netlify CLI).
2. Set all the **Netlify Functions** environment variables from the table above (Site settings → Environment variables) — omit the two `*_EMULATOR_HOST` vars in production.
3. Build settings are already declared in `netlify.toml` (`npm run build`, publish `dist/`, functions in `netlify/functions`) — no manual configuration needed.
4. Deploy: `netlify deploy --prod` (or push to the branch Netlify is watching).

## Firestore data model

```
users/{userId}                        role: "user" | "admin"; photoURL + photoPublicId
users/{userId}/favorites/{favoriteId}
airports/{airportId}
airlines/{airlineId}                  logoUrl + logoPublicId
flights/{flightId}                    fares: { economy, premium_economy?, business?, first? }
hotels/{hotelId}                      images: string[] + imagePublicIds: string[] (index-aligned)
hotels/{hotelId}/rooms/{roomId}       images: string[] + imagePublicIds: string[] (index-aligned)
cars/{carId}                          images: string[] + imagePublicIds: string[] (index-aligned)
carSuppliers/{supplierId}             logoUrl + logoPublicId
transfers/{transferId}                image + imagePublicId
bookings/{bookingId}                  unified model; bookingType: flight | hotel | car | transfer
reviews/{reviewId}                    document id == the bookingId it reviews
coupons/{couponId}
notifications/{notificationId}
settings/general
```

Every `*PublicId`/`*PublicIds` field is the Cloudinary `public_id` for the corresponding URL field — needed to delete/replace an image, since Cloudinary has no unsigned delete. These fields are optional in the TypeScript types: documents created before the Cloudinary migration won't have them, and the app degrades gracefully (display is unaffected; deleting a pre-migration image is simply a no-op since there was never anything in Cloudinary to delete).

All dates/timestamps are stored as **epoch milliseconds** (`number`), not Firestore `Timestamp`, for simpler typing throughout the app. All prices are stored in **EUR** (see [Currency](#currency)).

Composite indexes are defined in `firestore.indexes.json`, one per non-trivial query (equality + range/sort on a different field). Deploy them with `firebase deploy --only firestore:indexes`.

## Security

Full rules live in `firestore.rules` (fails closed — nothing is `allow read, write: if true`; there is no `storage.rules` since Firebase Storage isn't used). Summary:

- Users can read/update **their own** profile (a narrow field allowlist — `role` can't be self-escalated) and their own subcollections/notifications.
- **Inventory (airports, airlines, flights, hotels, rooms, cars, suppliers, transfers) is publicly readable, admin-write-only.**
- **Bookings cannot be created or cancelled directly by clients** — only `create-booking` and `cancel-booking` (both Netlify Functions, Admin SDK) can, after recomputing price/restoring seats server-side. Even an admin's `isAdmin()` rule grant doesn't cover `create` — creation is `if false` unconditionally.
- **Reviews** use the underlying booking's ID as their document ID, which makes "one review per booking" and "only the booking's owner, only after completion" enforceable directly in rules (`get()` on the referenced booking).
- **Coupons** are readable by any signed-in user (to preview a code client-side) but only admins can write them; `usageCount` is only ever incremented server-side, inside `create-booking`'s transaction.
- **Image uploads/deletes** are authorized in `netlify/functions/cloudinary-sign.ts` using the exact same ownership model as the Firestore rules (own `users/{uid}/...` folder, or admin for inventory folders) — see [Architecture](#architecture).
- Admin status is resolved by reading the caller's own `users/{uid}` document — both in Firestore rules and in the Netlify Functions (`netlify/lib/requestAuth.ts`'s `isAdmin()`, which mirrors the rule).

## Seed data

```bash
npm run emulators   # separate terminal — starts the Auth + Firestore emulators
npm run seed         # populates the running emulator
```

`scripts/seed.ts` refuses to run against anything but `localhost`/`127.0.0.1` as a safety guard. It creates:

- 30 airports, 15 airlines, 24 flights (12 real-world routes × 2 dates, multi-cabin fares)
- 20 hotels × 2 room types each (40 rooms)
- 25 cars across 10 (fictional) rental suppliers
- 20 airport transfer options across 8 major airports
- 4 coupons (`WELCOME10`, `SAVE20`, `ROADTRIP15`, `SKYFAST`), platform settings
- 3 demo users (1 admin, 2 travelers) with sample bookings, a review, a favorite, and notifications — see [Demo accounts](#demo-accounts)

Re-running `npm run seed` is safe — it clears its own collections and demo auth users first. It never touches Cloudinary or Storage — seeded images are plain picsum.photos URLs.

## Running locally

You need **two terminals**:

```bash
# terminal 1
npm run emulators      # Firebase Emulator Suite (Auth + Firestore) — UI at http://localhost:4000

# terminal 2 (first time only, after emulators are up)
npm run seed

# terminal 2
npm run dev:netlify     # Netlify Dev — proxies Vite + serves netlify/functions/*, at http://localhost:8888
```

Use `http://localhost:8888`, not `:5173` — only the Netlify Dev proxy serves `/.netlify/functions/*`, so booking, cancellation, and image upload will 404 against the raw Vite server. Plain `npm run dev` (port 5173) is fine for UI-only work that doesn't touch those.

## Building for production

```bash
npm run typecheck             # tsc -b --noEmit (frontend)
npm run typecheck:functions   # tsc --noEmit -p netlify/tsconfig.json (Netlify Functions)
npm run lint
npm run build                 # outputs to dist/
npm run preview                # serve the production build locally
```

`netlify/functions/*` are transpiled/bundled by Netlify's own build (esbuild) at deploy time or under `netlify dev` — there's no separate manual build step for them, unlike the old Cloud Functions package.

## Deployment

- **Frontend + Functions (Netlify)**: `netlify deploy --prod`, or push to your connected branch. `netlify.toml` already declares the build command, publish directory, and functions directory.
- **Firestore rules/indexes**: `firebase deploy --only firestore:rules,firestore:indexes` (no Storage rules to deploy).
- Set all environment variables from [Environment variables](#environment-variables) in the Netlify dashboard before deploying — the Functions will throw a clear startup error if `FIREBASE_PROJECT_ID`/`FIREBASE_CLIENT_EMAIL`/`FIREBASE_PRIVATE_KEY` or the `CLOUDINARY_*` vars are missing in a non-emulator environment.
- No Firebase Blaze plan, no Firebase Hosting, and no Firebase Storage bucket are needed anywhere in this stack.

## Demo accounts

All seeded passwords are `Voyago123!`.

| Role | Email |
|---|---|
| Admin | `admin@voyago.example` |
| Traveler | `sofia.martins@example.com` |
| Traveler | `karim.haddad@example.com` |

## Demo mode

This platform is architected to make real integrations a drop-in replacement, not a rewrite:

- `src/services/payment/PaymentProvider.ts` defines the payment interface; `DemoPaymentProvider` is the only implementation. It never stores card numbers — the checkout screen is clearly labeled **"Demo payment — no real money will be charged"**. Use `4242 4242 4242 4242` for a successful demo charge, or `4000 0000 0000 0002` to see the decline path. A `StripePaymentProvider` (or similar) implementing the same interface is the intended extension point.
- Flight/hotel/car/transfer inventory lives entirely in Firestore, seeded by `scripts/seed.ts`, rather than calling a real supplier API. A future `FlightProvider`/`HotelProvider`/etc. abstraction could sit in front of the existing `services/*Service.ts` files to blend in real providers (Amadeus, Duffel, Skyscanner, real hotel/car APIs) without changing any page component.
- The [`LocationMapCard`](src/components/booking/LocationMapCard.tsx) component shows a styled placeholder map with a real "Open in Google Maps" link, rather than an embedded live map (which would require a Google Maps API key not included here).
- Booking references (`TRV-2026-XXXXXX`) are randomly generated demo strings and are never meant to resemble real airline/hotel confirmation codes.

## Currency

Prices are stored and computed **exclusively in EUR** — this is the canonical currency (see `src/utils/pricing.ts` and its server-side mirror `netlify/lib/pricing.ts`). The currency switcher in the navbar only affects **display**, via a static demo conversion table in `src/utils/currency.ts`. This is clearly a non-live rate, not a real exchange-rate feed; swapping in a real one means changing `convertFromEur()` in one place.

## Known limitations & future work

Being upfront about what's simplified in this build, in the spirit of not overstating scope:

- **Airport/city autocomplete**: search fields (flight origin/destination, hotel destination, car/transfer location) are plain text inputs today, matched case-insensitively against stored codes/cities. A live-search combobox backed by `airportService.searchAirports()` (already implemented) would be a natural next step.
- **Multi-city flights**: the trip-type selector supports it, but only the first leg is collected — a full multi-leg itinerary builder was out of scope for this pass.
- **Booking modification**: users can cancel a booking; changing dates/passengers on an existing booking is not implemented (spec called this out as "where applicable").
- Six admin forms (hotel/car/room multi-image pickers, transfer/airline/supplier single-image pickers) manage image state — including the Cloudinary `public_id` needed for deletion — outside of React Hook Form's typed `register()`, via `watch()`/`setValue()`. React Compiler skips optimizing those specific components as a result — a deliberate, documented tradeoff for admin-only, low-traffic pages, not a functional issue.
- `firebase-admin`'s token verifier depends on `jwks-rsa@^4`, which in turn requires `jose@6` (ESM-only) and Node's native `require(esm)` support — this breaks specifically under Netlify's local function runner (works fine in a plain Node process). Worked around by pinning `jwks-rsa` to `3.2.2` (last version on the CJS-compatible `jose@4`) via `overrides` in `package.json` — see the comment in `netlify/lib/firebaseAdmin.ts`. Revisit this pin when upgrading `firebase-admin`.
- `netlify-cli` and `firebase-tools` (both dev-only dependencies, never shipped to production) carry large transitive dependency trees with periodic security advisories in their own bundled tooling (archive extraction, embedded dev servers) — normal for CLIs this size, not something introduced by this project's own code, and not exploitable via the deployed app.
