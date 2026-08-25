"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/server-auth";
import { gigSchema, type GigValues } from "@/validation/gig";
import { failure, success, type ActionResult } from "@/features/types";
import type { GigStatus } from "@/types/index";

export type GigFormInput = {
  title: string;
  description: string;
  subjects: string[];
  classLevels: string[];
  teachingMode: string;
  durationWeeks: string | number;
  sessionsPerWeek: string | number;
  price: string | number;
  includesTrial?: boolean;
  publish?: boolean;
};

type OwnedGig = {
  profile: { id: string };
  gig: { id: string; teacher_id: string; status: string };
  supabase: Awaited<ReturnType<typeof createClient>>;
};

/**
 * gig-এর মালিক কিনা যাচাই — RLS ছাড়াও অ্যাপ্লিকেশন স্তরে দ্বিতীয় বাধা।
 * অন্যের gig হলে 404-এর মতোই "পাওয়া যায়নি" বলা হয়, যাতে অস্তিত্ব ফাঁস না হয়।
 */
async function requireOwnGig(gigId: string): Promise<ActionResult<OwnedGig>> {
  const profile = await requireProfile();
  if (profile.role !== "teacher") return failure("শুধু শিক্ষক প্যাকেজ তৈরি করতে পারবেন।");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tutor_gigs")
    .select("id,teacher_id,status")
    .eq("id", gigId)
    .maybeSingle();

  if (error) return failure(error.message);
  if (!data) return failure("প্যাকেজটি পাওয়া যায়নি।");
  if (data.teacher_id !== profile.id) return failure("প্যাকেজটি পাওয়া যায়নি।");
  return success({ profile: { id: profile.id }, gig: data, supabase });
}

function rowFrom(values: GigValues) {
  return {
    title: values.title,
    description: values.description,
    subjects: values.subjects,
    class_levels: values.classLevels,
    teaching_mode: values.teachingMode,
    duration_weeks: values.durationWeeks,
    sessions_per_week: values.sessionsPerWeek,
    price: values.price,
    includes_trial: values.includesTrial ?? false,
    status: (values.publish ? "published" : "draft") satisfies GigStatus,
  };
}

function parseGig(input: GigFormInput): ActionResult<GigValues> {
  const parsed = gigSchema.safeParse(input);
  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "তথ্যগুলো পরীক্ষা করুন।");
  }
  return success(parsed.data);
}

export async function createGig(
  input: GigFormInput,
): Promise<ActionResult<{ id: string }>> {
  const profile = await requireProfile();
  if (profile.role !== "teacher") {
    return failure("শুধু শিক্ষক প্যাকেজ তৈরি করতে পারবেন।");
  }

  const parsed = parseGig(input);
  if (!parsed.ok) return failure(parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tutor_gigs")
    .insert({ teacher_id: profile.id, ...rowFrom(parsed.data) })
    .select("id")
    .single();

  if (error) return failure(error.message);

  revalidatePath("/dashboard/gigs");
  revalidatePath("/gigs");
  return success({ id: data.id });
}

export async function updateGig(
  gigId: string,
  input: GigFormInput,
): Promise<ActionResult> {
  const owned = await requireOwnGig(gigId);
  if (!owned.ok) return failure(owned.error);

  const parsed = parseGig(input);
  if (!parsed.ok) return failure(parsed.error);

  // already-flagged gig নিজে থেকে আবার publish করতে পারবে না — মডারেশনের সিদ্ধান্ত।
  const { error } = await owned.data.supabase
    .from("tutor_gigs")
    .update({ ...rowFrom(parsed.data), updated_at: new Date().toISOString() })
    .eq("id", gigId)
    .eq("teacher_id", owned.data.profile.id)
    .eq("is_flagged", false);

  if (error) return failure(error.message);

  revalidatePath("/dashboard/gigs");
  revalidatePath(`/dashboard/gigs/${gigId}`);
  revalidatePath(`/gigs/${gigId}`);
  revalidatePath("/gigs");
  return success();
}

/**
 * প্রকাশ/অপ্রকাশ টগল। `removed` ও `is_flagged` শিক্ষক বদলাতে পারে না —
 * সেগুলো শুধু admin-এর এখতিয়ার।
 */
export async function setGigStatus(
  gigId: string,
  next: "published" | "draft" | "hidden",
): Promise<ActionResult> {
  const owned = await requireOwnGig(gigId);
  if (!owned.ok) return failure(owned.error);

  const { error } = await owned.data.supabase
    .from("tutor_gigs")
    .update({ status: next, updated_at: new Date().toISOString() })
    .eq("id", gigId)
    .eq("teacher_id", owned.data.profile.id)
    .eq("is_flagged", false);

  if (error) return failure(error.message);

  revalidatePath("/dashboard/gigs");
  revalidatePath(`/gigs/${gigId}`);
  revalidatePath("/gigs");
  return success();
}

export async function deleteGig(gigId: string): Promise<ActionResult> {
  const owned = await requireOwnGig(gigId);
  if (!owned.ok) return failure(owned.error);

  const { error } = await owned.data.supabase
    .from("tutor_gigs")
    .delete()
    .eq("id", gigId)
    .eq("teacher_id", owned.data.profile.id);

  if (error) return failure(error.message);

  revalidatePath("/dashboard/gigs");
  revalidatePath("/gigs");
  return success();
}
