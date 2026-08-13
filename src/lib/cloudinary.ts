import {
  getCloudinaryCloudName,
  getCloudinaryUploadPreset,
  isCloudinaryConfigured,
} from "@/lib/env";

export type CloudinaryUploadResult =
  | { ok: true; url: string; publicId: string }
  | { ok: false; error: string };

/** Shape of the Cloudinary unsigned upload API response. */
interface CloudinaryApiResponse {
  secure_url?: string;
  public_id?: string;
  error?: { message?: string };
}

/**
 * Upload an image directly from the browser using a Cloudinary unsigned
 * upload preset. The preset must be configured in the Cloudinary dashboard
 * (Settings → Upload → Upload presets) with signing mode "unsigned" and the
 * folder restriction set (e.g. `porashongi/profiles`).
 */
export async function uploadProfileImage(
  file: File,
): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured()) {
    return {
      ok: false,
      error:
        "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.",
    };
  }

  const cloudName = getCloudinaryCloudName();
  const uploadPreset = getCloudinaryUploadPreset();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "porashongi/profiles");

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData },
    );
    const json = (await response.json()) as CloudinaryApiResponse;

    if (!response.ok || !json.secure_url) {
      return {
        ok: false,
        error: json.error?.message ?? "Image upload failed. Please try again.",
      };
    }

    return { ok: true, url: json.secure_url, publicId: json.public_id ?? "" };
  } catch {
    return {
      ok: false,
      error: "Could not reach Cloudinary. Check your connection and try again.",
    };
  }
}

/**
 * Build an optimized (auto-format, auto-quality, face-cropped, resized)
 * delivery URL from a raw Cloudinary `secure_url`.
 */
export function buildOptimizedImageUrl(
  url: string,
  options?: { width?: number; height?: number },
): string {
  const width = options?.width ?? 256;
  const height = options?.height ?? 256;
  const transforms = `w_${width},h_${height},c_fill,g_face,f_auto,q_auto`;
  return url.replace("/upload/", `/upload/${transforms}/`);
}
