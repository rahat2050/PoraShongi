"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/server-auth";
import { failure, success, type ActionResult } from "@/features/types";
import { isUuid } from "@/lib/utils";
import { normalizeResourceUrl } from "@/lib/resource-url";
import { CLASS_LEVELS, SUBJECTS } from "@/config/options";

export async function createEducationResource(input: {
  title: string; description?: string; resourceUrl: string; subject?: string; classLevel?: string; price?: number | null;
}): Promise<ActionResult<{ id: string }>> {
  const profile = await requireProfile();
  if (profile.role !== "teacher" && profile.role !== "admin" && !profile.is_super_admin) return failure("শুধু শিক্ষক বা অ্যাডমিন resource যোগ করতে পারবেন।");
  const title = input.title.trim();
  const description = input.description?.trim() || null;
  const link = normalizeResourceUrl(input.resourceUrl);
  if (title.length < 2 || title.length > 140) return failure("টাইটেল ২–১৪০ অক্ষরের মধ্যে দিন।");
  if (description && description.length > 1000) return failure("বর্ণনা সর্বোচ্চ ১০০০ অক্ষরের হতে পারে।");
  if (!link.ok) return failure(link.error);
  if (input.subject && !SUBJECTS.some((value) => value === input.subject)) return failure("সঠিক বিষয় বাছুন।");
  if (input.classLevel && !CLASS_LEVELS.some((value) => value === input.classLevel)) return failure("সঠিক ক্লাস বাছুন।");
  const price = input.price ?? 0;
  if (!Number.isFinite(price) || price < 0 || price > 10_000_000) return failure("সঠিক মূল্য দিন।");
  const supabase = await createClient();
  const { count } = await supabase.from("education_resources").select("id", { count: "exact", head: true }).eq("uploader_id", profile.id);
  if ((count ?? 0) >= 50) return failure("সর্বোচ্চ ৫০টি resource যোগ করা যায়।");
  const { data, error } = await supabase.from("education_resources").insert({ uploader_id: profile.id, title, description, resource_url: link.url, subject: input.subject || null, class_level: input.classLevel || null, price }).select("id").single();
  if (error) {
    if (error.code === "23505") return failure("এই resource link আগেই যোগ করা হয়েছে।");
    return failure(error.message);
  }
  revalidatePath("/resources");
  return success({ id: data.id });
}

export async function createCoachingCenter(input: {
  name: string;
  description?: string;
  district?: string;
  area?: string;
  contact?: string;
}): Promise<ActionResult<{ id: string }>> {
  const profile = await requireProfile();
  if (profile.role !== "teacher" && profile.role !== "admin") {
    return failure("শুধু শিক্ষক বা অ্যাডমিন coaching center তৈরি করতে পারবেন।");
  }

  const name = input.name.trim();
  if (name.length < 2 || name.length > 120) return failure("নাম ২–১২০ অক্ষরের মধ্যে দিন।");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coaching_centers")
    .insert({
      owner_id: profile.id,
      name,
      description: input.description?.trim() || null,
      district: input.district || null,
      area: input.area || null,
      contact: input.contact?.trim() || null,
    })
    .select("id")
    .single();

  if (error) return failure(error.message);
  revalidatePath("/coaching");
  return success({ id: data.id });
}

export async function addCourse(
  centerId: string,
  input: { title: string; description?: string; price?: number | null },
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!isUuid(centerId)) {
    return failure("কোচিং সেন্টারের পরিচয় সঠিক নয়।");
  }
  const supabase = await createClient();

  const { data: center } = await supabase
    .from("coaching_centers")
    .select("owner_id")
    .eq("id", centerId)
    .maybeSingle();

  if (!center || center.owner_id !== profile.id) {
    return failure("শুধু নিজের coaching center-এ কোর্স যোগ করতে পারবেন।");
  }

  const title = input.title.trim();
  const description = input.description?.trim() || null;
  const price = input.price ?? null;
  if (title.length < 2 || title.length > 120) return failure("কোর্সের নাম ২–১২০ অক্ষরের মধ্যে দিন।");
  if (description && description.length > 1000) return failure("কোর্সের বর্ণনা সর্বোচ্চ ১০০০ অক্ষরের হতে পারে।");
  if (price !== null && (!Number.isFinite(price) || price < 0 || price > 10_000_000)) {
    return failure("কোর্সের ফি সঠিক নয়।");
  }

  const { error } = await supabase.from("coaching_courses").insert({
    center_id: centerId,
    title,
    description,
    price,
  });
  if (error) return failure(error.message);
  revalidatePath(`/coaching/${centerId}`);
  return success();
}
