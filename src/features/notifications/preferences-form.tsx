"use client";

import { useState } from "react";
import { updateNotificationPreferences } from "@/features/notifications/actions";
import { type NotificationPreferences } from "@/types/index";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const ITEMS: { key: keyof Omit<NotificationPreferences, "user_id" | "updated_at">; label: string }[] = [
  { key: "new_match", label: "New matching tuition / teacher" },
  { key: "new_request", label: "New tuition request" },
  { key: "request_response", label: "Request accepted / rejected" },
  { key: "new_message", label: "New messages" },
  { key: "upcoming_class", label: "Upcoming classes" },
  { key: "schedule_change", label: "Schedule changes & cancellations" },
  { key: "review_received", label: "New reviews" },
  { key: "verification_update", label: "Verification updates" },
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
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const result = await updateNotificationPreferences(state);
    setPending(false);
    setSaved(result.ok);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {saved && <Alert variant="success">Preferences saved.</Alert>}
      {ITEMS.map((item) => (
        <label
          key={item.key}
          className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3"
        >
          <span className="text-sm text-slate-700">{item.label}</span>
          <input
            type="checkbox"
            checked={state[item.key]}
            onChange={(e) => setState((s) => ({ ...s, [item.key]: e.target.checked }))}
            className="h-4 w-4 accent-brand-600"
          />
        </label>
      ))}
      <div className="pt-3">
        <Button type="submit" loading={pending}>
          Save preferences
        </Button>
      </div>
    </form>
  );
}
