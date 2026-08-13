# Environment Variables

All configuration is injected via environment variables. For local
development, copy `.env.example` → `.env.local`.

> ⚠️ Never commit secrets. `.env*` is gitignored (only `.env.example` is
> tracked).

| Variable | Required | Client-safe? | Purpose |
| -------- | -------- | ------------ | ------- |
| `NEXT_PUBLIC_SITE_URL` | No (defaults to localhost) | ✅ | Canonical site URL (used for redirects & metadata) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | ✅ | Supabase anon/public key (safe to expose — it is gated by RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Only for admin features | ❌ server-only | Supabase service-role key (bypasses RLS). Never expose. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | For avatar uploads | ✅ | Cloudinary cloud name |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | For avatar uploads | ✅ | Unsigned upload preset name |

## Prefix rules

- `NEXT_PUBLIC_*` — inlined into the browser bundle. **Only** put public values
  here.
- Anything else — available on the server only. The service-role key and any
  future Cloudinary API secret must **never** use the `NEXT_PUBLIC_` prefix.

## Where variables are read

- `src/lib/env.ts` — client-safe helpers (`isSupabaseConfigured()`,
  `isCloudinaryConfigured()`, …).
- `src/lib/supabase/admin.ts` — reads `SUPABASE_SERVICE_ROLE_KEY` (server-only).

## Supabase keys — where to find them

Project Settings → API:

- `URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` / `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret)

## Cloudinary keys — where to find them

Dashboard → Account Details:

- Cloud name → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

Settings → Upload → Upload presets:

- Preset name → `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

See `docs/cloudinary-setup.md` for details.
