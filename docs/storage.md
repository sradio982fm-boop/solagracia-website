# Solagracia — Storage

> Project: Supabase Storage on `solagracia-radio` (`plwqtzqfzbvuikwpuevy`)  
> Upload path: Admin UI → `POST /api/admin/upload` (service role) → public URL stored in Postgres text columns.

---

## 1. Overview

All CMS images live in **Supabase Storage**, not in the Next.js `public/` folder (except static fallbacks like `/cover-image.png` and default favicon).

| Layer | Responsibility |
|-------|----------------|
| Admin `ImageUpload` | Pick file, optional focal point, call `adminUpload()` |
| `/api/admin/upload` | Auth, validate magic bytes, size, bucket; upload via service role |
| Supabase buckets | Store objects; public read |
| DB columns (`*_url`) | Persist **public URL** string (may include `#focus=x,y`) |
| Public `SmartImage` | Honor focal fragment as CSS `object-position` |

Audio/video **streams** are not stored in Supabase — they are external URLs in `frequencies.audio_url` / `video_url` (siar.us).

---

## 2. Buckets

All buckets are **public** for read. Bucket-level limits match the upload API.

| Bucket ID | Public | Max size | Allowed MIME | Used for |
|-----------|--------|----------|--------------|----------|
| `hosts` | yes | 5 MB | jpeg, png, webp | Penyiar photos |
| `shows` | yes | 5 MB | jpeg, png, webp | Show covers |
| `partners` | yes | 5 MB | jpeg, png, webp | Partner logos |
| `ads` | yes | 5 MB | jpeg, png, webp | Ad creatives |
| `site` | yes | 5 MB | jpeg, png, webp | Hero cover/logo, SEO OG/favicon, frequency posters, site config images |

### Storage policies

| Policy | Command | Who | Rule |
|--------|---------|-----|------|
| `Public read CMS images` | `SELECT` | `public` | `bucket_id` in (`hosts`, `shows`, `partners`, `ads`, `site`) |

There is **no** anon/authenticated `INSERT`/`UPDATE`/`DELETE` policy. Uploads happen only with the **service role** from the Next.js upload route.

---

## 3. Upload API

**Endpoint:** `POST /api/admin/upload`  
**Auth:** Bearer admin JWT (`requireAdmin` + proxy Bearer gate)  
**Body:** `multipart/form-data`

| Field | Required | Description |
|-------|----------|-------------|
| `file` | yes | Image file |
| `bucket` | yes | One of `hosts` \| `shows` \| `partners` \| `ads` \| `site` |
| `path` | no | Optional subfolder (sanitized) |

### Server validation (`src/app/api/admin/upload/route.ts`)

1. Admin role required  
2. Bucket allowlist  
3. Max size **5 MB** (`MAX_FILE_SIZE`)  
4. Magic-byte detection (not client MIME trust):
   - JPEG (`FF D8 FF`)
   - PNG signature
   - WebP (`RIFF….WEBP`)
5. Path sanitization: strip `..`, strip unsafe chars, no leading/trailing `/`  
6. Filename: `slugify(original)-{timestamp}.{ext}`  
7. `upsert: false` — never overwrite by path collision  
8. Response:

```json
{
  "url": "https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>",
  "path": "<bucket>/<path>",
  "size": 12345
}
```

### Client helper

```ts
// src/lib/admin/api-client.ts
adminUpload(file, bucket, subpath?)
```

Used by `ImageUpload` (`src/components/admin/ImageUpload.tsx`).

---

## 4. Which UI uses which bucket

| Admin page | Bucket | Typical `path` (subpath) | DB column(s) |
|------------|--------|--------------------------|--------------|
| `/admin/hosts` | `hosts` | _(root)_ | `hosts.photo_url` |
| `/admin/schedule` (shows) | `shows` | `covers` | `shows.cover_url` |
| `/admin/partners` | `partners` | `logos` | `partners.logo_url` |
| `/admin/ads` | `ads` | `{sectionId}` e.g. `tentang` | `ad_slots.image_url` |
| `/admin/frequencies` | `site` | `posters` | `frequencies.poster_url` |
| `/admin/site` | `site` | `{section}` e.g. `hero`, `seo` | `site_config.value` where `value_type = image` |

Object key example:

