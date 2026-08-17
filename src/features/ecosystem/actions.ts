"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/server-auth";
import { failure, success, type ActionResult } from "@/features/types";
import { isUuid } from "@/lib/utils";

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
