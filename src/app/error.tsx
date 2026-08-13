"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console / error-reporting service.
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-24">
      <ErrorState
        title="Something went wrong"
        description="An unexpected error occurred. Please try again."
        action={<Button onClick={reset}>Try again</Button>}
      />
    </div>
  );
}
