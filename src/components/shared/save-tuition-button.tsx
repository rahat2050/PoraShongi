"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toggleFavoriteTuition } from "@/features/favorites/actions";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/** Teacher — tuition save/unsave। */
export function SaveTuitionButton({
  tuitionId,
  initiallySaved,
  onSavedChange,
}: {
  tuitionId: string;
  initiallySaved: boolean;
  onSavedChange?: (saved: boolean) => void;
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleFavoriteTuition(tuitionId);
      if (!result.ok) {
        toast(result.error, "danger");
        return;
      }
      setSaved(result.data.saved);
      onSavedChange?.(result.data.saved);
      toast(result.data.saved ? "টিউশন সেভ হয়েছে" : "সেভ থেকে বাদ", "success");
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={saved}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all active:scale-95 disabled:opacity-60",
        saved
          ? "border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100"
          : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
      )}
    >
      <Bookmark className={cn("h-4 w-4", saved && "fill-current")} aria-hidden />
      {saved ? "সেভ করা" : "সেভ করুন"}
    </button>
  );
}
