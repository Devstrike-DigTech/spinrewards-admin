# Getting Started — Spin Rewards Admin Dashboard

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 20+ | Use [nvm](https://github.com/nvm-sh/nvm) |
| npm | 9+ | Comes with Node |
| Backend API | — | Running locally or deployed |

---

## Step 1 — Create an admin account on the backend

The admin dashboard authenticates with Django admin credentials, not Telegram.

If you haven't already, create an admin user on the backend:

```bash
cd spinrewards-backend
python manage.py createsuperuser
```

Follow the prompts to set a username and password. This account is what you use to log in to the dashboard.

For Railway-deployed backends, run the command via the Railway CLI:

```bash
railway run python manage.py createsuperuser
```

---

## Step 2 — Clone and install

```bash
git clone <your-repo-url>
cd spinrewards-admin
npm install
```

---

## Step 3 — Configure environment

```bash
cp .env.example .env
```

Open `.env` and set:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

For a deployed backend:
```env
VITE_API_BASE_URL=https://api.spinrewards.com/api/v1
```

---

## Step 4 — Start the dev server

```bash
npm run dev
```

Opens at `http://localhost:5174`.

Log in with the superuser credentials you created in Step 1.

---

## Development Workflow

### Type checking

```bash
npm run typecheck
```

Run before committing to catch type errors without a full build.

### Building

```bash
npm run build
```

Compiles TypeScript and bundles to `dist/`. Preview it locally:

```bash
npm run preview
```

### Hot reload

Vite's HMR reflects file saves instantly in the browser. No manual refresh needed during development.

---

## Adding a new page

1. Create the page component in `src/pages/YourPage.tsx`
2. Add the route in `src/App.tsx` inside the `<PrivateRoute>` block
3. Add the nav link in `src/components/layout/Sidebar.tsx`
4. Add the API endpoint function in `src/api/endpoints.ts`
5. Add the response type in `src/types/index.ts`

---

## Adding a new shadcn/ui component

The `src/components/ui/` folder contains the shadcn components already in use. To add a new one:

1. Go to [ui.shadcn.com](https://ui.shadcn.com/docs/components) and find the component
2. Copy the component source code
3. Create the file in `src/components/ui/your-component.tsx`
4. Make sure the required Radix UI package is installed (`npm install @radix-ui/react-<name>`)

Components are owned code — you can edit them freely.

---

## Next Steps

- [Environment Variables](./environment-variables.md)
- [Architecture](./architecture.md)
- [Deployment](./deployment.md)
