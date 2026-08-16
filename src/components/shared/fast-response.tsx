import { Zap } from "lucide-react";

/**
 * Fast response indicator — গড় কত ঘণ্টায় reply করে।
 * কোনো নতুন ডাটা লাগে না (request response data থেকে হিসাব করা)।
 */
export function FastResponse({ avgHours }: { avgHours: number | null }) {
  if (avgHours === null) return null;

  let text: string;
  if (avgHours < 1) text = "সাধারণত ১ ঘণ্টার মধ্যে reply করেন";
  else if (avgHours < 6) text = `সাধারণত ${Math.round(avgHours)} ঘণ্টায় reply করেন`;
  else if (avgHours < 24) text = "সাধারণত এক দিনের মধ্যে reply করেন";
  else return null; // ধীর — দেখাব না

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
      <Zap className="h-3.5 w-3.5 text-amber-500" aria-hidden />
      {text}
    </span>
  );
}
