# Architecture Overview

## Role in the System

```
Admin (browser)
      │
      │  username + password
      ▼
Admin Dashboard  ──────────────────────▶  Backend API
  (this service)                            (Django)
  React SPA                                  │
      │                                      │  enforces IsAdminUser permission
      │  GET /admin/users/                   │  writes AdminAuditLog on every action
      │  POST /admin/kyc/{id}/approve/       │  runs financial operations atomically
      │  PUT /admin/rtp/tiers/{id}/          │
      ▼                                      │
  localStorage                   ◀───────────
  (admin JWT)
```

The dashboard is a **display and action layer**. It:
- Authenticates admins with Django credentials (not Telegram)
- Fetches and displays data from backend admin endpoints
- Sends approval/rejection/config actions to the backend
- Never executes business logic, modifies financial state directly, or bypasses the API

---

## Authentication Flow

```
Admin submits login form
  → POST /admin/auth/login/ { username, password }
  → Backend verifies against Django user with is_staff=True
  → Returns { access, refresh }
  → Tokens stored in localStorage via Zustand persist
  → All subsequent requests inject Authorization: Bearer <access>

On 401:
  → Axios interceptor attempts POST /auth/token/refresh/
  → Success: new access token stored, original request retried
  → Failure: clearAuth() called, redirected to /login
```

---

## Data Fetching Strategy — TanStack Query

All server data goes through TanStack Query. This gives:

- **Automatic caching** — navigating back to a page shows cached data instantly while a fresh fetch runs in the background
- **Background refresh** — the dashboard stat cards refresh every 60 seconds; the audit log every 30 seconds
- **Mutation → invalidation** — every `useMutation` on success calls `queryClient.invalidateQueries()` to force the affected table to re-fetch
- **Loading skeletons** — `isLoading` from `useQuery` drives the `DataTable` skeleton rows

No `useEffect` + `useState` for data fetching anywhere in the codebase. TanStack Query owns all server state.

---

## Component Model

```
AppShell
  ├── Sidebar          — navigation, logout
  └── <Outlet>         — current page
        │
        ├── DataTable  — generic table (columns + data props)
        │     └── shadcn Table components
        │
        ├── Dialog     — confirmation / form modals
        │
        └── Recharts   — analytics charts (DashboardPage only)
```

### DataTable

`src/components/DataTable.tsx` is a generic wrapper around TanStack Table. Every page that needs a table passes its `ColumnDef[]` and `data[]` — the DataTable handles rendering, loading skeletons, and empty states. Sorting and filtering are added per-column in the `ColumnDef` as needed.

### shadcn/ui components

All UI primitives live in `src/components/ui/`. They are copied source code — not a package import. This means:
- You can edit them without fighting a library
- No version lock-in
- Tree-shaking works perfectly

---

## RTP Configuration — Safety Rules

The RTP page is the most operationally sensitive part of the admin. Key rules:

1. **Probabilities must sum to 100%** — the backend's `RTPOutcomeSerializer` validates this and returns a 400 if they don't. The admin UI shows a warning badge on any tier where the displayed outcomes don't sum to 100%.

2. **Changes take effect immediately** — there is no staging or preview. A saved tier is live on the next spin. Do not delete or modify tiers during high-traffic periods.

3. **The backend owns RNG** — changing outcomes in the admin only changes the probability distribution. The backend's `SpinService` uses `secrets.randbelow()` for cryptographically secure randomness. The admin cannot rig individual spins.

4. **Audit logged** — every RTP create, update, and delete is written to `AdminAuditLog` by the backend. The audit log page shows this history.

---

## Audit Log

The `AdminAuditLog` model on the backend is immutable:
- `save()` raises `PermissionError` if called on an existing record (no updates)
- `delete()` always raises `PermissionError` (no deletions)

The audit log page is read-only in the frontend as well — there are no action buttons, and the API only exposes a `GET` endpoint for it.

---

## What the Admin Dashboard Must Never Do

- Send financial amounts directly to users (all credits/debits go through backend service methods)
- Bypass the backend by calling payment provider APIs directly
- Store admin passwords or API secrets in environment variables
- Allow non-admin users to reach admin endpoints (enforced by backend `IsAdminUser` permission class, not just frontend routing)
