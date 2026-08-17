"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock3, Send, Wifi, WifiOff } from "lucide-react";
import { markConversationRead, sendMessage } from "@/features/messages/actions";
import { createClient } from "@/lib/supabase/client";
import { isMessageWithinRetention, MESSAGE_RETENTION_HOURS, MESSAGE_RETENTION_MS } from "@/lib/message-retention";
import { type Message } from "@/types/index";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/utils";

export function ChatPanel({
  conversationId,
  currentUserId,
  otherName,
  otherAvatar,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  otherName: string;
  otherAvatar: string | null;
  initialMessages: Message[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.filter((message) => isMessageWithinRetention(message.created_at)),
  );
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [connection, setConnection] = useState<"connecting" | "live" | "offline">("connecting");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    void markConversationRead(conversationId);

    const syncMessages = async () => {
      if (document.visibilityState !== "visible") return;
      const retentionCutoff = new Date(Date.now() - MESSAGE_RETENTION_MS).toISOString();
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .gte("created_at", retentionCutoff)
        .order("created_at", { ascending: false })
        .limit(100);
      if (!active || error) return;
      setMessages(
        ((data ?? []) as Message[])
          .filter((message) => isMessageWithinRetention(message.created_at))
          .reverse(),
      );
      void markConversationRead(conversationId);
    };

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const incoming = payload.new as Message;
          if (!isMessageWithinRetention(incoming.created_at)) return;
          setMessages((current) => {
            if (current.some((message) => message.id === incoming.id)) return current;
            return [...current, incoming].sort((a, b) => a.created_at.localeCompare(b.created_at));
          });
          if (incoming.sender_id !== currentUserId) void markConversationRead(conversationId);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const updated = payload.new as Message;
          setMessages((current) => current.map((message) => message.id === updated.id ? updated : message));
        },
      )
      .subscribe((status) => {
        if (!active) return;
        if (status === "SUBSCRIBED") setConnection("live");
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          setConnection("offline");
        }
      });

    const fallbackTimer = window.setInterval(() => void syncMessages(), 60_000);
    const retentionTimer = window.setInterval(() => {
      setMessages((current) => current.filter((message) => isMessageWithinRetention(message.created_at)));
    }, 60_000);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") void syncMessages();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      active = false;
      window.clearInterval(fallbackTimer);
      window.clearInterval(retentionTimer);
      document.removeEventListener("visibilitychange", handleVisibility);
      void supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages.length]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = body.trim();
    if (!text || pending) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: currentUserId,
      body: text,
      status: "sent",
      created_at: new Date().toISOString(),
    };

    setPending(true);
    setBody("");
    setMessages((current) => [...current, optimisticMessage]);
    const result = await sendMessage(conversationId, text);
    setPending(false);

    if (result.ok) {
      setMessages((current) => {
        const withoutTemporary = current.filter((message) => message.id !== tempId);
        if (withoutTemporary.some((message) => message.id === result.data.id)) return withoutTemporary;
        return [...withoutTemporary, result.data].sort((a, b) => a.created_at.localeCompare(b.created_at));
      });
      return;
    }

    setMessages((current) => current.filter((message) => message.id !== tempId));
    setBody((current) => current || text);
    toast(result.error, "danger");
  }

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-4 w-4" aria-hidden /> বার্তা {new Intl.NumberFormat("bn-BD").format(MESSAGE_RETENTION_HOURS)} ঘণ্টা পর স্বয়ংক্রিয়ভাবে মুছে যায়
        </span>
        <span className={`inline-flex items-center gap-1.5 font-bold ${connection === "live" ? "text-emerald-700 dark:text-emerald-300" : "text-slate-600 dark:text-slate-300"}`} aria-live="polite">
          {connection === "live" ? <Wifi className="h-3.5 w-3.5" aria-hidden /> : <WifiOff className="h-3.5 w-3.5" aria-hidden />}
          {connection === "live" ? "লাইভ" : connection === "connecting" ? "সংযোগ হচ্ছে" : "পুনরায় সংযোগ হবে"}
        </span>
      </div>

      <div className="max-h-[60vh] flex-1 space-y-3 overflow-y-auto pr-1 scroll-smooth" role="log" aria-live="polite" aria-label="কথোপকথনের বার্তা">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">কোনো বার্তা নেই — কথা শুরু করুন।</p>
        )}
        {messages.map((message) => {
          const mine = message.sender_id === currentUserId;
          const temporary = message.id.startsWith("temp-");
          return (
            <div key={message.id} className={`flex animate-message-in ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[85%] items-end gap-2 sm:max-w-[80%] ${mine ? "flex-row-reverse" : ""}`}>
                {!mine && <Avatar src={otherAvatar} name={otherName} size="sm" />}
                <div className={`rounded-2xl px-3.5 py-2 text-sm shadow-sm ${mine ? "rounded-br-sm bg-brand-600 text-white" : "rounded-bl-sm bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100"}`}>
                  <p className="whitespace-pre-line break-words">{message.body}</p>
                  <p className={`mt-1 text-[10px] ${mine ? "text-brand-100" : "text-slate-500 dark:text-slate-300"}`}>
                    {formatDateTime(message.created_at)}
                    {temporary ? " · পাঠানো হচ্ছে" : mine && message.status === "read" ? " · দেখা হয়েছে" : ""}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-700">
        <input
          id="chat-message"
          name="message"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="বার্তা লিখুন…"
          aria-label="বার্তা"
          autoComplete="off"
          maxLength={2000}
          className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 transition-shadow placeholder:text-slate-500 focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={pending || !body.trim()}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm transition-all hover:bg-brand-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="পাঠান"
        >
          <Send className={`h-4 w-4 ${pending ? "animate-pulse" : ""}`} aria-hidden />
        </button>
      </form>
    </div>
  );
}
