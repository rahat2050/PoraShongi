"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSession } from "@/features/schedule/actions";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";

export function SessionForm({ tuitions }: { tuitions: { id: string; title: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tuitionId, setTuitionId] = useState(tuitions[0]?.id ?? "");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!tuitionId || !scheduledAt) {
      setError("টিউশন এবং সময় বাছুন।");
      return;
    }
    setPending(true);
    const result = await createSession({ tuitionId, scheduledAt, notes: notes || undefined });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setOpen(false);
    setScheduledAt("");
    setNotes("");
    router.refresh();
  }

  if (tuitions.length === 0) {
    return <Alert variant="info" title="কোনো সক্রিয় টিউশন নেই">ক্লাসের সময় নির্ধারণ করতে আগে একটি টিউশন অনুরোধ গ্রহণ করতে হবে।</Alert>;
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>ক্লাসের সময় নির্ধারণ করুন</Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="session-dialog-title">
            <h2 id="session-dialog-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">ক্লাসের সময় নির্ধারণ</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {error && <Alert variant="danger">{error}</Alert>}
              <FormField label="টিউশন" htmlFor="session-tuition" required>
                <Select id="session-tuition" name="tuitionId" value={tuitionId} onChange={(e) => setTuitionId(e.target.value)} required>
                  {tuitions.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
                </Select>
              </FormField>
              <FormField label="তারিখ ও সময়" htmlFor="session-time" required>
                <Input id="session-time" name="scheduledAt" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} required />
              </FormField>
              <FormField label="নোট (ঐচ্ছিক)" htmlFor="session-notes">
                <Input id="session-notes" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="বিষয়, স্থান…" maxLength={500} />
              </FormField>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>বাতিল</Button>
                <Button type="submit" loading={pending}>তৈরি করুন</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
