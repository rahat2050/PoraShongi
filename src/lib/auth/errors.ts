type AuthLikeError = { message?: string; code?: string } | null | undefined;

/** Convert provider errors into safe, localized user-facing messages. */
export function getLocalizedAuthError(
  error: AuthLikeError,
  fallback = "কাজটি সম্পন্ন করা যায়নি। একটু পরে আবার চেষ্টা করুন।",
): string {
  const value = `${error?.code ?? ""} ${error?.message ?? ""}`.toLowerCase();

  if (value.includes("already registered") || value.includes("user_already_exists")) {
    return "এই ইমেইলে আগে থেকেই একটি অ্যাকাউন্ট আছে। লগইন করুন বা পাসওয়ার্ড রিসেট করুন।";
  }
  if (value.includes("invalid email") || value.includes("validate email")) {
    return "সঠিক ইমেইল ঠিকানা লিখুন।";
  }
  if (value.includes("weak_password") || value.includes("password should")) {
    return "আরও শক্তিশালী পাসওয়ার্ড দিন। কমপক্ষে ৮ অক্ষর, সংখ্যা ও অক্ষর ব্যবহার করুন।";
  }
  if (value.includes("rate limit") || value.includes("too many")) {
    return "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";
  }
  if (value.includes("network") || value.includes("fetch")) {
    return "নেটওয়ার্ক সমস্যা হয়েছে। সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।";
  }

  return fallback;
}
