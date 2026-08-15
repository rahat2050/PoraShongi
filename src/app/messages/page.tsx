import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { listConversations } from "@/lib/data/messages";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "মেসেজ" };
export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const result = await listConversations(profile.id);
  const conversations = result.data ?? [];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-6 w-6 text-brand-600" aria-hidden />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">মেসেজ</h1>
          <p className="mt-1 text-slate-500">শিক্ষক ও শিক্ষার্থী/অভিভাবকের সাথে কথোপকথন।</p>
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          {conversations.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={<MessageSquare className="h-6 w-6" aria-hidden />} title="কোনো কথোপকথন নেই" description="শিক্ষকের প্রোফাইল থেকে মেসেজ শুরু করুন।" />
            </div>
          ) : (
            conversations.map(({ conversation, other, unread, lastMessage }) => {
              const otherName = other?.display_name || other?.full_name || "সদস্য";
              return (
                <Link key={conversation.id} href={`/messages/${conversation.id}`} className="flex items-center gap-3 border-b border-slate-100 p-4 transition-colors last:border-0 hover:bg-slate-50">
                  <Avatar src={other?.avatar_url ?? null} name={otherName} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-semibold text-slate-800">{otherName}</p>
                      {lastMessage && <span className="text-xs text-slate-400">{formatDateTime(lastMessage.created_at)}</span>}
                    </div>
                    <p className="truncate text-sm text-slate-500">
                      {lastMessage ? (lastMessage.sender_id === profile.id ? `আপনি: ${lastMessage.body}` : lastMessage.body) : "কথা শুরু করুন"}
                    </p>
                  </div>
                  {unread > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-xs font-bold text-white">{unread}</span>
                  )}
                </Link>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
