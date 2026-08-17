export const BLOG_CATEGORIES = [
  "study_tips",
  "ssc",
  "hsc",
  "career",
  "scholarship",
  "teacher_tips",
  "news",
] as const;

export function createBlogSlug(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
    .replace(/-+$/g, "");
}
