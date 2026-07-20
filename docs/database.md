# Solagracia — Database

> Project: Supabase `solagracia-radio` (`plwqtzqfzbvuikwpuevy`, region `ap-northeast-2`)  
> Schema: `public`  
> Access model: **service-role only** from Next.js API / SSR (`createSupabaseAdmin`). RLS is enabled on all tables with **no anon/authenticated policies**.

---

## 1. Overview

Solagracia uses Postgres as a headless CMS + analytics store. The public site never talks to Supabase with the anon key for reads/writes of CMS data — server code uses `SUPABASE_SERVICE_ROLE_KEY` and falls back to `src/data/*` when queries fail.

| Concern | Tables |
|---------|--------|
| On-air / schedule | `hosts`, `shows`, `schedule_slots` |
| Partners | `partners`, `sponsorship_plans` |
| Streams | `frequencies` |
| Social | `social_links` |
| Ads | `ad_slots` |
| Layout / copy | `section_config`, `section_headers`, `site_config` |
| Analytics | `visitors`, `sessions`, `events` |

**Not in schema (intentionally removed):** `picks`, `chart`, `news` (editorial module dropped).

---

## 2. Access & security

| Role | Capabilities |
|------|----------------|
| `anon` / `authenticated` (PostgREST) | **No table policies** → cannot `SELECT`/`INSERT` CMS or analytics rows |
| `service_role` (server) | Full access (bypasses RLS) — used by `/api/admin/*`, `/api/analytics/beacon`, `/api/public/*`, `data-fetcher` |
| Auth users | Admin JWT must have `app_metadata.role = "admin"` (checked in `requireAdmin` / login) |

**Implication:** Never ship the service role key to the browser. Client admin UI calls Next.js routes with a Bearer access token; those routes use the service role after `requireAdmin`.

---

## 3. Migrations (`supabase/migrations/`)

| File | Purpose |
|------|---------|
| `20260720130000_initial_cms_schema.sql` | Placeholder note — initial CMS DDL was applied remotely via MCP (`initial_cms_schema`) |
| `20260720140000_allow_overnight_schedule_slots.sql` | Allow overnight slots (`end_hour <> start_hour`, not `end > start`) |
| `20260720150000_seed_ad_slots.sql` | Seed default ad rows |
| `20260720160000_ad_slots_schedule_and_clicks.sql` | `starts_at` / `ends_at` / `click_count` + `increment_ad_click()` |
| `20260720210000_analytics_tables.sql` | `visitors` / `sessions` / `events` + session insert trigger |
| `20260720230000_drop_editorial_module.sql` | Drop picks/chart/news + related section rows |
| `20260720240000_revoke_anon_ad_click_rpc.sql` | Revoke public execute on `increment_ad_click`; grant `service_role` only |

Apply new changes as **new timestamped migrations** only. Do not rewrite applied history.

---

## 4. Entity relationship (simplified)

```
hosts 1──* shows 1──* schedule_slots
visitors 1──* sessions
visitors 1──* events   (nullable FK)
```

Other tables are independent. Image URLs are plain `text` columns pointing at Storage public URLs (optionally with `#focus=x,y` fragment — see `docs/storage.md`).

---

## 5. Tables

### 5.1 `hosts` — penyiar

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid PK | `gen_random_uuid()` |
| `name` | text NOT NULL | |
| `slug` | text NOT NULL UNIQUE | |
| `photo_url` | text | Storage URL (+ optional `#focus=`) |
| `photo_alt` | text | |
| `role_title` | text | |
| `tagline` | text | |
| `tags` | text[] | default `{}` |
| `display_number` | text | UI stamp e.g. `01` |
| `href` | text | |
| `bio` | text | |
| `sort_order` | int | default `0` |
| `status` | text | `draft` \| `published` |
| `created_at` / `updated_at` | timestamptz | |

**Public:** published hosts only (`data-fetcher` → `PenyiarSection`).

---

### 5.2 `shows` — program catalog

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid PK | |
| `title` | text NOT NULL | |
| `slug` | text NOT NULL UNIQUE | |
| `host_id` | uuid FK → `hosts` | `ON DELETE SET NULL` |
| `description` | text | |
| `cover_url` | text | Storage (`shows` bucket) |
| `tag` | text | |
| `status` | text | `draft` \| `published` |
| `created_at` / `updated_at` | timestamptz | |

---

### 5.3 `schedule_slots` — weekly grid

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid PK | |
| `show_id` | uuid FK → `shows` | `ON DELETE CASCADE` |
| `day_of_week` | int | `0`–`6` (Minggu–Sabtu, JS `Date.getDay()`) |
| `start_hour` | real | `0` ≤ x `< 24` (fractional hours, step 0.25) |
| `end_hour` | real | `0` < x ≤ `24` |
| `sort_order` | int | |
| `created_at` / `updated_at` | timestamptz | |

