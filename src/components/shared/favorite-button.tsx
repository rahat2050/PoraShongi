"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/features/favorites/actions";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  teacherId,
  initiallySaved,
  disabled,
}: {
  teacherId: string;
  initiallySaved: boolean;
  disabled?: boolean;
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleFavorite(teacherId);
      if (result.ok) setSaved(result.data.saved);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || pending}
      aria-pressed={saved}
      aria-label={saved ? "সেভ থেকে বাদ দিন" : "শিক্ষক সেভ করুন"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        saved
          ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
          : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
      )}
    >
      <Heart className={cn("h-4 w-4", saved && "fill-current")} aria-hidden />
      {saved ? "সেভ করা" : "সেভ করুন"}
    </button>
  );
}
