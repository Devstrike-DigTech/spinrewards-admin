# Deployment Guide — Spin Rewards Admin Dashboard

The admin dashboard is a static site. After `npm run build`, the `dist/` folder contains plain HTML, CSS, and JS. It requires no server — just a static host with an SPA fallback rule.

**Vercel is recommended.** Unlike the Mini App, the admin dashboard should have access restrictions applied so it is not publicly reachable.

---

## Vercel (Recommended)

### Step 1 — Push to GitHub

```bash
cd spinrewards-admin
git init
git add .
git commit -m "chore: initial admin dashboard setup"
git remote add origin <your-github-repo-url>
git push -u origin main
```

---

### Step 2 — Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project**
2. Import your GitHub repository
3. Vercel auto-detects Vite — no framework config needed
4. Under **Environment Variables**, add:

| Key | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://api.spinrewards.com/api/v1` |

5. Click **Deploy**

---

### Step 3 — Set a custom domain

1. Vercel → project → **Settings → Domains**
2. Add `admin.spinrewards.com`
3. In Cloudflare, add a `CNAME`: `admin` → `cname.vercel-dns.com` (proxy status: DNS only)

---

### Step 4 — Restrict access (Important)

The admin dashboard must not be reachable by the public. Options:

#### Option A — Vercel Password Protection (simplest)

1. Vercel → project → **Settings → Deployment Protection**
2. Enable **Password Protection**
3. Set a strong shared password
4. Share it only with admin staff

This adds an HTTP Basic Auth gate in front of the entire deployment — no code changes needed.

#### Option B — Vercel Access Groups (team plan)

On Vercel's team plan, you can restrict deployments to specific email addresses via Access Groups. Only those users can reach the site after authenticating with their Vercel account.

#### Option C — Cloudflare Access (zero-trust)

If you use Cloudflare for DNS:

1. Cloudflare dashboard → **Zero Trust → Access → Applications**
2. Add an application for `admin.spinrewards.com`
3. Set a policy allowing only specific email addresses or an identity provider (Google Workspace, GitHub org, etc.)
4. Users are challenged at the Cloudflare edge before the request reaches Vercel

This is the most robust approach and works independently of Vercel's plan.

---

### Step 5 — Verify

Navigate to your admin domain. You should be challenged by whichever access restriction you configured, then reach the Spin Rewards login page. Log in with superuser credentials to confirm the backend connection works.

---

## Backend CORS

The Django backend must allow requests from the admin domain. In `spinrewards-backend/config/settings/production.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "https://app.spinrewards.com",     # Mini App
    "https://admin.spinrewards.com",   # Admin Dashboard
]
```

Without this, all API calls from the admin will be blocked by the browser.

---

## Docker / Self-hosted

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.spinrewards.com/api/v1 \
  -t spinrewards-admin .

docker run -d \
  --name spinrewards-admin \
  --restart unless-stopped \
  -p 8080:80 \
  spinrewards-admin
```

Put Nginx or Caddy in front for HTTPS, and restrict access by IP or with HTTP Basic Auth:

```nginx
server {
    server_name admin.spinrewards.com;

    # IP allowlist — only your team's IPs
    allow 102.89.xx.xx;
    deny all;

    location / {
        proxy_pass http://localhost:8080;
    }
}
```

---

## Environment Checklist (Pre-deploy)

- [ ] `VITE_API_BASE_URL` points to the production backend
- [ ] Backend CORS includes the admin domain
- [ ] Access restriction is enabled (Vercel password, Cloudflare Access, or IP allowlist)
- [ ] Admin superuser account exists on the production backend
- [ ] Login page loads and credentials work
- [ ] Dashboard stat cards load (confirms backend connection)
- [ ] KYC and withdrawal queues are reachable
- [ ] RTP page shows current tiers

---

## Production Hardening Notes

- **Never expose the admin dashboard without access restriction.** The backend enforces `IsAdminUser` on all `/admin/*` endpoints, so a stolen JWT from a regular user won't work — but the login page itself should not be publicly visible.
- **Use a strong, unique password** for the Django superuser on production. Do not reuse the dev password.
- **Rotate the superuser password** if a staff member leaves.
- **The audit log is your paper trail.** Review it regularly. It cannot be altered from any interface.
