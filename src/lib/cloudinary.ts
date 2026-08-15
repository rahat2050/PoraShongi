import {
  getCloudinaryCloudName,
  getCloudinaryUploadPreset,
  isCloudinaryConfigured,
} from "@/lib/env";

export type CloudinaryUploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/** Browser থেকে সরাসরি Cloudinary-তে ছবি upload (unsigned preset)। */
export async function uploadProfileImage(file: File): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured()) {
    return { ok: false, error: "Cloudinary configure করা হয়নি।" };
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", getCloudinaryUploadPreset());
  formData.append("folder", "porasathi/profiles");

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${getCloudinaryCloudName()}/image/upload`,
      { method: "POST", body: formData },
    );
    const json = (await res.json()) as { secure_url?: string; error?: { message?: string } };
    if (!res.ok || !json.secure_url) {
      return { ok: false, error: json.error?.message ?? "ছবি upload হয়নি।" };
    }
    return { ok: true, url: json.secure_url };
  } catch {
    return { ok: false, error: "Cloudinary-তে পৌঁছানো যায়নি।" };
  }
}

/** Optimized delivery URL — auto-format, auto-quality, resized (data বাঁচায়)। */
export function buildOptimizedImageUrl(
  url: string,
  options?: { width?: number; height?: number },
): string {
  const width = options?.width ?? 256;
  const height = options?.height ?? 256;
  const transforms = `w_${width},h_${height},c_fill,g_face,f_auto,q_auto`;
  return url.replace("/upload/", `/upload/${transforms}/`);
}
