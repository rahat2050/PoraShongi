"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { submitReport } from "@/features/reviews/actions";
import { type Report } from "@/types/index";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";

const CATEGORIES: { value: Report["category"]; label: string }[] = [
  { value: "fake_profile", label: "ভুয়া প্রোফাইল" },
  { value: "harassment", label: "হয়রানি" },
  { value: "inappropriate", label: "অশোভন আচরণ" },
  { value: "scam", label: "প্রতারণা" },
  { value: "spam", label: "স্প্যাম" },
  { value: "safety_concern", label: "নিরাপত্তা উদ্বেগ" },
  { value: "other", label: "অন্য" },
];

export function ReportButton({
  targetType,
  targetId,
  label = "রিপোর্ট",
}: {
  targetType: Report["target_type"];
  targetId: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<Report["category"]>("other");
  const [details, setDetails] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null);

  async function handleSubmit() {
    setMessage(null);
    setPending(true);
    const result = await submitReport({ targetType, targetId, category, details: details || undefined });
    setPending(false);
    if (!result.ok) {
      setMessage({ type: "danger", text: result.error });
      return;
    }
    setMessage({ type: "success", text: "ধন্যবাদ — রিপোর্ট জমা হয়েছে।" });
  }

  return (
    <>
      <Button variant="ghost" size="md" onClick={() => setOpen(true)} aria-label={label || "রিপোর্ট করুন"} title={label || "রিপোর্ট করুন"}>
        <Flag className="h-4 w-4" aria-hidden />
        {label}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center" onClick={() => setOpen(false)}>
          <div className="max-h-[calc(100dvh-5rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl bg-white p-6 shadow-xl sm:max-h-[calc(100vh-2rem)] dark:bg-slate-800" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="report-dialog-title">
            <h2 id="report-dialog-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">রিপোর্ট করুন</h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-300">PoraSathi নিরাপদ রাখতে সাহায্য করুন।</p>

            <div className="mt-4 space-y-4">
              {message ? (
                <>
                  <Alert variant={message.type}>{message.text}</Alert>
                  <Button variant="outline" onClick={() => setOpen(false)}>বন্ধ করুন</Button>
                </>
              ) : (
                <>
                  <FormField label="কারণ" required>
                    <Select value={category} onChange={(e) => setCategory(e.target.value as Report["category"])}>
                      {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </Select>
                  </FormField>
                  <FormField label="বিস্তারিত (ঐচ্ছিক)">
                    <Textarea placeholder="কী হয়েছে লিখুন…" value={details} onChange={(e) => setDetails(e.target.value)} />
                  </FormField>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>বাতিল</Button>
                    <Button onClick={handleSubmit} loading={pending}>জমা দিন</Button>
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
