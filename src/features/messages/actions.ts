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
  if (otherId === profile.id) return failure("You cannot message yourself.");

  const a = profile.id < otherId ? profile.id : otherId;
  const b = profile.id < otherId ? otherId : profile.id;

  const supabase = await createClient();

  const { data: blocked } = await supabase
    .from("blocks")
    .select("id")
    .or(
      `and(blocker_id.eq.${profile.id},blocked_id.eq.${otherId}),and(blocker_id.eq.${otherId},blocked_id.eq.${profile.id})`,
    )
    .limit(1);
  if ((blocked?.length ?? 0) > 0) {
    return failure("You cannot message this user.");
  }

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("participant_a", a)
    .eq("participant_b", b)
    .maybeSingle();

  if (existing) {
    return success({ conversationId: existing.id });
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      participant_a: a,
      participant_b: b,
      tuition_id: tuitionId ?? null,
    })
    .select("id")
    .single();

  if (error) return failure(error.message);

  revalidatePath("/messages");
  return success({ conversationId: data.id });
}

export async function sendMessage(
  conversationId: string,
  body: string,
): Promise<ActionResult<{ id: string }>> {
  const profile = await requireProfile();
  const trimmed = body.trim();
  if (!trimmed || trimmed.length > 2000) {
    return failure("Message must be between 1 and 2000 characters.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: profile.id,
      body: trimmed,
    })
    .select("id")
    .single();

  if (error) return failure(error.message);

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
  return success({ id: data.id });
}

export async function markConversationRead(
  conversationId: string,
): Promise<ActionResult> {
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
