"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSession } from "@/features/schedule/actions";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";
import { Modal } from "@/components/ui/modal";

export function SessionForm({
  tuitions,
}: {
  tuitions: { id: string; title: string }[];
}) {
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
      setError("Please choose a tuition and a date/time.");
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
    return (
      <Alert variant="info" title="No active tuitions">
        You need an accepted tuition request (or an open tuition) before you can
        schedule classes.
      </Alert>
    );
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Schedule a class</Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Schedule a class">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="danger">{error}</Alert>}
          <FormField label="Tuition" required>
            <Select value={tuitionId} onChange={(e) => setTuitionId(e.target.value)}>
              {tuitions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Date & time" required>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </FormField>
          <FormField label="Notes (optional)">
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Topic, location…" />
          </FormField>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={pending}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
