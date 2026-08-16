/**
 * Only allow same-site relative destinations after authentication.
 * This prevents open redirects while preserving an intended app route.
 */
export function getSafeNextPath(value: string | null | undefined, fallback = "/dashboard"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }

  try {
    const parsed = new URL(value, "https://porasathi.invalid");
    if (parsed.origin !== "https://porasathi.invalid") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function getAuthErrorMessage(code: string | null | undefined): string | null {
  switch (code) {
    case "setup":
      return "লগইন সেবা এখনো কনফিগার করা হয়নি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।";
    case "auth":
      return "ভেরিফিকেশন বা রিসেট লিংকটি ভুল অথবা মেয়াদ শেষ হয়েছে। নতুন লিংক নিয়ে আবার চেষ্টা করুন।";
    default:
      return null;
  }
}
