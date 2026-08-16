"use client";

import { useState, useTransition } from "react";
import { Ban, ShieldOff } from "lucide-react";
import { toggleBlock } from "@/features/reviews/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function BlockButton({
  otherId,
  initiallyBlocked = false,
}: {
  otherId: string;
  initiallyBlocked?: boolean;
}) {
  const { toast } = useToast();
  const [blocked, setBlocked] = useState(initiallyBlocked);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleBlock(otherId);
      if (result.ok) {
        setBlocked(result.data.blocked);
        toast(result.data.blocked ? "ব্যবহারকারীকে ব্লক করা হয়েছে" : "ব্যবহারকারীকে আনব্লক করা হয়েছে", "success");
      } else {
        toast(result.error, "danger");
      }
    });
  }

  return (
    <Button variant="ghost" size="md" disabled={pending} onClick={handleClick} className={blocked ? "text-red-600 hover:bg-red-50" : ""}>
      {blocked ? <><ShieldOff className="h-4 w-4" aria-hidden /> আনব্লক</> : <><Ban className="h-4 w-4" aria-hidden /> ব্লক</>}
    </Button>
  );
}
