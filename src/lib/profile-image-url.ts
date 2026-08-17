export const PROFILE_IMAGE_URL_MAX_LENGTH = 1000;

export type ProfileImageProvider = "google-drive" | "dropbox" | "external";

export type ProfileImageUrlResult =
  | { ok: true; url: string; provider: ProfileImageProvider }
  | { ok: false; error: string };

const DRIVE_FILE_ID = /^[a-zA-Z0-9_-]{10,160}$/;

/**
 * Convert supported public sharing links into browser-renderable image URLs.
 * PoraSathi stores only the resulting text URL; it never downloads or stores
 * the image itself.
 */
export function normalizeProfileImageUrl(input: string): ProfileImageUrlResult {
  const value = input.trim();
  if (!value) return { ok: false, error: "ছবির লিংক দিন।" };
  if (value.length > PROFILE_IMAGE_URL_MAX_LENGTH) {
    return { ok: false, error: `লিংক সর্বোচ্চ ${PROFILE_IMAGE_URL_MAX_LENGTH} অক্ষরের হতে পারে।` };
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { ok: false, error: "সঠিক ছবির লিংক দিন।" };
  }

  if (url.protocol !== "https:") {
    return { ok: false, error: "নিরাপত্তার জন্য শুধু HTTPS লিংক ব্যবহার করুন।" };
  }
  if (url.username || url.password) {
    return { ok: false, error: "Username বা password-সহ লিংক ব্যবহার করা যাবে না।" };
  }
  if (isPrivateHostname(url.hostname)) {
    return { ok: false, error: "Local বা private network-এর লিংক ব্যবহার করা যাবে না।" };
  }

  url.hash = "";
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");

  if (hostname === "drive.google.com") {
    const fileId = getGoogleDriveFileId(url);
    if (!fileId) {
      return {
        ok: false,
        error: "Google Drive লিংকটি সঠিক নয়। File share link ব্যবহার করুন।",
      };
    }
    return {
      ok: true,
      url: `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1000`,
      provider: "google-drive",
    };
  }

  if (hostname === "dropbox.com" || hostname.endsWith(".dropbox.com")) {
    url.searchParams.delete("dl");
    url.searchParams.set("raw", "1");
    return finalizeUrl(url, "dropbox");
  }

  return finalizeUrl(url, "external");
}

function finalizeUrl(url: URL, provider: ProfileImageProvider): ProfileImageUrlResult {
  const normalized = url.toString();
  if (normalized.length > PROFILE_IMAGE_URL_MAX_LENGTH) {
    return { ok: false, error: `লিংক সর্বোচ্চ ${PROFILE_IMAGE_URL_MAX_LENGTH} অক্ষরের হতে পারে।` };
  }
  return { ok: true, url: normalized, provider };
}

function getGoogleDriveFileId(url: URL): string | null {
  const pathMatch = url.pathname.match(/\/file\/d\/([^/]+)/i);
  const candidate = pathMatch?.[1] ?? url.searchParams.get("id") ?? "";
  return DRIVE_FILE_ID.test(candidate) ? candidate : null;
}

function isPrivateHostname(rawHostname: string): boolean {
  const hostname = rawHostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (
    hostname === "localhost"
    || hostname.endsWith(".localhost")
    || hostname.endsWith(".local")
    || hostname.endsWith(".internal")
    || hostname.endsWith(".lan")
    || !hostname.includes(".")
  ) {
    return true;
  }

  if (hostname.includes(":")) {
    const mappedIpv4 = hostname.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
    if (mappedIpv4) return isPrivateHostname(mappedIpv4);
    return hostname === "::"
      || hostname === "::1"
      || hostname.startsWith("fc")
      || hostname.startsWith("fd")
      || /^fe[89ab]/.test(hostname);
  }

  const octets = hostname.split(".");
  if (octets.length !== 4 || !octets.every((part) => /^\d{1,3}$/.test(part))) return false;
  const numbers = octets.map(Number);
  if (numbers.some((part) => part < 0 || part > 255)) return true;

  const [a, b] = numbers;
  return a === 0
    || a === 10
    || a === 127
    || (a === 100 && b >= 64 && b <= 127)
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168)
    || a >= 224;
}
