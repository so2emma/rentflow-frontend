# RentFlow Frontend — Agent Rules

> This file is the authoritative guide for any AI agent or developer working on this codebase.
> Read it in full before generating or modifying any code. Rules here override general instinct.
> Cross-reference [`architecture.md`](./architecture.md) for structural rationale and [`design.md`](./design.md) for the full token system.

---

## 0. Before You Write Anything

Run a mental checklist:

1. Have you read the relevant section of this file for what you are about to do?
2. Does the change require a new component? Check `src/components/ui/` and `src/components/layout/` first — it may already exist.
3. Does the change touch auth? Only touch `src/lib/auth/session.ts`.
4. Does the change touch backend data? Only go through `src/lib/api/*`.
5. Does the change need an env var? Add it to `src/config/env.ts` — never write `process.env.X` inline.

---

## 1. Stack & Versions

| Tool | Version / Note |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript — strict mode ON |
| Styling | Tailwind CSS v3 — tokens defined in `tailwind.config.cjs` |
| HTTP | Axios via `src/lib/api/client.ts` — **never** use raw `fetch` to the backend |
| State | Server state in Server Components or React Query; local UI state via `useState`/`useReducer` |
| Fonts | Inter (sans), JetBrains Mono (mono) — loaded in `src/app/layout.tsx` via `next/font/google` |

---

## 2. Folder Structure — Non-Negotiable

```
src/
  app/                  ← Routes only. Page files must be thin.
  components/
    ui/                 ← Design-system primitives only. No business logic.
    features/           ← Feature-scoped components (properties/, tenants/, disbursements/)
    layout/             ← Sidebar, DashboardShell, TopBar, MobileNav
  lib/
    api/
      client.ts         ← Single Axios instance. NEVER bypass this.
      properties.ts     ← Typed functions per backend resource
      tenants.ts
      leases.ts
      ledgers.ts
      auth.ts
    auth/
      session.ts        ← ONLY place that reads/writes the JWT and user object
  config/
    env.ts              ← ONLY place that reads process.env.*
  hooks/                ← Shared client hooks (useDebounce, etc.)
  types/
    api.ts              ← Backend DTO mirrors — source of truth for types
```

**Page files** (`app/**/page.tsx`) must only:
- Compose layout and feature components
- Call `lib/api/*` functions for data
- Pass props down

No business logic, no API calls with raw `fetch`, no inline localStorage in page files.

---

## 3. The Design System

### 3.1 Color Tokens

All colors are defined in `tailwind.config.cjs`. **Never use a raw hex string** in JSX — always use a Tailwind token class. The palette has three semantic tiers:

| Token | Color | When to use |
|---|---|---|
| `primary` / `brand-deep-slate` | `#0F172A` | Navigation, primary headings, primary buttons |
| `secondary` / `brand-emerald-green` | `#10B981` | Positive financial flows, success states, growth |
| `tertiary` / `brand-blue` | `#3B82F6` | Links, info, focus rings — distinct from primary |
| `warning` | `#F59E0B` | Pending, maintenance, intermediate states |
| `error` | `#BA1A1A` | Vacant, overdue, failed, destructive actions |

### 3.2 Status Badge Colors — Required Mapping

Use `<StatusBadge status={...} />` from `src/components/ui/StatusBadge.tsx`. **Never invent your own status colors.** The mapping is:

| Status | Token pair |
|---|---|
| ACTIVE / LEASED / PAID / OCCUPIED / VERIFIED | `secondary-container` / `on-secondary-container` |
| MAINTENANCE / PENDING / PENDING_VIRTUAL_ACCOUNT / PARTIALLY_PAID | `warning-container` / `on-warning-container` |
| VACANT / OVERDUE / FAILED / EXPIRED | `error-container` / `on-error-container` |

### 3.3 Border Radius — Semantic Scale

| Element type | Token | Value |
|---|---|---|
| Pill status badges | `rounded-full` | 9999px |
| Buttons & inputs | `rounded` (DEFAULT) | 6px |
| Cards & modals | `rounded-md` | 8px |
| Tag/label elements | `rounded-xs` | 4px |

> ⚠️ Do NOT use `rounded-lg` for cards — that is `12px` and inconsistent with the spec. Cards are `rounded-md` (8px).

### 3.4 Elevation / Shadow

| Level | When | Class / Value |
|---|---|---|
| Level 0 | Page background | `bg-background` (`#F8FAFC`) |
| Level 1 | Static cards | `shadow-sm` + `border border-outline-variant` |
| Level 2 | Cards on hover | Add `0px 4px 12px rgba(15, 23, 42, 0.05)` via inline style or the `.card-hover:hover` layer |
| Level 3 | Modals / drawers | `shadow-[0px_8px_32px_rgba(15,23,42,0.12)]` + `backdrop-blur-[12px]` |

### 3.5 Motion

| Token | Duration | Use |
|---|---|---|
| fast | 100ms | Checkbox toggles, icon state changes |
| base | 150ms | Default hover/focus transitions |
| slow | 250ms | Modal/drawer enter-exit, backdrop fade |
| `ease-standard` | `cubic-bezier(0.4,0,0.2,1)` | Most transitions |
| `ease-emphasized` | `cubic-bezier(0.2,0,0,1)` | Modals, drawers entering the viewport |

