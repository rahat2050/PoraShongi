"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Global error boundary — কিছু ভুল হলে retry বাটন। */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-slate-300 dark:text-slate-600">⚠️</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
        কিছু একটা ভুল হয়েছে
      </h1>
      <p className="mt-2 max-w-sm text-slate-500 dark:text-slate-400">
        দুঃখিত — পেজ লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন, না হলে একটু পরে ফিরে আসুন।
      </p>
      <Button className="mt-8" onClick={reset}>
        <RefreshCw className="h-4 w-4" aria-hidden /> আবার চেষ্টা করুন
      </Button>
    </div>
  );
}
