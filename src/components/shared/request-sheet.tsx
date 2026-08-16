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
      setError("আগে একটি টিউশন বাছুন।");
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
        টিউশনের অনুরোধ পাঠান
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="request-dialog-title">
            <h2 id="request-dialog-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">টিউশনের অনুরোধ পাঠান</h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-300">{teacherName}-কে অনুরোধ পাঠান</p>

            <div className="mt-4 space-y-4">
              {success ? (
                <>
                  <Alert variant="success" title="পাঠানো হয়েছে">আপনার অনুরোধ পাঠানো হয়েছে। শিক্ষক নোটিফিকেশন পাবেন।</Alert>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>বন্ধ করুন</Button>
                    <Link href="/dashboard/requests"><Button onClick={() => setOpen(false)}>অনুরোধ দেখুন</Button></Link>
                  </div>
                </>
              ) : tuitions.length === 0 ? (
                <>
                  <Alert variant="warning" title="কোনো টিউশন নেই">অনুরোধ পাঠাতে আগে একটি টিউশন তৈরি করুন।</Alert>
                  <Link href="/dashboard/tuitions/new"><Button onClick={() => setOpen(false)}>টিউশন তৈরি করুন</Button></Link>
                </>
              ) : (
                <>
                  {error && <Alert variant="danger">{error}</Alert>}
                  <FormField label="আপনার টিউশন" htmlFor="request-tuition" required>
                    <Select id="request-tuition" name="tuitionId" value={tuitionId} onChange={(e) => setTuitionId(e.target.value)} required>
                      {tuitions.map((t) => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </Select>
                  </FormField>
                  <FormField label="বার্তা (ঐচ্ছিক)" htmlFor="request-message" hint={`${message.length}/1000`}>
                    <Textarea id="request-message" name="message" placeholder="নিজের পরিচয় ও প্রয়োজনের বিস্তারিত লিখুন…" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} />
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