**Constraint:** `end_hour <> start_hour` (overnight allowed, e.g. 22 → 2).

**Admin:** `/admin/schedule` · **Public:** `ProgramSection`, `OnAirNow`, hero on-air.

---

### 5.4 `partners` — history marquee logos

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid PK | |
| `name` | text NOT NULL | |
| `initials` | text NOT NULL | Fallback when no logo |
| `logo_url` | text | Storage (`partners`) |
| `href` | text | |
| `sort_order` | int | |
| `status` | text | `draft` \| `published` |
| timestamps | | |

---

### 5.5 `sponsorship_plans` — rate cards

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid PK | |
| `name` | text NOT NULL | |
| `price` | text NOT NULL | Display string |
| `unit` | text | e.g. `/bulan` |
| `features` | text[] | |
| `is_featured` | boolean | |
| `whatsapp_message` | text | Prefill for WA CTA |
| `sort_order` | int | |
| `status` | text | `draft` \| `published` |
| timestamps | | |

**Product rule (app-enforced):** max **3** published plans.

---

### 5.6 `frequencies` — stream endpoints

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid PK | |
| `label` | text NOT NULL | e.g. `98.2 FM` |
| `audio_url` | text NOT NULL | Icecast / audio stream |
| `video_url` | text | HLS `.m3u8` |
| `poster_url` | text | Storage (`site` / posters) |
| `station_name` | text | |
| `is_default` | boolean | Player default |
| `is_active` | boolean | |
| `sort_order` | int | |
| timestamps | | |

Seed (locked product URLs): audio `https://c4.siar.us:8129/stream`, video `https://sradio.siar.us/live/sradio.m3u8`.

---

### 5.7 `social_links` — single source of truth

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid PK | |
| `platform` | text NOT NULL | e.g. `instagram`, `tiktok` |
| `label` | text NOT NULL | |
| `url` | text NOT NULL | |
| `sort_order` | int | |
| `is_active` | boolean | |
| timestamps | | |

Used by hero, kontak, and footer (not duplicated in `site_config`).

---

### 5.8 `ad_slots`

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid PK | |
| `section_id` | text NOT NULL | `tentang` \| `program` \| `penyiar` |
| `label` / `sponsor` / `line` | text | Microcopy |
| `variant` | text | `strip` \| `panel` \| `inline` \| `image` |
| `tone` | text | `match` \| `ink` (nullable) |
| `href` | text | Click target |
| `image_url` / `image_alt` | text | |
| `image_shape` | text | `banner` \| `portrait` (nullable) |
| `is_visible` | boolean | |
| `sort_order` | int | |
| `status` | text | `draft` \| `published` |
| `starts_at` / `ends_at` | timestamptz | Optional schedule window |
| `click_count` | int | Incremented via RPC |
| timestamps | | |

**Public click path:** `GET/POST /api/public/ad-click?id=<uuid>` → RPC `increment_ad_click` → 302 redirect to `href`.

---

### 5.9 `section_config` — GRACIA rail / homepage order

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid PK | |
| `section` | text UNIQUE | `home`, `tentang`, `program`, `penyiar`, `partner`, `kontak` |
| `is_visible` | boolean | |
| `sort_order` | int | |
| `letter` | text | Rail letter |
| `nav_label` / `menu_label` | text | |
| `surface` | text | `dark` \| `smoke` \| `white` |
| `updated_at` | timestamptz | |

`home` is pinned in admin reorder UI.

---

### 5.10 `section_headers` — per-section eyebrow/title

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid PK | |
| `section` | text UNIQUE | |
| `eyebrow` | text | |
| `title` | text | |
| `title_accent` | text | |
| `description` | text | |
| `updated_at` | timestamptz | |

Typical sections: `tentang`, `program`, `penyiar`, `partner`, `kontak`.

---

### 5.11 `site_config` — key/value CMS bag

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid PK | |
| `section` | text | Logical group |
| `key` | text | |
| `value` | text | |
| `value_type` | text | `text` \| `image` \| `url` \| `json` |
| `updated_at` | timestamptz | |

**Unique:** `(section, key)`.

#### Sections & keys (current)

| Section | Keys |
|---------|------|
| `seo` | `site_name`, `parent_name`, `title`, `subtitle`, `description`, `og_image_url`, `favicon_url` |
| `brand` | `display_name`, `frequency_label` |
| `hero` | `brand`, `eyebrow`, `vertical_tagline`, `support`, `cover_url`, `cover_alt`, `logo_url`, `ctas` (json), `mobile_cta_label`, `mobile_cta_href` |
| `tentang` | `headline`, `headline_accent`, `body` (json), `stats` (json), `ctas` (json), `social_label`, `testimonial` (json) |
| `contact` | `studio_label`, `address`, `operating_hours`, `email`, `frequency`, `whatsapp_number`, `channels` (json), `hotlines` (json), `form` (json) |
| `partner` | `history_label`, `plans_label`, `plan_cta_label`, `currency_prefix`, `whatsapp_number`, `more_info_label`, `more_info_href` |
| `footer` | `brand_title`, `brand_description`, `copyright_text`, `listen_*`, `contact_*`, `column_*`, `wordmark*`, `legal_links` (json) |
| `marquee` | `items` (json string array) |
| `on_air` | `label`, `upcoming_label`, `fallback_title` |
| `legal` | `privacy_title`, `privacy_updated_label`, `privacy_body` (json) |

