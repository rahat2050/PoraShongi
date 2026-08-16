"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Video } from "lucide-react";
import { setMeetingLink } from "@/features/tuitions/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

/** Owner (teacher) — Google Meet/Zoom লিংক বসায় (online class)। */
export function MeetingLinkForm({
  tuitionId,
  initialLink,
}: {
  tuitionId: string;
  initialLink: string | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [link, setLink] = useState(initialLink ?? "");
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await setMeetingLink(tuitionId, link);
      if (result.ok) {
        toast("মিটিং লিংক সেভ হয়েছে", "success");
        router.refresh();
      } else {
        toast(result.error, "danger");
      }
    });
  }

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Video className="h-4 w-4 text-brand-600" aria-hidden />
        অনলাইন ক্লাসের মিটিং লিংক
      </p>
      <div className="mt-2 flex gap-2">
        <Input
          placeholder="https://meet.google.com/xxx বা https://zoom.us/j/xxx"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
        <Button variant="outline" disabled={pending} onClick={save}>সেভ</Button>
      </div>
      <p className="mt-1.5 text-xs text-slate-400">শিক্ষার্থী এই লিংক থেকে ক্লাসে join করতে পারবে।</p>
    </div>
  );
}
