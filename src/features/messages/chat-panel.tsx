"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { markConversationRead, sendMessage } from "@/features/messages/actions";
import { type Message } from "@/types/index";
import { Avatar } from "@/components/ui/avatar";
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
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void markConversationRead(conversationId);
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-3">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">কোনো বার্তা নেই — শুরু করুন!</p>
        )}
        {messages.map((message) => {
          const mine = message.sender_id === currentUserId;
          return (
            <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[80%] items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                {!mine && <Avatar src={otherAvatar} name={otherName} size="sm" />}
                <div className={`rounded-2xl px-3.5 py-2 text-sm ${mine ? "rounded-br-sm bg-brand-600 text-white" : "rounded-bl-sm bg-slate-100 text-slate-800"}`}>
                  <p className="whitespace-pre-line">{message.body}</p>
                  <p className={`mt-1 text-[10px] ${mine ? "text-brand-100" : "text-slate-400"}`}>
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

      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="লিখুন…"
          className="h-11 flex-1 rounded-lg border border-slate-300 px-3 text-sm focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
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
