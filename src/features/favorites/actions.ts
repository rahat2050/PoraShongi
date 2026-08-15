"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/server-auth";
import { failure, success, type ActionResult } from "@/features/types";

export async function toggleFavorite(
  teacherId: string,
): Promise<ActionResult<{ saved: boolean }>> {
  const profile = await requireProfile();
  if (profile.role !== "student" && profile.role !== "guardian") {
    return failure("শুধু শিক্ষার্থী/অভিভাবক শিক্ষক save করতে পারবেন।");
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", profile.id)
    .eq("teacher_id", teacherId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("favorites").delete().eq("id", existing.id);
    if (error) return failure(error.message);
    revalidatePath(`/teachers/${teacherId}`);
    revalidatePath("/dashboard/favorites");
    return success({ saved: false });
  }

  const { error } = await supabase.from("favorites").insert({
    user_id: profile.id,
    teacher_id: teacherId,
  });
  if (error) return failure(error.message);

  revalidatePath(`/teachers/${teacherId}`);
  revalidatePath("/dashboard/favorites");
  return success({ saved: true });
}
