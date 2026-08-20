import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, LogIn, Search, ShieldCheck, Trophy, UserRoundSearch } from "lucide-react";

const steps = [
  { icon: Search, label: "Login ছাড়াই", title: "প্রয়োজন দিয়ে খুঁজুন", text: "ক্লাস, বিষয়, জেলা ও মাধ্যম বেছে শিক্ষক তালিকা দেখুন।", href: "/teachers" },
  { icon: UserRoundSearch, label: "Public profile", title: "তথ্য যাচাই করুন", text: "অভিজ্ঞতা, বিষয়, fee, availability, rating ও verification দেখুন।", href: "/teachers" },
  { icon: LogIn, label: "শুধু যোগাযোগে", title: "পছন্দ হলে যুক্ত হন", text: "শিক্ষককে request, message বা save করার সময় নিরাপদে login করুন।", href: "/login?next=%2Fteachers" },
] as const;

const actions = [
  { href: "/teachers", label: "সব শিক্ষক", description: "Filter দিয়ে teacher খুঁজুন", icon: GraduationCap },
  { href: "/leaderboard", label: "সেরা শিক্ষক", description: "যোগ্য ranking দেখুন", icon: Trophy },
  { href: "/resources", label: "শিক্ষা রিসোর্স", description: "Free ও linked materials", icon: BookOpen },
  { href: "/safety", label: "নিরাপত্তা", description: "যোগাযোগের আগে guide পড়ুন", icon: ShieldCheck },
] as const;

export function VisitorJourney() {
  return (
    <section id="visitor-journey" className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950" aria-labelledby="visitor-journey-title">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="motion-reveal mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">নতুন Visitor-এর জন্য</p>
          <h2 id="visitor-journey-title" className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl dark:text-white">দেখুন, যাচাই করুন—তারপর সিদ্ধান্ত নিন</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Teacher খোঁজা ও profile দেখার জন্য account লাগে না। যোগাযোগের সময় login চাওয়া হয়, যাতে request ও message নিরাপদ থাকে।</p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <Link key={step.title} href={step.href} className="motion-flip motion-card group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300"><step.icon className="h-5 w-5" aria-hidden /></span><span className="text-3xl font-black text-slate-500 dark:text-slate-400">0{index + 1}</span></div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">{step.label}</p>
              <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-700">এখনই দেখুন <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden /></span>
            </Link>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Visitor quick actions">
          {actions.map((action) => (
            <Link key={action.href} href={action.href} data-visitor-action={action.href} className="motion-card group flex min-h-28 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-700 dark:hover:bg-brand-950/30">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-brand-800 dark:bg-slate-800 dark:text-brand-300"><action.icon className="h-5 w-5" aria-hidden /></span>
              <span className="min-w-0"><span className="block font-bold text-slate-900 dark:text-slate-100">{action.label}</span><span className="mt-0.5 block text-xs leading-5 text-slate-500 dark:text-slate-400">{action.description}</span></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
