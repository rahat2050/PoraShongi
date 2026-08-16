export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function success<T = undefined>(data?: T): ActionResult<T> {
  return { ok: true, data: data as T };
}

export function failure<T = undefined>(error: string): ActionResult<T> {
  const isLocalizedUserMessage = /[\u0980-\u09ff]/.test(error);
  if (isLocalizedUserMessage || process.env.NODE_ENV !== "production") {
    return { ok: false, error };
  }

  console.error("[PoraSathi action error]", error);
  return { ok: false, error: "কাজটি সম্পন্ন করা যায়নি। একটু পরে আবার চেষ্টা করুন।" };
}
