# Frontend Architecture — RentFlow

This document defines how the Next.js frontend is structured, how data flows through it, and the conventions a coding agent must follow so generated code fits the existing system instead of drifting into one-off patterns.

## Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript, strict mode on
- **Styling:** Tailwind CSS, tokens from `design.md`
- **Data fetching:** Server Components + `fetch` for reads; Server Actions or a thin client API layer for mutations
- **State:** Server state lives on the server; client state is local (`useState`/`useReducer`) or React Query for cases that genuinely need client-side caching (e.g. polling a disbursement status)
- **Backend:** Spring Boot (N-Gate-style multi-module backend), fronted by Spring Cloud Gateway, which proxies this frontend and Grafana under subpaths
- **Deployment:** Frontend on Vercel, backend on Render (Docker)

## Folder Structure

```
src/
  app/                        # App Router — routes only, minimal logic
    (auth)/
      login/
      register/
    (dashboard)/
      properties/
        [propertyId]/
          page.tsx
          loading.tsx
          error.tsx
      tenants/
      disbursements/
        [disbursementId]/
          page.tsx
          loading.tsx
          error.tsx
      layout.tsx               # sidebar + shell for authenticated routes
    api/                        # Next.js route handlers, only for things
                                 # that must run server-side (webhooks,
                                 # auth callbacks) — not a general proxy
    layout.tsx
    error.tsx                   # global fallback only
    not-found.tsx

  components/
    ui/                         # Design-system primitives (Button, Input,
                                 # Card, Badge, Table) — no business logic
    features/
      properties/                # Feature-scoped components
      tenants/
      disbursements/
    layout/                     # Sidebar, TopBar, MobileNav

  lib/
    api/
      client.ts                 # single fetch wrapper (base URL, auth
                                 # header injection, error normalization)
      properties.ts              # typed functions per backend resource
      tenants.ts
      disbursements.ts
    auth/
      session.ts
      middleware.ts
    utils/
    validators/                  # zod schemas, shared between forms and
                                 # server actions

  hooks/                        # Shared client hooks (useDebounce, etc.)

  types/
    api.ts                      # types generated/mirrored from backend
                                 # DTOs — see "Type Contracts" below

  config/
    env.ts                      # single source for validated env vars
```

**Rule for agents:** business logic and data-fetching never live inside `app/**/page.tsx` beyond composing components and calling `lib/api/*`. Route files should be thin.

## Data Flow

1. **Reads** happen in Server Components. Call `lib/api/*` functions directly — no client-side `useEffect` fetching for initial page data.
2. **Mutations** (create tenant, trigger disbursement, update split config) go through Server Actions co-located with the feature, or a POST to a Route Handler if the action needs to run client-triggered with optimistic UI. Never call the Spring Boot backend directly from a client component with a raw `fetch` — always go through `lib/api/*` so auth headers, error shapes, and retries are consistent in one place.
3. **Polling / live status** (e.g. disbursement processing state) is the one case allowed to use client-side fetching, via React Query with a defined `staleTime` and `refetchInterval` — not a naive `setInterval`.

```
Server Component (page.tsx)
    -> lib/api/disbursements.ts (getDisbursement)
        -> lib/api/client.ts (fetch wrapper, adds auth header, normalizes errors)
            -> Spring Cloud Gateway -> N-Gate/RentFlow backend
```

## Type Contracts

Backend DTOs (Spring Boot) are the source of truth. `types/api.ts` mirrors them by hand today — if/when an OpenAPI spec exists for the RentFlow backend, generate this file instead of hand-maintaining it, and flag drift between the generated types and `lib/api/*` usage as a build-breaking issue rather than silently patching around it.

**Rule for agents:** never invent a field on a response type. If a component needs data the backend doesn't return, that's a backend ticket, not a frontend `any`.

## Auth

- Session/token handling lives in `lib/auth/session.ts`. Components never read cookies or tokens directly.
- `middleware.ts` guards `(dashboard)` routes — redirect unauthenticated requests to `/login` before the route renders, not with a client-side check after mount.
- Role-based UI (e.g. property owner vs. tenant vs. admin views) is gated at the layout level per route group, not with scattered `if (user.role === ...)` checks inside leaf components.

## Error Handling

- Every route segment with data fetching gets its own `error.tsx` and `loading.tsx` — no reliance on the single global `app/error.tsx`.
- `lib/api/client.ts` normalizes all backend errors into one shape (`{ status, code, message }`) before they reach components, so UI code never parses raw Axios/fetch errors or Spring's default error payload directly.
- Financial actions (disbursement triggers, split config changes) must surface backend validation errors inline on the relevant field, not just a generic toast — the backend already returns field-level errors for these; don't collapse them.

## Environment & Config

- All env vars are read and validated once in `config/env.ts` (fail fast at build time on a missing/malformed var) — no scattered `process.env.X` calls through the codebase.

## Testing

- Unit tests colocated with the file (`Component.tsx` + `Component.test.tsx`).
- `lib/api/*` functions get tests with mocked responses covering success, validation error, and 5xx cases — these are the highest-value tests since they're the single chokepoint for all backend interaction.
- E2E (Playwright, if/when added) covers the disbursement flow end-to-end as the critical path, since that's the money-moving flow.


## Agent Checklist Before Marking a Feature Done

- Data fetching happens in a Server Component or through `lib/api/*` — no direct `fetch` to the backend from a client component.
- New backend fields are reflected in `types/api.ts`, not accessed via `any`.
- Route segment has its own `loading.tsx` and `error.tsx` if it fetches data.
- Mutations show loading/disabled state on trigger and surface backend validation errors inline.
- No hardcoded absolute paths that would break under the gateway subpath.
- Auth-gated routes are protected in `middleware.ts`, not just hidden in the UI.