---

### 5.12 Analytics

#### `visitors`

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid PK | |
| `uid` | text UNIQUE | Client-generated sticky id |
| `ip`, `city`, `region`, `country` | text | From request headers / geo |
| `viewport` | text | `mobile` \| `tablet` \| `desktop` |
| `first_seen` / `last_seen_at` | timestamptz | |
| `total_sessions` / `total_page_views` | int | |

#### `sessions`

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid PK | |
| `sid` | text UNIQUE | Client session id |
| `visitor_id` | uuid FK → `visitors` | `ON DELETE CASCADE` |
| `started_at` | timestamptz | |
| `duration_seconds` / `page_views` | int | |
| `referrer` / `user_agent` | text | |
| timestamps | | |

**Trigger:** `analytics_session_insert` → bumps `visitors.total_sessions`.

#### `events`

| Column | Type | Notes |
|--------|------|--------|
| `id` | bigserial PK | |
| `session_sid` | text | |
| `visitor_id` | uuid FK | `ON DELETE SET NULL` |
| `event_type` | text | e.g. `pv`, `sv`, `ap`, `sp`, `cf` |
| `event_data` | text | Payload (section id, etc.) |
| `occurred_at` | timestamptz | |

**Write path:** `POST /api/analytics/beacon` only (not from admin browser). Admin paths are not tracked.

---

## 6. Functions

| Function | Security | Purpose |
|----------|----------|---------|
| `set_updated_at()` | invoker | Trigger helper for `updated_at` columns |
| `analytics_on_session_insert()` | invoker | Increment visitor session count |
| `increment_ad_click(p_id uuid)` | **DEFINER** | Atomically `click_count++` and return `href` if published + has href |

`increment_ad_click` is **not** executable by `anon`/`authenticated` (revoked). Only `service_role` / API route.

---

## 7. Indexes (non-PK highlights)

- `ad_slots(section_id)`
- `schedule_slots(day_of_week)`
- `visitors(last_seen_at DESC)`, `visitors(country)`
- `sessions(started_at DESC)`, `sessions(visitor_id)`
- `events(occurred_at DESC, id DESC)`, `events(event_type)`, `events(visitor_id)`

---

## 8. App ↔ API map

| Domain | Admin UI | Admin API | Public consumer |
|--------|----------|-----------|-----------------|
| Hosts | `/admin/hosts` | `/api/admin/hosts` | `fetchPenyiarContent` |
| Shows/slots | `/admin/schedule` | `/api/admin/shows`, `/schedule` | `fetchProgramContent`, `fetchOnAirContent` |
| Partners/plans | `/admin/partners` | `/api/admin/partners`, `/sponsorship-plans` | `fetchPartnerContent` |
| Frequencies | `/admin/frequencies` | `/api/admin/frequencies` | `fetchPlayerPayload` |
| Social | `/admin/social` | `/api/admin/social-links` | `fetchSocialLinks` |
| Ads | `/admin/ads` | `/api/admin/ads` | `fetchSectionAds` + `/api/public/ad-click` |
| Site copy | `/admin/site` | `/api/admin/site-config`, `/section-headers`, `/section-config` | multiple fetchers + `generateMetadata` |
| Analytics | `/admin/analytics` | `/api/admin/analytics/*` | beacon → writer |
| Dashboard | `/admin/dashboard` | `/api/admin/dashboard` | — |

---

## 9. Operational notes

1. **Fallbacks:** If Supabase is down, public pages render from `src/data/*`.
2. **ISR:** Homepage `revalidate = 3600` — CMS edits may take up to ~1h unless you revalidate on demand later.
3. **Status fields:** Prefer `published` for anything that should appear on the public site.
4. **Hours:** Schedule uses fractional hours in WIB logic in app code (`Asia/Jakarta`).
5. **No Realtime** required for CMS; admin uses React Query polling/invalidation.
6. **Advisors:** RLS-enabled-no-policy is expected. Prefer enabling Auth “leaked password protection” in the Supabase dashboard.

---

## 10. Environment

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=          # auth + (unused for CMS table access)
SUPABASE_SERVICE_ROLE_KEY=            # server only
NEXT_PUBLIC_SITE_URL=                 # absolute URLs / sitemap / OG
```