Use `transition-colors duration-[150ms] ease-[cubic-bezier(0.4,0,0.2,1)]` for standard hover transitions.

### 3.6 Z-Index Scale

Never use raw numbers for z-index. Use the Tailwind tokens:

```
z-base(0)  z-sticky-header(10)  z-sidebar(20)  z-dropdown(30)
z-overlay-backdrop(40)  z-modal(50)  z-toast(60)  z-tooltip(70)
```

### 3.7 Typography

All type uses **Inter**. Numeric data must use `tabular-nums` (`font-variant-numeric: tabular-nums`). The `td` global rule already applies this — add the class `.tabular-nums` on inline numeric spans.

---

## 4. Reusable Components — Use These, Don't Re-Invent

### `src/components/ui/`

| Component | Import | Purpose |
|---|---|---|
| `StatusBadge` | `@/components/ui/StatusBadge` | Pill badge for any entity status |
| `MetricCard` | `@/components/ui/MetricCard` | At-a-glance card: label + value + optional sub |
| `Button` | `@/components/ui/Button` | Variants: `primary`, `secondary`, `ghost`, `danger` |
| `FormField` | `@/components/ui/FormField` | Label + input wrapper with error icon |

### `src/components/layout/`

| Component | Import | Purpose |
|---|---|---|
| `DashboardShell` | `@/components/layout/DashboardShell` | Full-page shell for all authenticated dashboards |
| `Sidebar` | `@/components/layout/Sidebar` | The sidebar itself (usually used via DashboardShell) |

#### Icon components (from `Sidebar.tsx`)
```tsx
import { BuildingIcon, KeyIcon, GridIcon, DocumentIcon, UsersIcon, ChartIcon, SettingsIcon }
  from '@/components/layout/Sidebar';
```
These are thin-stroke (2px) monochrome SVGs sized for `w-4 h-4` in nav items.

---

## 5. Auth — Strict Rules

### 5.1 The Only Auth Module

All JWT token and user object reads/writes go through **`src/lib/auth/session.ts`** only:

```typescript
import { getToken, getUser, setSession, clearSession, isAuthenticated, getDashboardPath }
  from '@/lib/auth/session';
```

**Never** write `localStorage.getItem('rentflow_token')` or `localStorage.setItem(...)` anywhere outside this file.

### 5.2 Session Shape

```typescript
interface SessionUser {
  email: string;
  roles: string[];   // e.g. ['ROLE_LANDLORD']
}
```

### 5.3 Role Strings

| Backend role | Used in |
|---|---|
| `ROLE_LANDLORD` | `<ProtectedRoute allowedRole="ROLE_LANDLORD">` |
| `ROLE_TENANT` | `<ProtectedRoute allowedRole="ROLE_TENANT">` |
| `ROLE_ADMIN` | `<ProtectedRoute allowedRole="ROLE_ADMIN">` |

### 5.4 Login / Logout Flow

```typescript
// After successful login:
setSession(response.token, { email: response.email, roles: response.roles });
router.replace(getDashboardPath());

// Logout:
clearSession();
router.replace('/login');
```

### 5.5 Route Protection

Wrap each dashboard page in `<ProtectedRoute allowedRole="ROLE_X">`. This is a client-side guard (middleware migration is future work). Do not add additional `localStorage` reads inside page components to supplement this.

---

## 6. API Layer — Strict Rules

### 6.1 All HTTP Goes Through `src/lib/api/client.ts`

The Axios instance in `client.ts`:
- Injects the JWT Authorization header automatically
- Normalizes all errors into `ApiErrorResponse { status, code?, message, errors? }`
- Handles 401s by clearing the session and redirecting to `/login`

**Never** call `fetch(...)` or `axios.create(...)` directly in a component or page. Always call typed functions from `lib/api/*`.

### 6.2 Error Shape

```typescript
interface ApiErrorResponse {
  status: number;
  code?: string;
  message: string;
  errors?: Record<string, string>; // field-level validation errors
}
```

### 6.3 How to Handle Errors in Mutations

```typescript
try {
  const data = await createProperty(payload);
  // happy path
} catch (error: unknown) {
  const err = error as ApiErrorResponse;
  if (err.errors) {
    // Surface field-level errors inline — DO NOT collapse to a single toast
    setFieldErrors({ name: err.errors.name, address: err.errors.address });
  }
  showFeedback(err.message || 'Operation failed.', 'error');
}
```

### 6.4 Never Invent Response Data

If a backend call fails, show the error. **Do not** create fake/mock objects and add them to state as if the call succeeded. Example of what is FORBIDDEN:

```typescript
// ❌ NEVER DO THIS
} catch {
  const fakeProp = { id: `local-${Date.now()}`, name: propName, ... };
  setProperties(prev => [...prev, fakeProp]);
}
```

### 6.5 Adding New API Functions

