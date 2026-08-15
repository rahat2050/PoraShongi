"use client";

import { useState, useTransition } from "react";
import { Phone } from "lucide-react";
import { sendContactRequest } from "@/features/contact/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

/**
 * ফোন সরাসরি দেখায় না — "যোগাযোগ অনুরোধ" → teacher accept করলে ফোন দেখাবে।
 */
export function ContactRequestButton({
  teacherId,
  initialStatus,
}: {
  teacherId: string;
  initialStatus: "none" | "pending" | "accepted" | "rejected";
}) {
  const { toast } = useToast();
  const [status, setStatus] = useState(initialStatus);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await sendContactRequest(teacherId);
      if (!result.ok) {
        toast(result.error, "danger");
        return;
      }
      setStatus(result.data.status);
      if (result.data.status === "pending") {
        toast("অনুরোধ পাঠানো হয়েছে — শিক্ষক accept করলে ফোন দেখতে পাবেন", "success");
      }
    });
  }

  if (status === "pending") {
    return <Button variant="outline" disabled>⏳ অনুরোধ পাঠানো (অপেক্ষায়)</Button>;
  }
  if (status === "accepted") {
    return <Button variant="outline" disabled>✅ যোগাযোগ মঞ্জুর হয়েছে</Button>;
  }
  if (status === "rejected") {
    return <Button variant="outline" disabled>প্রত্যাখ্যাত</Button>;
  }

  return (
    <Button variant="outline" disabled={pending} onClick={handleClick}>
      <Phone className="h-4 w-4" aria-hidden />
      যোগাযোগ অনুরোধ
    </Button>
  );
}
