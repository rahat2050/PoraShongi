export type ResourceUrlResult = { ok: true; url: string } | { ok: false; error: string };

export function normalizeResourceUrl(input: string): ResourceUrlResult {
  const value = input.trim();
  if (!value || value.length > 1000) return { ok: false, error: "Resource link সর্বোচ্চ ১০০০ অক্ষরের হতে পারে।" };
  let url: URL;
  try { url = new URL(value); } catch { return { ok: false, error: "সঠিক resource link দিন।" }; }
  if (url.protocol !== "https:") return { ok: false, error: "শুধু HTTPS resource link ব্যবহার করুন।" };
  if (url.username || url.password) return { ok: false, error: "Credential-সহ link ব্যবহার করা যাবে না।" };
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal") || !host.includes(".")) {
    return { ok: false, error: "Local/private link ব্যবহার করা যাবে না।" };
  }
  if (/^(127\.|10\.|192\.168\.|169\.254\.)/.test(host)) return { ok: false, error: "Local/private link ব্যবহার করা যাবে না।" };
  const match172 = host.match(/^172\.(\d+)\./);
  if (match172 && Number(match172[1]) >= 16 && Number(match172[1]) <= 31) return { ok: false, error: "Local/private link ব্যবহার করা যাবে না।" };
  url.hash = "";
  return { ok: true, url: url.toString() };
}
