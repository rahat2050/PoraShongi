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
      setError("tuition আর সময় বাছুন।");
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
    return <Alert variant="info" title="কোনো active tuition নেই">ক্লাস schedule করতে আগে tuition থাকতে হবে।</Alert>;
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>ক্লাস schedule করুন</Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-slate-900">ক্লাস schedule</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {error && <Alert variant="danger">{error}</Alert>}
              <FormField label="Tuition" required>
                <Select value={tuitionId} onChange={(e) => setTuitionId(e.target.value)}>
                  {tuitions.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
                </Select>
              </FormField>
              <FormField label="তারিখ ও সময়" required>
                <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
              </FormField>
              <FormField label="নোট (ঐচ্ছিক)">
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="টপিক, স্থান…" />
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
