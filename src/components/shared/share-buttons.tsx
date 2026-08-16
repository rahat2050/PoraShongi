"use client";

import { useState } from "react";
import { Link2, MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

/** Social share — WhatsApp + copy link। কোনো server call লাগে না। */
export function ShareButtons({ url, title }: { url: string; title: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  function shareWhatsApp() {
    const text = encodeURIComponent(`${title} — ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast("লিংক কপি হয়েছে", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("কপি করা যায়নি", "danger");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={shareWhatsApp}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        aria-label="WhatsApp-এ শেয়ার"
      >
        <MessageCircle className="h-4 w-4 text-emerald-600" aria-hidden />
        WhatsApp
      </button>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        aria-label="লিংক কপি"
      >
        <Link2 className="h-4 w-4" aria-hidden />
        {copied ? "কপি হয়েছে!" : "লিংক কপি"}
      </button>
    </div>
  );
}
