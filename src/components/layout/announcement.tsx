import Link from "next/link";
import { Megaphone } from "lucide-react";
import { siteConfig } from "@/config/site";

/**
 * সাইটের উপরে ছোট ঘোষণা বার — siteConfig.announcement-এ কিছু সেট করলেই দেখাবে।
 * কোনো ডাটাবেস ডাটা লাগে না (static config)।
 */
export function Announcement() {
  const a = siteConfig.announcement;
  if (!a) return null;

  const inner = (
    <>
      <Megaphone className="h-4 w-4 shrink-0" aria-hidden />
      <span>{a.text}</span>
    </>
  );

  return (
    <div className="bg-brand-950 text-center text-brand-50">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2 text-xs font-medium sm:text-sm">
        {a.href ? (
          <Link href={a.href} className="flex items-center gap-2 hover:underline">
            {inner}
          </Link>
        ) : (
          inner
        )}
      </div>
    </div>
  );
}
