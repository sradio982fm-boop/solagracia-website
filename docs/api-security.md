# Solagracia — API security

How admin and public APIs are protected from abuse and unauthorized access.

---

## 1. Threat model (short)

| Attacker goal | Mitigation |
|---------------|------------|
| Call `/api/admin/*` without login | Bearer JWT required + role `admin` |
| Replay stolen access token alone | httpOnly `sg_gate` cookie (HMAC with `SG_API_KEY`) also required |
| Brute-force login | Proxy rate limit 5 / min / IP |
| Flood ad clicks / public GETs | Proxy rate limits |
| Spam analytics beacon | Origin allowlist + rate limit in route |
| Read CMS tables via Supabase anon key | RLS on, **no** anon policies; service role server-only |
| Embed site in iframe / XSS script CDN | CSP + `frame-ancestors 'none'` + security headers |
| Inject gambling/malware via CMS URLs/HTML | `sanitizeHref` / `sanitizeHtml` at render + Zod URL checks on admin writes |

---

## 2. Credentials

| Secret | Where | Purpose |
|--------|--------|---------|
| Supabase access JWT | `sessionStorage` (`sg_admin_token`) | Proves admin user identity to `/api/admin` and `/api/auth/*` |
| `sg_refresh` | httpOnly cookie, path `/api/auth` | Refresh access token |
| `sg_session` | httpOnly cookie, path `/` | Soft gate for `/admin/*` pages |
| `sg_gate` | httpOnly cookie, path `/` | HMAC proof login went through our server |
| `SG_API_KEY` | **Server env only** | Signs `sg_gate`; optional `x-api-key` for machines |
| `SUPABASE_SERVICE_ROLE_KEY` | Server env only | DB/Storage bypass RLS — never in browser |

Generate API key:

```bash
openssl rand -base64 48
```

Set in `.env.local` / Vercel:

```bash
SG_API_KEY=...
```

---

## 3. Route matrix

| Route prefix | Auth | Extra |
|--------------|------|--------|
| `/api/admin/*` | Bearer admin JWT **+** (`sg_gate` **or** `x-api-key`) | Rate limit; `requireAdmin` |
| `/api/auth/login` | Public | Rate limit 5/min/IP; rejects non-admin |
| `/api/auth/refresh` | `sg_refresh` cookie | Re-issues gate; admin role check |
| `/api/auth/me` | Bearer | Admin role only |
| `/api/auth/logout` | Bearer | Clears cookies |
| `/api/analytics/beacon` | Same-origin only | Rate limit + payload caps |
| `/api/public/ad-click` | Public | UUID validation; rate limit; RPC service-role only |
| `/api/public/now-playing` | Public read | Cached; rate limit |
| `/api/public/health` | Public | Rate limit |

Homepage HTML is **not** an API — SSR uses service role in `data-fetcher` on the server.

---

## 4. Admin browser flow

1. `POST /api/auth/login` with email/password  
2. Server verifies Supabase + `app_metadata.role === "admin"`  
3. Sets `sg_refresh`, `sg_session`, `sg_gate` (HMAC)  
4. Returns `accessToken` to client (sessionStorage)  
5. `adminFetch` sends `Authorization: Bearer <token>` — cookies go automatically (same origin)  
6. Proxy + `requireAdmin` enforce Bearer + gate/API key + role  

**Logout / password change** clears cookies; password change uses `requireAdmin`.

---

## 5. Machine / automation access

For scripts (CI, cron) calling admin APIs:

```http
Authorization: Bearer <admin_user_access_token>
x-api-key: <SG_API_KEY>
```

Prefer a short-lived admin JWT from a dedicated service account. Do **not** put `SG_API_KEY` in frontend bundles.

---

## 6. What is intentionally public

- `/api/public/now-playing` — widget/player integrations  
- `/api/public/ad-click` — must work from the marketing site without secrets  
- `/api/analytics/beacon` — browser beacon (origin-locked)  
- `/api/public/health` — uptime checks  

These must **not** require `SG_API_KEY` in the browser (the key would leak). They rely on rate limits, validation, and RLS.

---

## 7. Production checklist

- [ ] `SG_API_KEY` set (≥32 chars) on Vercel / host  
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set; never `NEXT_PUBLIC_`  
- [ ] Only one admin user with `app_metadata.role = admin`  
- [ ] Supabase Auth leaked-password protection enabled (dashboard)  
- [ ] HTTPS only (`Strict-Transport-Security` already in `next.config.ts`)  
- [ ] After deploy: log out/in once so `sg_gate` is issued  

---

## 8. Code map

| File | Role |
|------|------|
| `src/proxy.ts` | Edge gate: rate limits, Bearer, gate/`x-api-key` |
| `src/lib/api-security.ts` | HMAC gate, API key compare, rate limiter |
| `src/lib/auth-guard.ts` | JWT + role + gate/`x-api-key` |
| `src/lib/auth-cookies.ts` | Sets/clears refresh, session, gate cookies |
| `next.config.ts` | CSP + security headers |
| `src/lib/security.ts` | URL/HTML sanitizers + Zod `httpUrl` / asset schemas |

---

## 9. CMS injection defense (gambling / malware)

Attackers who compromise an admin session (or poison a feed) often try to store
`javascript:` links, `data:` images, or rich HTML with scripts. Solagracia mirrors
S Radio’s layered defense:

1. **Write-time** — admin APIs reject unsafe URLs (`httpUrl`, `optionalAssetUrl`,
   `optionalWebHref`; site-config keys ending in `_url` / `href`).
2. **Read-time** — public components call `sanitizeHref` / `sanitizeHttpHref` /
   `sanitizeAssetSrc` before rendering `href` / `src`.
3. **Redirect** — `/api/public/ad-click` only redirects to validated `http(s)` URLs.
4. **CSP** — blocks unexpected script/frame/media origins; `form-action` allows
   `https://wa.me` for WhatsApp CTAs.
5. **HTML** — `sanitizeHtml` allowlists formatting tags only (no attributes) if
   rich text is ever rendered with `dangerouslySetInnerHTML`.
