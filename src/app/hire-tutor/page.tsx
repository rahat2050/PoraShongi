import type { Metadata } from "next";
import Link from "next/link";
import { Clock, PhoneCall, ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { FaqList } from "@/components/seo/faq-list";
import { HireTutorForm } from "@/features/leads/hire-tutor-form";
import { buttonStyles } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { contactConfig, getHotlineTelUrl, getWhatsAppUrl } from "@/config/site";

export const metadata: Metadata = buildPageMetadata({
  title: "শিক্ষক চেয়ে অনুরোধ করুন — ২ মিনিটে",
  description:
    "লগইন ছাড়াই ক্লাস, বিষয়, এলাকা ও বাজেট জানান। PoraSathi টিম যাচাইকৃত শিক্ষক বাছাই করে ২৪ ঘণ্টার মধ্যে আপনার সঙ্গে যোগাযোগ করবে।",
  path: "/hire-tutor",
});

const promises = [
  { icon: Clock, title: "২ মিনিটে শেষ", desc: "অ্যাকাউন্ট খোলা বা ইমেইল ভেরিফাই ছাড়াই অনুরোধ পাঠান।" },
  { icon: UserCheck, title: "যাচাইকৃত শিক্ষক", desc: "ফোন, শিক্ষাগত যোগ্যতা ও পরিচয় যাচাই করা প্রোফাইল থেকে বাছাই।" },
  { icon: PhoneCall, title: "২৪ ঘণ্টায় সাড়া", desc: "আমাদের টিম সরাসরি আপনার নম্বরে কল বা WhatsApp করবে।" },
  { icon: ShieldCheck, title: "ফোন নম্বর গোপন", desc: "আপনার নম্বর কোনো পাবলিক পাতায় দেখানো হয় না।" },
] as const;

export default function HireTutorPage() {
  return (
    <div className="flex-1">
      <section className="border-b border-slate-200 bg-gradient-to-br from-brand-950 via-brand-800 to-brand-700 dark:border-slate-700">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/15 px-3 py-1.5 text-xs font-bold text-brand-50">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden /> লগইন ছাড়াই
          </span>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">
            আপনার প্রয়োজন জানান, আমরা শিক্ষক খুঁজে দেব
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-brand-50/90 sm:text-base">
            ক্লাস, বিষয়, এলাকা ও বাজেট লিখুন। আমাদের টিম আপনার চাহিদার সঙ্গে মিলে এমন যাচাইকৃত শিক্ষক বাছাই করে
            সরাসরি আপনার সঙ্গে যোগাযোগ করবে।
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={getHotlineTelUrl()} className={buttonStyles({ className: "bg-white text-brand-950 hover:bg-brand-50 focus-visible:ring-white" })}>
              <PhoneCall className="h-4 w-4" aria-hidden /> কল করুন {contactConfig.hotlineDisplay}
            </a>
            <a href={getWhatsAppUrl("আসসালামু আলাইকুম, আমার একজন শিক্ষক প্রয়োজন।")} target="_blank" rel="noopener noreferrer" className={buttonStyles({ className: "bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-300" })}>
              WhatsApp-এ লিখুন
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <Breadcrumbs items={[{ name: "হোম", path: "/" }, { name: "শিক্ষক চেয়ে অনুরোধ" }]} />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {promises.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                <Icon className="h-6 w-6 text-brand-700 dark:text-brand-300" aria-hidden />
                <h2 className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">{item.title}</h2>
                <p className="mt-1 text-xs leading-6 text-slate-600 dark:text-slate-300">{item.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10">
          <HireTutorForm />
        </div>

        <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">নিজেই শিক্ষক বাছতে চান?</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            অপেক্ষা না করে এখনই প্রকাশিত শিক্ষক প্রোফাইল দেখুন — ক্লাস, বিষয়, এলাকা ও দূরত্ব অনুযায়ী ফিল্টার করুন।
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/teachers" className={buttonStyles()}>শিক্ষক খুঁজুন</Link>
            <Link href="/register" className={buttonStyles({ variant: "outline" })}>অ্যাকাউন্ট খুলুন</Link>
          </div>
        </div>

        <div className="mt-12">
          <FaqList
            items={[
              {
                question: "অনুরোধ পাঠাতে কি অ্যাকাউন্ট লাগে?",
                answer:
                  "না। এই ফর্মটি লগইন ছাড়াই পূরণ করা যায়। তবে অ্যাকাউন্ট খুললে আপনি নিজেই শিক্ষক খুঁজতে, মেসেজ পাঠাতে ও সময়সূচি পরিচালনা করতে পারবেন।",
              },
              {
                question: "আমার ফোন নম্বর কি সবাই দেখতে পাবে?",
                answer:
                  "না। আপনার নম্বর কোনো পাবলিক পাতায় বা শিক্ষকদের কাছে প্রকাশ করা হয় না — শুধু PoraSathi টিম আপনার সঙ্গে যোগাযোগ করার জন্য ব্যবহার করে।",
              },
              {
                question: "কত সময়ের মধ্যে সাড়া পাব?",
                answer:
                  "সাধারণত ২৪ ঘণ্টার মধ্যে। জরুরি প্রয়োজনে সরাসরি হটলাইনে কল করুন বা WhatsApp-এ লিখুন।",
              },
              {
                question: "এই সেবার জন্য কি টাকা লাগে?",
                answer:
                  "শিক্ষক চেয়ে অনুরোধ পাঠানো সম্পূর্ণ ফ্রি। শিক্ষকের সঙ্গে টিউশন ফি আপনি সরাসরি আলোচনা করে ঠিক করবেন।",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
