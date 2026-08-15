"use client";

import { useState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { sendTuitionRequest } from "@/features/requests/actions";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";

export interface TuitionOption {
  id: string;
  title: string;
}

export function RequestSheet({
  teacherId,
  teacherName,
  tuitions,
}: {
  teacherId: string;
  teacherName: string;
  tuitions: TuitionOption[];
}) {
  const [open, setOpen] = useState(false);
  const [tuitionId, setTuitionId] = useState(tuitions[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSend() {
    setError(null);
    if (!tuitionId) {
      setError("আগে একটা tuition বাছুন।");
      return;
    }
    setPending(true);
    const result = await sendTuitionRequest({ tuitionId, teacherId, message: message || undefined });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess(true);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Send className="h-4 w-4" aria-hidden />
        Tuition request পাঠান
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h2 className="text-lg font-semibold text-slate-900">Tuition request পাঠান</h2>
            <p className="mt-0.5 text-sm text-slate-500">{teacherName}-কে request পাঠান</p>

            <div className="mt-4 space-y-4">
              {success ? (
                <>
                  <Alert variant="success" title="পাঠানো হয়েছে">আপনার request পাঠানো হয়েছে। শিক্ষক notified হবেন।</Alert>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>বন্ধ করুন</Button>
                    <Link href="/dashboard/requests"><Button onClick={() => setOpen(false)}>Requests দেখুন</Button></Link>
                  </div>
                </>
              ) : tuitions.length === 0 ? (
                <>
                  <Alert variant="warning" title="কোনো tuition নেই">request পাঠাতে আগে একটা tuition তৈরি করুন।</Alert>
                  <Link href="/dashboard/tuitions/new"><Button onClick={() => setOpen(false)}>Tuition তৈরি করুন</Button></Link>
                </>
              ) : (
                <>
                  {error && <Alert variant="danger">{error}</Alert>}
                  <FormField label="আপনার tuition" required>
                    <Select value={tuitionId} onChange={(e) => setTuitionId(e.target.value)}>
                      {tuitions.map((t) => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </Select>
                  </FormField>
                  <FormField label="বার্তা (ঐচ্ছিক)">
                    <Textarea placeholder="নিজের পরিচয় দিন, বিস্তারিত লিখুন…" value={message} onChange={(e) => setMessage(e.target.value)} />
                  </FormField>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>বাতিল</Button>
                    <Button onClick={handleSend} loading={pending}>পাঠান</Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
