"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function CopyCode({ code }: { code: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast("কোড কপি হয়েছে", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("কপি করা যায়নি", "danger");
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={copy}>
      <Copy className="h-4 w-4" aria-hidden />
      {copied ? "কপি হয়েছে!" : "কপি"}
    </Button>
  );
}
