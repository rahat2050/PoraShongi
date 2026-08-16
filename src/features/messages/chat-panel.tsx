"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { markConversationRead, sendMessage } from "@/features/messages/actions";
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
  const router = useRouter();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void markConversationRead(conversationId);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 20_000);
    return () => window.clearInterval(timer);
  }, [conversationId, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages.length]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = body.trim();
    if (!text || pending) return;
    setPending(true);
    const result = await sendMessage(conversationId, text);
    setPending(false);
    if (result.ok) {
      setMessages((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          conversation_id: conversationId,
          sender_id: currentUserId,
          body: text,
          status: "sent",
          created_at: new Date().toISOString(),
        },
      ]);
      setBody("");
      router.refresh();
      return;
    }
    toast(result.error, "danger");
  }

  return (
    <div className="flex flex-col">
      <div className="max-h-[60vh] flex-1 space-y-3 overflow-y-auto pr-1" role="log" aria-live="polite" aria-label="কথোপকথনের বার্তা">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">কোনো বার্তা নেই — শুরু করুন!</p>
        )}
        {messages.map((message) => {
          const mine = message.sender_id === currentUserId;
          return (
            <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[80%] items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                {!mine && <Avatar src={otherAvatar} name={otherName} size="sm" />}
                <div className={`rounded-2xl px-3.5 py-2 text-sm ${mine ? "rounded-br-sm bg-brand-600 text-white" : "rounded-bl-sm bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100"}`}>
                  <p className="whitespace-pre-line">{message.body}</p>
                  <p className={`mt-1 text-[10px] ${mine ? "text-brand-100" : "text-slate-500 dark:text-slate-300"}`}>
                    {formatDateTime(message.created_at)}
                    {mine && message.status === "read" ? " · দেখা হয়েছে" : ""}
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
          onChange={(e) => setBody(e.target.value)}
          placeholder="বার্তা লিখুন…"
          aria-label="বার্তা"
          autoComplete="off"
          maxLength={2000}
          className="h-11 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-500 focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={pending || !body.trim()}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
          aria-label="পাঠান"
        >
          <Send className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </div>
  );
}
