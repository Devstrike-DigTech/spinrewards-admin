# Environment Variables Reference

All variables are loaded from `.env` in the project root.
Copy `.env.example` to `.env` — never commit the real `.env`.

Only variables prefixed with `VITE_` are bundled into the browser build. There are no secrets here — the admin dashboard is a frontend-only application.

---

## API

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Backend API base URL including `/api/v1`. e.g., `https://api.spinrewards.com/api/v1` |

---

## Example `.env` for Local Development

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Example `.env` for Production

```env
VITE_API_BASE_URL=https://api.spinrewards.com/api/v1
```

---

## Notes

- There is intentionally only one variable. All secrets (payment keys, bot tokens, DB credentials) live in the backend only.
- The admin JWT is stored in `localStorage` under the key `spinrewards-admin-auth`. It is cleared on logout.
- If you add feature flags in future, prefix them with `VITE_` and document them here.

---

## Vercel

Set environment variables in **Project Settings → Environment Variables**. Vercel injects them at build time.

| Variable | Environment | Value |
|---|---|---|
| `VITE_API_BASE_URL` | Production | `https://api.spinrewards.com/api/v1` |
