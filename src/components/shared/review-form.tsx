"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { submitReview } from "@/features/reviews/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";

export function ReviewForm({ teacherId, tuitionId }: { teacherId: string; tuitionId?: string | null }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    if (rating < 1) {
      setMessage({ type: "danger", text: "স্টার রেটিং দিন।" });
      return;
    }
    setPending(true);
    const result = await submitReview({ teacherId, tuitionId, rating, body: body || undefined });
    setPending(false);
    if (!result.ok) {
      setMessage({ type: "danger", text: result.error });
      return;
    }
    setMessage({ type: "success", text: "ধন্যবাদ! রিভিউ জমা হয়েছে।" });
    setBody("");
    setRating(0);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {message && <Alert variant={message.type}>{message.text}</Alert>}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} aria-label={`${n} স্টার`} aria-pressed={rating === n} className="inline-flex h-11 w-11 items-center justify-center rounded-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600">
            <Star className={`h-6 w-6 ${n <= (hover || rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} aria-hidden />
          </button>
        ))}
        <span className="ml-2 text-sm text-slate-500">{rating > 0 ? `${rating}/5` : "রেট করতে চাপুন"}</span>
      </div>
      <Textarea name="review" placeholder="আপনার অভিজ্ঞতা লিখুন…" value={body} onChange={(e) => setBody(e.target.value)} rows={3} maxLength={2000} aria-label="রিভিউ" />
      <Button type="submit" loading={pending}>রিভিউ দিন</Button>
    </form>
  );
}
