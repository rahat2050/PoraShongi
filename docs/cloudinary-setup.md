# Cloudinary Setup

PoraShongi uses Cloudinary for profile images. Images are uploaded **directly
from the browser** using an unsigned upload preset, then delivered as
optimized URLs.

## 1. Get your cloud name

Dashboard → Account Details → **Cloud name**.

Set it in `.env.local`:

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

## 2. Create an unsigned upload preset

1. Cloudinary **Settings → Upload → Upload presets → Add upload preset**.
2. **Signing mode**: `Unsigned`.
3. **Folder**: `porashongi/profiles`.
4. Set a sensible transformation preset, e.g. incoming transformation
   `c_limit,w_1200` to cap image size.
5. Save and copy the preset name, then:

```bash
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=porashongi_profile_unsigned
```

## 3. How it works

- `src/lib/cloudinary.ts` exposes:
  - `uploadProfileImage(file)` — POSTs to
    `https://api.cloudinary.com/v1_1/{cloud}/image/upload` with the preset.
  - `buildOptimizedImageUrl(url, { width, height })` — injects
    `w_,h_,c_fill,g_face,f_auto,q_auto` transforms for optimized delivery.

- The profile form uploads the avatar and stores the returned `secure_url`
  in `profiles.avatar_url`.

## Notes

- **Unsigned presets are public** — they can only upload to the folder you
  restrict them to, but anyone can upload. For stricter control in a later
  phase, switch to **signed uploads** via a server endpoint using your
  Cloudinary API secret (never exposed to the browser).
- If Cloudinary is not configured, the profile form falls back to a plain
  image-URL input, so the app still works.
