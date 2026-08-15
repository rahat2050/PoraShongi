import "server-only";
import { getDb, ok, fail, type DataResult } from "@/lib/data/client";
import { getProfilesPublic } from "@/lib/data/profiles-public";
import { type Conversation, type Message, type ProfilePublic } from "@/types/index";

export type ConversationDisplay = {
  conversation: Conversation;
  other: ProfilePublic | null;
  unread: number;
  lastMessage: Message | null;
};

export async function listConversations(
  userId: string,
): Promise<DataResult<ConversationDisplay[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const { data, error } = await db
    .from("conversations")
    .select("*")
    .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (error) return fail(error.message);
  const conversations = (data ?? []) as Conversation[];
  if (conversations.length === 0) return ok([]);

  const otherIds = conversations.map((c) =>
    c.participant_a === userId ? c.participant_b : c.participant_a,
  );
  const conversationIds = conversations.map((c) => c.id);

  const [profiles, messagesRes] = await Promise.all([
    getProfilesPublic(otherIds),
    db.from("messages").select("*").in("conversation_id", conversationIds).order("created_at", { ascending: false }),
  ]);

  const profileMap = new Map((profiles.data ?? []).map((p) => [p.id, p]));

  // latest message + unread per conversation
  const latestMap = new Map<string, Message>();
  const unreadMap = new Map<string, number>();
  for (const m of (messagesRes.data ?? []) as Message[]) {
    if (!latestMap.has(m.conversation_id)) latestMap.set(m.conversation_id, m);
    if (m.sender_id !== userId && m.status === "sent") {
      unreadMap.set(m.conversation_id, (unreadMap.get(m.conversation_id) ?? 0) + 1);
    }
  }

  return ok(
    conversations.map((conversation) => {
      const otherId =
        conversation.participant_a === userId ? conversation.participant_b : conversation.participant_a;
      return {
        conversation,
        other: profileMap.get(otherId) ?? null,
        unread: unreadMap.get(conversation.id) ?? 0,
        lastMessage: latestMap.get(conversation.id) ?? null,
      };
    }),
  );
}

export async function getConversation(
  conversationId: string,
  userId: string,
): Promise<DataResult<Conversation | null>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const { data, error } = await db
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
    .maybeSingle();
  if (error) return fail(error.message);
  return ok((data as Conversation | null) ?? null);
}

export async function listMessages(
  conversationId: string,
  limit = 100,
): Promise<DataResult<Message[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const { data, error } = await db
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return fail(error.message);
  return ok(((data ?? []) as Message[]).reverse());
}
