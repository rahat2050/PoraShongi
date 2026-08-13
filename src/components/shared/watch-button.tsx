"use client";

import { useState, useTransition } from "react";
import { BellPlus } from "lucide-react";
import { createWatch } from "@/features/watch/actions";
import { Button } from "@/components/ui/button";

export function WatchButton({
  tuitionId,
  classLevel,
  subject,
  location,
  teachingMode,
  budget,
  className,
}: {
  tuitionId?: string | null;
  classLevel?: string;
  subject?: string;
  location?: string;
  teachingMode?: string;
  budget?: number | null;
  className?: string;
}) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await createWatch({
        tuitionId,
        classLevel,
        subject,
        location,
        teachingMode,
        budget,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone(true);
    });
  }

  if (done) {
    return (
      <p className="text-sm font-medium text-brand-700">
        ✓ We&apos;ll notify you when a suitable teacher is available.
      </p>
    );
  }

  return (
    <div className={className}>
      <Button variant="outline" disabled={pending} onClick={handleClick}>
        <BellPlus className="h-4 w-4" aria-hidden />
        Notify me when a suitable teacher becomes available
      </Button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
