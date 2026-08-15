"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/server-auth";
import { failure, success, type ActionResult } from "@/features/types";

export async function startConversation(
  otherId: string,
  tuitionId?: string | null,
): Promise<ActionResult<{ conversationId: string }>> {
  const profile = await requireProfile();
  if (otherId === profile.id) return failure("নিজেকে মেসেজ করা যাবে না।");

  const a = profile.id < otherId ? profile.id : otherId;
  const b = profile.id < otherId ? otherId : profile.id;

  const supabase = await createClient();
  const { data: blocked } = await supabase
    .from("blocks")
    .select("id")
    .or(`and(blocker_id.eq.${profile.id},blocked_id.eq.${otherId}),and(blocker_id.eq.${otherId},blocked_id.eq.${profile.id})`)
    .limit(1);
  if ((blocked?.length ?? 0) > 0) return failure("এই ব্যবহারকারীকে মেসেজ করা যাবে না।");

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("participant_a", a)
    .eq("participant_b", b)
    .maybeSingle();

  if (existing) return success({ conversationId: existing.id });

  const { data, error } = await supabase
    .from("conversations")
    .insert({ participant_a: a, participant_b: b, tuition_id: tuitionId ?? null })
    .select("id")
    .single();

  if (error) return failure(error.message);
  revalidatePath("/messages");
  return success({ conversationId: data.id });
}

export async function sendMessage(
  conversationId: string,
  body: string,
): Promise<ActionResult> {
  const profile = await requireProfile();
  const trimmed = body.trim();
  if (!trimmed || trimmed.length > 2000) return failure("বার্তা ১–২০০০ অক্ষরের মধ্যে হতে হবে।");

  const supabase = await createClient();
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: profile.id,
    body: trimmed,
  });

  if (error) return failure(error.message);
  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
  return success();
}

export async function markConversationRead(conversationId: string): Promise<ActionResult> {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("messages")
    .update({ status: "read" })
    .eq("conversation_id", conversationId)
    .neq("sender_id", profile.id)
    .eq("status", "sent");
  if (error) return failure(error.message);
  revalidatePath("/messages");
  return success();
}
