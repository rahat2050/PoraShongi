import "server-only";
import { getDb, ok, fail, type DataResult } from "@/lib/data/client";
import { getProfilesPublic, type ProfilePublic } from "@/lib/data/profiles";
import { type Conversation, type Message } from "@/types/index";

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

  const [profiles, lastMessages, unreadCounts] = await Promise.all([
    getProfilesPublic(otherIds),
    getLastMessages(conversationIds),
    getUnreadCounts(userId, conversationIds),
  ]);

  const profileMap = new Map((profiles.data ?? []).map((p) => [p.id, p]));
  const lastMap = new Map((lastMessages.data ?? []).map((m) => [m.conversation_id, m]));
  const unreadMap = new Map((unreadCounts.data ?? []).map((u) => [u.conversation_id, u.count]));

  return ok(
    conversations.map((conversation) => {
      const otherId =
        conversation.participant_a === userId
          ? conversation.participant_b
          : conversation.participant_a;
      return {
        conversation,
        other: profileMap.get(otherId) ?? null,
        unread: unreadMap.get(conversation.id) ?? 0,
        lastMessage: lastMap.get(conversation.id) ?? null,
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

async function getLastMessages(
  conversationIds: string[],
): Promise<DataResult<Message[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  if (conversationIds.length === 0) return ok([]);

  const { data, error } = await db
    .from("messages")
    .select("*")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false });
  if (error) return fail(error.message);

  // Keep only the most recent message per conversation.
  const seen = new Set<string>();
  const latest: Message[] = [];
  for (const m of (data ?? []) as Message[]) {
    if (!seen.has(m.conversation_id)) {
      seen.add(m.conversation_id);
      latest.push(m);
    }
  }
  return ok(latest);
}

async function getUnreadCounts(
  userId: string,
  conversationIds: string[],
): Promise<DataResult<{ conversation_id: string; count: number }[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  if (conversationIds.length === 0) return ok([]);

  const { data, error } = await db
    .from("messages")
    .select("conversation_id")
    .in("conversation_id", conversationIds)
    .neq("sender_id", userId)
    .eq("status", "sent");
  if (error) return fail(error.message);

  const counts = new Map<string, number>();
  for (const m of (data ?? []) as { conversation_id: string }[]) {
    counts.set(m.conversation_id, (counts.get(m.conversation_id) ?? 0) + 1);
  }
  return ok(
    Array.from(counts.entries()).map(([conversation_id, count]) => ({
      conversation_id,
      count,
    })),
  );
}

export async function totalUnreadMessages(
  userId: string,
): Promise<DataResult<number>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const { data: convs } = await db
    .from("conversations")
    .select("id")
    .or(`participant_a.eq.${userId},participant_b.eq.${userId}`);

  const ids = (convs ?? []).map((c) => c.id as string);
  if (ids.length === 0) return ok(0);

  const { count, error } = await db
    .from("messages")
    .select("id", { count: "exact", head: true })
    .in("conversation_id", ids)
    .neq("sender_id", userId)
    .eq("status", "sent");
  if (error) return fail(error.message);
  return ok(count ?? 0);
}
