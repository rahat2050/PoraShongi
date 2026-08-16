"use client";

import { useState } from "react";
import { updateNotificationPreferences } from "@/features/notifications/preferences-actions";
import { type NotificationPreferences } from "@/types/index";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const ITEMS: { key: keyof Omit<NotificationPreferences, "user_id" | "updated_at" | "email_notify">; label: string }[] = [
  { key: "new_match", label: "নতুন ম্যাচিং tuition/শিক্ষক" },
  { key: "new_request", label: "নতুন tuition request" },
  { key: "request_response", label: "request accept/reject" },
  { key: "new_message", label: "নতুন মেসেজ" },
  { key: "upcoming_class", label: "আসন্ন ক্লাস" },
  { key: "schedule_change", label: "সময় বদল / ক্লাস বাতিল" },
  { key: "review_received", label: "নতুন রিভিউ" },
  { key: "verification_update", label: "ভেরিফিকেশন আপডেট" },
];

export function PreferencesForm({ prefs }: { prefs: NotificationPreferences | null }) {
  const [state, setState] = useState({
    new_match: prefs?.new_match ?? true,
    new_request: prefs?.new_request ?? true,
    request_response: prefs?.request_response ?? true,
    new_message: prefs?.new_message ?? true,
    upcoming_class: prefs?.upcoming_class ?? true,
    schedule_change: prefs?.schedule_change ?? true,
    review_received: prefs?.review_received ?? true,
    verification_update: prefs?.verification_update ?? true,
  });
  const [emailNotify, setEmailNotify] = useState(prefs?.email_notify ?? false);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const result = await updateNotificationPreferences({ ...state, email_notify: emailNotify } as never);
    setPending(false);
    setSaved(result.ok);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {saved && <Alert variant="success">পছন্দ সেভ হয়েছে।</Alert>}
      {ITEMS.map((item) => (
        <label key={item.key} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3">
          <span className="text-sm text-slate-700">{item.label}</span>
          <input
            type="checkbox"
            checked={state[item.key]}
            onChange={(e) => setState((s) => ({ ...s, [item.key]: e.target.checked }))}
            className="h-4 w-4 accent-brand-600"
          />
        </label>
      ))}
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3">
        <span className="text-sm font-medium text-slate-700">📧 ইমেইলেও নোটিফিকেশন পাঠাও</span>
        <input
          type="checkbox"
          checked={emailNotify}
          onChange={(e) => setEmailNotify(e.target.checked)}
          className="h-4 w-4 accent-brand-600"
        />
      </label>
      <div className="pt-3">
        <Button type="submit" loading={pending}>সেভ করুন</Button>
      </div>
    </form>
  );
}
