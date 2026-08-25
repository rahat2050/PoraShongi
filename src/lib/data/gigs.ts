import "server-only";
import { asJson, getDb, getPublicDb, ok, fail, type DataResult } from "@/lib/data/client";
import type {
  SearchResponse,
  TutorGigDetail,
  TutorGigOwn,
  TutorGigPublic,
} from "@/types/index";

export interface GigSearchFilters {
  subject?: string;
  classLevel?: string;
  mode?: string;
  maxPrice?: number;
  district?: string;
  sort?: "newest" | "price_low" | "price_high" | "rating";
  page: number;
  pageSize: number;
}

/**
 * পাবলিক gig তালিকা। শুধু `status='published'` এবং প্রকাশযোগ্য শিক্ষকের gig আসে —
 * শর্তটি `public_gigs_search` RPC-র ভিতরে, ক্লায়েন্টে নয় (migration 0037)।
 */
export async function searchPublicGigs(
  filters: GigSearchFilters,
): Promise<DataResult<SearchResponse<TutorGigPublic>>> {
  const db = getPublicDb(120);
  if (!db) return fail("Supabase is not configured.");

  const { data, error } = await db.rpc("public_gigs_search", {
    p_subject: filters.subject || null,
    p_class: filters.classLevel || null,
    p_mode: filters.mode || null,
    p_max_price: filters.maxPrice ?? null,
    p_district: filters.district || null,
    p_sort: filters.sort || "newest",
    p_page: filters.page,
    p_page_size: filters.pageSize,
  });

  if (error) return fail(error.message);
  return ok(asJson<SearchResponse<TutorGigPublic>>(data));
}

/** একক পাবলিক gig — draft/hidden হলে RPC null দেয়। */
export async function getPublicGig(
  gigId: string,
): Promise<DataResult<TutorGigDetail | null>> {
  const db = getPublicDb(300);
  if (!db) return fail("Supabase is not configured.");

  const { data, error } = await db.rpc("get_public_gig", { p_gig_id: gigId });
  if (error) return fail(error.message);
  return ok(asJson<TutorGigDetail | null>(data));
}

/** লগইন করা শিক্ষকের নিজের gig তালিকা (খসড়া সহ) — list_my_gigs RPC। */
export async function listMyGigs(): Promise<DataResult<TutorGigOwn[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const { data, error } = await db.rpc("list_my_gigs");
  if (error) return fail(error.message);
  return ok(asJson<TutorGigOwn[]>(data));
}

/**
 * একক gig সম্পাদনার জন্য — মালিকানা যাচাই RLS দিয়ে হয়, তাই অন্যের gig হলে
 * কোনো সারি ফেরে না।
 */
export async function getOwnGig(gigId: string): Promise<DataResult<TutorGigOwn | null>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const { data, error } = await db
    .from("tutor_gigs")
    .select("*")
    .eq("id", gigId)
    .maybeSingle();

  if (error) return fail(error.message);
  return ok((data as TutorGigOwn | null) ?? null);
}