Add typed functions to the appropriate file in `src/lib/api/`. Mirror the backend DTO exactly in `src/types/api.ts`. Do not use `any` — if the backend field doesn't exist in the type, that is a backend ticket, not a frontend `any`.

---

## 7. Types — `src/types/api.ts`

This file mirrors the Spring Boot backend DTOs. Rules:

- **Never** add a field that the backend doesn't return.
- **Never** use `any` to access backend data.
- When adding a new endpoint, add the request and response types here first, then write the `lib/api/*.ts` function, then the component.
- If the OpenAPI spec exists, generate this file from it instead of hand-maintaining it.

---

## 8. Forms

### 8.1 Field-Level Validation

Validate inline with a `fieldErrors` state object. Display errors per-field — never collapse all validation errors into a single global message.

```typescript
const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
```

### 8.2 Error State Display

Always use **both** a red border **and** an icon for error states — never color alone (accessibility requirement from design.md). The `FormField` component handles this automatically. For inline `Field` wrappers built inside a page, replicate the icon pattern:

```tsx
{error && (
  <p role="alert" className="flex items-center gap-1 text-sm text-on-error-container">
    <ErrorIcon /> {/* always include icon */}
    {error}
  </p>
)}
```

### 8.3 Submit Button State

Always pass `loading={isSubmitting}` to `<Button>` during async form submission. The Button component shows a spinner and disables itself automatically.

### 8.4 `noValidate` on Forms

Use `noValidate` on `<form>` elements to prevent browser-native validation UI — rely on custom validation and field-level error display instead.

---

## 9. Dashboard Pages — Pattern

All authenticated dashboard pages follow this pattern:

```tsx
export default function XDashboardPage() {
  const user = getUser();
  const [activeTab, setActiveTab] = useState('overview');

  function handleLogout() {
    clearSession();
    router.replace('/login');
  }

  return (
    <ProtectedRoute allowedRole="ROLE_X">
      <DashboardShell
        sidebarTitle="RentFlow"
        userLabel="Connected X"
        userEmail={user?.email}
        navItems={NAV_ITEMS}
        activeItem={activeTab}
        onNavChange={setActiveTab}
        onSignOut={handleLogout}
      >
        {/* Page header */}
        <div className="flex flex-col gap-1 border-b border-outline-variant pb-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-deep-slate">...</h1>
          <p className="text-sm text-on-surface-variant">...</p>
        </div>

        {/* Metric cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard label="..." value={...} sub={...} />
        </section>

        {/* Tab content */}
        {activeTab === 'overview' && ( ... )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
```

---

## 10. Accessibility Rules

These are non-negotiable — the platform handles financial disbursement where keyboard users must have clear affordances.

- Every interactive element must have a visible `focus-visible` ring: `focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2`
- Never remove the default `outline` without supplying this replacement.
- Error states must use **icon + color**, never color alone.
- Status badges must be readable without relying on color alone — the label text is the primary signal; color is reinforcement.
- All `<img>` tags need `alt`. All icon-only buttons need `aria-label`.
- Decorative icons get `aria-hidden="true"`.
- Touch targets: minimum `min-h-[44px]` on all interactive elements.
- Form groups use `role="alert"` on error messages.
- Table sections should use `aria-labelledby` pointing to their `<h2>`.

---

## 11. Responsive Layout

| Breakpoint | Behavior |
|---|---|
| `< md` (768px) | Single-column layout. Sidebar hidden — mobile top bar shown. |
| `md–lg` | 6–8 column grid. |
| `lg+` (1024px) | Full 12-column grid with fixed 260px sidebar visible. |

The `DashboardShell` handles this automatically. Do not replicate the sidebar grid logic in individual pages.

---

## 12. Adding a New Feature — Checklist

Before marking a feature done, confirm:

- [ ] Data fetching calls `lib/api/*` — not raw `fetch` from a component
- [ ] New backend fields added to `types/api.ts` — no `any` access
- [ ] Mutations show `loading` state on the trigger button
- [ ] Mutations surface backend field-level errors inline, not just a global toast
- [ ] Status values use `<StatusBadge>` — no ad-hoc color classes
- [ ] Auth reads/writes go through `lib/auth/session.ts`
- [ ] Env vars go through `config/env.ts`
- [ ] No raw hex colors in JSX — only Tailwind token classes
- [ ] All interactive elements have `focus-visible` ring styles
- [ ] Form error states use icon + color (not color alone)
- [ ] Touch targets are `min-h-[44px]`
- [ ] Build passes: `npm run build` exits 0

---

## 13. What Is Planned But Not Yet Done

Do not re-implement these — they are tracked future work:

| Item | Note |
|---|---|
| `middleware.ts` auth guard | Requires JWT in `HttpOnly` cookie; backend currently returns it in response body |
| Per-route `loading.tsx` / `error.tsx` | Required by `architecture.md`; stub files not yet created |
| Move `app/login` → `(auth)/login` | Route group restructure |
| Move dashboards → `(dashboard)/` layout | Shared layout extraction |
| React Query for disbursement polling | When disbursement module is added |
| OpenAPI → `types/api.ts` codegen | Replace hand-maintained DTOs |
| `features/` components | Extract feature-scoped components out of page files |