```
shows/covers/morning-brew-1721480000000.webp
site/hero/cover-1721480000000.jpg
ads/program/banner-1721480000000.png
```

---

## 5. Public URL shape

```
https://{PROJECT_REF}.supabase.co/storage/v1/object/public/{bucket}/{objectPath}
```

For this project:

```
https://plwqtzqfzbvuikwpuevy.supabase.co/storage/v1/object/public/...
```

Next.js image config must allow that host (see `next.config` remotePatterns / CSP if applicable).

---

## 6. Focal point (`#focus=x,y`)

Focal crop is **not** a DB column and **not** a Storage metadata field.

- Encoded on the URL fragment:  
  `https://…/photo.webp#focus=50,25`
- Fragments are **not** sent to Storage when fetching the image
- Parsed by `src/lib/focal-point.ts` → CSS `object-position`
- Set in admin via `ImageUpload` “Area tampil” picker
- Rendered on the public site with `SmartImage` for `object-cover` CMS images

Keep the fragment when saving URLs back to Postgres after upload + focus edit.

---

## 7. Image types & aspects in admin UI

`ImageUpload` supports aspect presets (UI crop framing), including:

| Aspect | Ratio | Typical use |
|--------|-------|-------------|
| `square` | 1:1 | Logos, favicon, inline ad thumb |
| `photo` | 4:3 | Show / program cards |
| `video` | 16:9 | Hero cover, OG image, video poster |
| `wide` | 16:7 | Strip ad thumbs |
| `portrait` | 3:4 | Host photos, panel / portrait ads |
| `banner` | 4:1 | Full-bleed banner ads |

These are **UI helpers**; Storage still stores the full uploaded file. Public crop honor is via focal point + `object-fit: cover`.

---

## 8. What is *not* in Storage

| Asset | Location |
|-------|----------|
| Default cover fallback | `/public/cover-image.png` |
| Default favicon (until CMS upload) | `/public/favicon.ico` (or similar) |
| Live audio stream | External Icecast URL in `frequencies` |
| Live video HLS | External `.m3u8` in `frequencies` |
| Analytics / DB blobs | N/A — no binary columns |

---

## 9. Lifecycle & ops

### Uploading

1. Admin selects image → validated client-side loosely → uploaded server-side strictly  
2. Public URL written into the relevant form field / `site_config`  
3. On save, admin API persists the URL to Postgres  

### Replacing images

- New upload creates a **new object** (unique timestamped name)  
- Old object is **not** auto-deleted (orphan files may accumulate)  
- Optional future cleanup: list unused Storage objects vs DB URL scan  

### Deleting content rows

- Deleting a host/show/ad does **not** delete the Storage object  
- Safe for integrity; Storage may grow over time  

### Permissions checklist

- [ ] Buckets exist: `hosts`, `shows`, `partners`, `ads`, `site`  
- [ ] Public read policy on those buckets  
- [ ] No public write policies  
- [ ] `SUPABASE_SERVICE_ROLE_KEY` only on server  
- [ ] Upload route still allowlists the five buckets  

---

## 10. Failure modes

| Symptom | Likely cause |
|---------|----------------|
| Upload 401/403 | Missing/expired admin token or non-admin role |
| Upload 400 “not a valid image” | Wrong format / corrupted file / renamed executable |
| Upload 413 | File &gt; 5 MB |
| Upload 500 from Storage | Bucket missing, MIME not in bucket allowlist, network |
| Image 404 on site | URL typo, object deleted, wrong bucket path |
| Image ignores focus | Using plain `<img>` instead of `SmartImage` / fragment stripped |

---

## 11. Related code

| Path | Role |
|------|------|
| `src/app/api/admin/upload/route.ts` | Upload handler |
| `src/lib/admin/api-client.ts` → `adminUpload` | Client multipart helper |
| `src/components/admin/ImageUpload.tsx` | Admin picker + focal UI |
| `src/lib/focal-point.ts` | `#focus=` encode/decode |
| `src/components/media/SmartImage.tsx` (or equivalent) | Public crop honor |
| `src/lib/supabase/admin.ts` | Service-role client |
| `docs/database.md` | Where URLs are stored in tables |

---

## 12. Quick reference — env

```bash
NEXT_PUBLIC_SUPABASE_URL=https://plwqtzqfzbvuikwpuevy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=   # server upload + CMS
# Anon key is NOT used for Storage writes
```
