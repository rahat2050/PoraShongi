"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function CopyCode({ code, referralUrl }: { code: string; referralUrl: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast("রেফারেল লিংক কপি হয়েছে", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("কপি করা যায়নি", "danger");
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={copy} aria-label={`${code} রেফারেল লিংক কপি করুন`}>
      <Copy className="h-4 w-4" aria-hidden />
      {copied ? "কপি হয়েছে!" : "লিংক কপি"}
    </Button>
  );
}
