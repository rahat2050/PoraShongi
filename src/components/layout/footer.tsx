import Link from "next/link";
import { ArrowUpRight, Mail, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { siteConfig } from "@/config/site";

const linkClass = "inline-flex min-h-9 items-center rounded-md text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300";

export function Footer() {
  return (
    <footer className="dark relative overflow-hidden border-t border-white/10 bg-slate-950 text-slate-300">
      <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-brand-700/15 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-12 sm:px-6 md:py-16">
        <div className="mb-12 flex flex-col gap-6 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-sm font-bold text-white">সাহায্য বা নিরাপত্তা নিয়ে প্রশ্ন আছে?</p>
            <p className="mt-1 text-sm text-slate-300">আমাদের সহায়তা ও নিরাপত্তা নির্দেশিকা দেখুন।</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-slate-950 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 dark:bg-white dark:text-slate-950 dark:hover:bg-brand-50">
              <Mail className="h-4 w-4" aria-hidden /> সহায়তা নিন
            </Link>
            <Link href="/safety" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 text-sm font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300">
              <ShieldCheck className="h-4 w-4" aria-hidden /> নিরাপত্তা
            </Link>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr] lg:gap-16">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-5 text-lg font-bold text-white">{siteConfig.tagline}</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              শিক্ষক খোঁজা, সংযোগ, সময়সূচি ও বিশ্বাস—পুরো টিউশন যাত্রার জন্য একটি আধুনিক প্ল্যাটফর্ম।
            </p>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-300">{siteConfig.branding}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-9 text-sm sm:grid-cols-4">
            <FooterGroup title="প্ল্যাটফর্ম">
              <li><Link href="/teachers" className={linkClass}>শিক্ষক খুঁজুন</Link></li>
              <li><Link href="/tuitions" className={linkClass}>টিউশন দেখুন</Link></li>
              <li><Link href="/leaderboard" className={linkClass}>সেরা শিক্ষক</Link></li>
              <li><Link href="/blog" className={linkClass}>শিক্ষা ব্লগ</Link></li>
              <li><Link href="/coaching" className={linkClass}>কোচিং সেন্টার</Link></li>
              <li><Link href="/resources" className={linkClass}>শিক্ষা রিসোর্স</Link></li>
            </FooterGroup>
            <FooterGroup title="বিশ্বাস ও নিরাপত্তা">
              <li><Link href="/safety" className={linkClass}>নিরাপত্তা</Link></li>
              <li><Link href="/verification" className={linkClass}>ভেরিফিকেশন</Link></li>
              <li><Link href="/privacy" className={linkClass}>গোপনীয়তা</Link></li>
              <li><Link href="/terms" className={linkClass}>শর্তাবলি</Link></li>
            </FooterGroup>
            <FooterGroup title="অ্যাকাউন্ট">
              <li><Link href="/login" className={linkClass}>লগইন</Link></li>
              <li><Link href="/register" className={linkClass}>রেজিস্টার</Link></li>
              <li><Link href="/account" className={linkClass}>অ্যাকাউন্ট সেটিংস</Link></li>
            </FooterGroup>
            <FooterGroup title="যোগাযোগ">
              <li><Link href="/contact" className={linkClass}>সহায়তা</Link></li>
              <li>
                <a href="mailto:hello@porasathi.com" className={`${linkClass} group gap-1.5`}>
                  ইমেইল করুন <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                </a>
              </li>
            </FooterGroup>
          </div>
        </div>

        <div data-footer-bottom className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteConfig.brandName} ({siteConfig.brandNameBangla})</p>
          <p>Discover → Match → Connect → Manage → Trust</p>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-white">{title}</h2>
      <ul className="mt-4 space-y-1">{children}</ul>
    </div>
  );
}
