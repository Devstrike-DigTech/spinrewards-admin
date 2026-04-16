# Spin Rewards — Admin Dashboard

The internal admin panel for the Spin Rewards platform. Built with React, shadcn/ui, and TanStack Query.

---

## What This Service Does

The admin dashboard is the **control plane** for the platform. It gives authorized staff the ability to:

- Monitor platform health via a live analytics dashboard
- Manage users (view profiles, ban/unban)
- Review and approve/reject KYC submissions
- Review and approve/reject withdrawal requests
- Configure the spin RTP tiers and outcome probabilities
- View the immutable audit log of all admin actions

It communicates exclusively with the Django backend API. No business logic lives here — every action is a request to the backend which enforces authorization, validation, and atomicity.

---

## Stack

| Component | Technology |
|---|---|
| Language | TypeScript (strict mode) |
| Framework | React 18 + Vite 5 |
| Components | shadcn/ui (Radix UI primitives) |
| Styling | Tailwind CSS |
| Server state | TanStack Query v5 |
| Data tables | TanStack Table v8 |
| Charts | Recharts |
| Routing | React Router v6 |
| Auth state | Zustand (persisted) |
| Forms | React Hook Form + Zod |
| Notifications | Sonner |
| HTTP | Axios |

---

## Quick Start

### Requirements

- Node.js 20+
- The backend API running (locally or deployed)
- An admin account created on the backend (`python manage.py createsuperuser`)

### 1. Install

```bash
cd spinrewards-admin
npm install
```

### 2. Configure

```bash
cp .env.example .env
```

Set `VITE_API_BASE_URL` to your backend URL.

### 3. Run

```bash
npm run dev
```

Opens at `http://localhost:5174`. Log in with your Django admin credentials.

---

## Project Structure

```
spinrewards-admin/
├── src/
│   ├── main.tsx                        # React root, QueryClient, BrowserRouter
│   ├── App.tsx                         # Route tree, Toaster
│   ├── vite-env.d.ts                   # import.meta.env types
│   ├── api/
│   │   ├── client.ts                   # Axios instances, JWT auto-refresh
│   │   └── endpoints.ts                # Typed functions for every admin API call
│   ├── store/
│   │   └── authStore.ts                # Zustand — tokens + username (persisted)
│   ├── lib/
│   │   └── utils.ts                    # cn(), formatCurrency(), formatDate()
│   ├── types/
│   │   └── index.ts                    # All API response/request types
│   ├── routes/
│   │   └── PrivateRoute.tsx            # Redirects unauthenticated users to /login
│   ├── components/
│   │   ├── ui/                         # shadcn/ui components (owned code)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── textarea.tsx
│   │   ├── layout/
│   │   │   ├── AppShell.tsx            # Sidebar + main content area
│   │   │   └── Sidebar.tsx             # Nav links, logout
│   │   └── DataTable.tsx               # Generic TanStack Table wrapper
│   ├── pages/
│   │   ├── LoginPage.tsx               # Admin credential login form
│   │   ├── DashboardPage.tsx           # Stat cards + revenue chart
│   │   ├── UsersPage.tsx               # User table, search, ban/unban
│   │   ├── KYCPage.tsx                 # KYC queue, approve/reject
│   │   ├── WithdrawalsPage.tsx         # Withdrawal queue, approve/reject
│   │   ├── RTPPage.tsx                 # RTP tier CRUD, outcome editor
│   │   └── AuditLogPage.tsx            # Immutable action log
│   └── styles/
│       └── globals.css                 # Tailwind directives + CSS variables (dark theme)
├── docs/
├── Dockerfile                          # Multi-stage: build → nginx
├── nginx.conf                          # SPA fallback
├── tailwind.config.ts
├── postcss.config.js
├── vite.config.ts
├── tsconfig.json
├── .env.example
└── package.json
```

---

## Pages

| Route | Page | Description |
|---|---|---|
| `/login` | LoginPage | Admin username + password. Stores JWT in localStorage. |
| `/` | DashboardPage | 4 live stat cards + 30-day revenue area chart. Refreshes every 60s. |
| `/users` | UsersPage | Searchable user table. Ban and unban actions. |
| `/kyc` | KYCPage | Pending KYC queue. Approve or reject with a required reason. |
| `/withdrawals` | WithdrawalsPage | Pending withdrawal queue. Approve triggers payout. Reject reverses funds. |
| `/rtp` | RTPPage | Manage spin tiers and their outcome probabilities. Full CRUD. |
| `/audit-log` | AuditLogPage | Read-only log of all admin actions. Refreshes every 30s. |

---

## Data Flow

```
Admin action (e.g. approve KYC)
  → useMutation (TanStack Query)
  → apiClient.post('/admin/kyc/{id}/approve/')
  → Django backend validates, executes, writes audit log
  → 200 OK
  → queryClient.invalidateQueries(['kyc'])
  → Table re-fetches and updates
  → Sonner toast confirms action
```

All mutations invalidate their related queries on success. Data is always fetched fresh after an action — no optimistic updates that could desync from the backend.

---

## Environment Variables

See [`docs/environment-variables.md`](docs/environment-variables.md).

---

## Documentation

| Document | Contents |
|---|---|
| [`docs/getting-started.md`](docs/getting-started.md) | Creating an admin account, local setup, dev workflow |
| [`docs/environment-variables.md`](docs/environment-variables.md) | All env variables |
| [`docs/architecture.md`](docs/architecture.md) | Auth flow, data fetching strategy, component model, RTP safety rules |
| [`docs/deployment.md`](docs/deployment.md) | Vercel deployment, access restriction, CORS |

---

## Scripts

```bash
npm run dev        # Dev server on port 5174
npm run build      # Type-check + compile to dist/
npm run preview    # Preview production build locally
npm run typecheck  # Type-check without building
```
