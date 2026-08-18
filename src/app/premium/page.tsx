import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CalendarDays, Crown, MessageCircle, ShieldCheck } from "lucide-react";
import { getPremiumWhatsAppUrl, premiumConfig } from "@/config/premium";
import { Card, CardContent } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Premium",
  description: "PoraSathi Premium সম্পর্কে WhatsApp-এ Admin-এর সঙ্গে যোগাযোগ করুন।",
  alternates: { canonical: "/premium" },
};

export default function PremiumPage() {
  const whatsappUrl = getPremiumWhatsAppUrl();
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-950 via-brand-800 to-brand-700 px-6 py-12 text-center text-white shadow-xl sm:px-10">
        <Crown className="mx-auto h-12 w-12 text-amber-300" aria-hidden />
        <p className="mt-4 text-sm font-bold uppercase tracking-[0.18em] text-brand-200">PoraSathi Premium</p>
        <h1 className="mt-3 text-4xl font-black">৳{premiumConfig.priceBdt} / {premiumConfig.durationDays} দিন</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-brand-50/90">Automatic payment এখনো চালু নয়। Premium request ও activation-এর জন্য সরাসরি Admin-এর সঙ্গে WhatsApp-এ যোগাযোগ করুন।</p>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={buttonStyles({ size: "lg", className: "mt-7 bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-white" })}>
          <MessageCircle className="h-5 w-5" aria-hidden /> WhatsApp-এ যোগাযোগ করুন
        </a>
        <p className="mt-3 text-xs text-brand-100">WhatsApp: {premiumConfig.whatsappDisplay}</p>
      </section>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          [BadgeCheck, "Admin review", "প্রতিটি request Admin যাচাই করে manually activate করবেন।"],
          [CalendarDays, "৩০ দিনের মেয়াদ", "Activation-এর দিন থেকে plan-এর মেয়াদ গণনা হবে।"],
          [ShieldCheck, "কোনো payment data নয়", "PoraSathi database-এ card, PIN বা bKash credential রাখা হবে না।"],
        ].map(([Icon, title, text]) => (
          <Card key={String(title)}><CardContent className="p-5"><Icon className="h-6 w-6 text-brand-700 dark:text-brand-300" aria-hidden /><h2 className="mt-3 font-bold">{String(title)}</h2><p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{String(text)}</p></CardContent></Card>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
        <strong>গুরুত্বপূর্ণ:</strong> WhatsApp-এ যোগাযোগ করা মানেই automatic activation নয়। Admin plan, payment method ও activation status নিশ্চিত করবেন। PIN, OTP বা password কখনো শেয়ার করবেন না।
      </div>
      <Link href="/" className="mt-6 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300">← হোমে ফিরুন</Link>
    </div>
  );
}
