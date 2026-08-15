import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { getConversation, listMessages } from "@/lib/data/messages";
import { getProfilesPublic } from "@/lib/data/profiles-public";
import { isBlocked } from "@/lib/data/reviews";
import { ChatPanel } from "@/features/messages/chat-panel";
import { BlockButton } from "@/components/shared/block-button";
import { ReportButton } from "@/components/shared/report-dialog";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = { title: "কথোপকথন" };
export const dynamic = "force-dynamic";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const convResult = await getConversation(id, profile.id);
  const conversation = convResult.data ?? null;
  if (!conversation) notFound();

  const otherId = conversation.participant_a === profile.id ? conversation.participant_b : conversation.participant_a;

  const [messagesResult, otherResult, blockedResult] = await Promise.all([
    listMessages(conversation.id),
    getProfilesPublic([otherId]),
    isBlocked(profile.id, otherId),
  ]);

  const other = otherResult.data?.[0] ?? null;
  const otherName = other?.display_name || other?.full_name || "সদস্য";
  const blocked = blockedResult.data ?? false;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/messages" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        সব কথোপকথন
      </Link>

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <div className="flex items-center gap-3">
              <Avatar src={other?.avatar_url ?? null} name={otherName} size="md" />
              <div>
                <p className="text-sm font-semibold text-slate-800">{otherName}</p>
                <p className="text-xs capitalize text-slate-400">{other?.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <BlockButton otherId={otherId} initiallyBlocked={blocked} />
              <ReportButton targetType="conversation" targetId={conversation.id} label="" />
            </div>
          </div>

          <div className="p-4">
            {blocked ? (
              <Alert variant="warning" title="এই ব্যবহারকারী ব্লক করা">আনব্লক করলে আবার মেসেজ করতে পারবেন।</Alert>
            ) : (
              <ChatPanel
                conversationId={conversation.id}
                currentUserId={profile.id}
                otherName={otherName}
                otherAvatar={other?.avatar_url ?? null}
                initialMessages={messagesResult.data ?? []}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
