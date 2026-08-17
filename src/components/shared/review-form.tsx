"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Pencil, Send, Star } from "lucide-react";
import { submitReview } from "@/features/reviews/actions";
import { RATING_LABELS } from "@/lib/ratings";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { FormField } from "@/components/ui/form-field";

export function ReviewForm({
  teacherId,
  existingReview,
}: {
  teacherId: string;
  existingReview?: { rating: number; body: string | null } | null;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState(existingReview?.body ?? "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null);
  const selectedLabel = rating > 0 ? RATING_LABELS[rating] : "একটি স্টার রেটিং বাছুন";
  const bengaliNumber = new Intl.NumberFormat("bn-BD");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    if (rating < 1) {
      setMessage({ type: "danger", text: "১ থেকে ৫-এর মধ্যে একটি স্টার রেটিং দিন।" });
      return;
    }

    setPending(true);
    const result = await submitReview({ teacherId, rating, body: body || undefined });
    setPending(false);
    if (!result.ok) {
      setMessage({ type: "danger", text: result.error });
      return;
    }

    setMessage({
      type: "success",
      text: result.data.updated ? "আপনার রেটিং ও রিভিউ আপডেট হয়েছে।" : "ধন্যবাদ! আপনার রেটিং প্রকাশিত হয়েছে।",
    });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {message && <Alert variant={message.type}>{message.text}</Alert>}

      <fieldset>
        <legend className="text-sm font-bold text-slate-900 dark:text-slate-100">আপনার সামগ্রিক অভিজ্ঞতা কেমন ছিল?</legend>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">রেটিং দেওয়ার আগে পড়ানো, যোগাযোগ ও সময়ানুবর্তিতা বিবেচনা করুন।</p>
        <div className="mt-3 flex flex-wrap items-center gap-2" onMouseLeave={() => setHover(0)}>
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            {[1, 2, 3, 4, 5].map((value) => (
              <label key={value} className="cursor-pointer rounded-xl">
                <input
                  type="radio"
                  name="rating"
                  value={value}
                  checked={rating === value}
                  onChange={() => setRating(value)}
                  className="peer sr-only"
                  aria-label={`${value} স্টার — ${RATING_LABELS[value]}`}
                />
                <span
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl transition-all hover:scale-105 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-brand-600 peer-focus-visible:ring-offset-2"
                  onMouseEnter={() => setHover(value)}
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${value <= (hover || rating) ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-300 dark:fill-slate-800 dark:text-slate-600"}`}
                    aria-hidden
                  />
                </span>
              </label>
            ))}
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-900 dark:bg-amber-950/60 dark:text-amber-200" aria-live="polite">
            {rating > 0 ? `${bengaliNumber.format(rating)}/৫ · ${selectedLabel}` : selectedLabel}
          </span>
        </div>
      </fieldset>

      <FormField label="লিখিত রিভিউ (ঐচ্ছিক)" htmlFor="teacher-review" hint="ব্যক্তিগত ফোন, ঠিকানা বা সংবেদনশীল তথ্য লিখবেন না।">
        <Textarea
          id="teacher-review"
          name="review"
          placeholder="পড়ানোর ধরন, যোগাযোগ ও আপনার শেখার অভিজ্ঞতা লিখুন…"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={4}
          maxLength={2000}
          aria-describedby="teacher-review-hint teacher-review-count"
        />
      </FormField>
      <p id="teacher-review-count" className="-mt-3 text-right text-xs text-slate-500 dark:text-slate-400">{bengaliNumber.format(body.length)}/২০০০</p>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <BadgeCheck className="h-4 w-4" aria-hidden /> গৃহীত টিউশন অভিজ্ঞতা হিসেবে যাচাইকৃত হবে
        </p>
        <Button type="submit" loading={pending} disabled={rating < 1}>
          {existingReview ? <Pencil className="h-4 w-4" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
          {existingReview ? "রেটিং আপডেট করুন" : "রেটিং প্রকাশ করুন"}
        </Button>
      </div>
    </form>
  );
}
