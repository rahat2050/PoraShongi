import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/server-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);
  if (!user || !profile) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const db = await createClient();
  const roleTable = profile.role === "teacher" ? "teacher_profiles" : profile.role === "guardian" ? "guardian_profiles" : "student_profiles";
  const [roleProfile, tuitions, requests, sessions, reviews, preferences, conversations] = await Promise.all([
    db.from(roleTable as "student_profiles").select("*").eq("id", profile.id).maybeSingle(),
    db.from("tuitions").select("*").or(`poster_id.eq.${profile.id},student_id.eq.${profile.id}`),
    db.from("tuition_requests").select("id,tuition_id,sender_id,teacher_id,student_id,status,created_at,updated_at,responded_at").or(`sender_id.eq.${profile.id},teacher_id.eq.${profile.id},student_id.eq.${profile.id}`),
    db.from("sessions").select("*").or(`teacher_id.eq.${profile.id},student_id.eq.${profile.id}`),
    db.from("reviews").select("id,teacher_id,reviewer_id,tuition_id,rating,body,verified,status,created_at,updated_at").or(`teacher_id.eq.${profile.id},reviewer_id.eq.${profile.id}`),
    db.from("notification_preferences").select("*").eq("user_id", profile.id).maybeSingle(),
    db.from("conversations").select("id,tuition_id,participant_a,participant_b,created_at,updated_at,last_message_at").or(`participant_a.eq.${profile.id},participant_b.eq.${profile.id}`),
  ]);
  const conversationIds = (conversations.data ?? []).map((row) => row.id);
  const messageMetadata = conversationIds.length ? await db.from("messages").select("id,conversation_id,sender_id,status,created_at").in("conversation_id", conversationIds) : { data: [], error: null };
  const errors = [roleProfile,tuitions,requests,sessions,reviews,preferences,conversations,messageMetadata].map(x=>x.error).filter(Boolean);
  if (errors.length) return NextResponse.json({ error: "Export could not be generated" }, { status: 500 });

  const payload = {
    exported_at: new Date().toISOString(),
    retention_note: "Message bodies are excluded. Message metadata is limited by the 48-hour retention policy.",
    account: { id: user.id, email: user.email ?? null, created_at: user.created_at },
    profile,
    role_profile: roleProfile.data,
    tuitions: tuitions.data ?? [], tuition_requests: requests.data ?? [], sessions: sessions.data ?? [],
    reviews: reviews.data ?? [], notification_preferences: preferences.data,
    conversations: conversations.data ?? [], message_metadata: messageMetadata.data ?? [],
  };
  const format = new URL(request.url).searchParams.get("format") === "csv" ? "csv" : "json";
  const stamp = new Date().toISOString().slice(0,10);
  if (format === "csv") {
    const rows = Object.entries(payload).map(([section, value]) => `"${section}","${JSON.stringify(value).replaceAll('"','""')}"`);
    return new Response(`section,data\n${rows.join("\n")}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="porasathi-export-${stamp}.csv"`, "Cache-Control": "private, no-store" } });
  }
  return new Response(JSON.stringify(payload, null, 2), { headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="porasathi-export-${stamp}.json"`, "Cache-Control": "private, no-store" } });
}
