import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { siteConfig } from "@/config/site";

const linkClass = "rounded-sm hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:hover:text-brand-300";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[1.3fr_2fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{siteConfig.tagline}</p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm text-slate-600 sm:grid-cols-4 dark:text-slate-300">
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-slate-100">প্ল্যাটফর্ম</h2>
              <ul className="mt-2 space-y-2">
                <li><Link href="/teachers" className={linkClass}>শিক্ষক খুঁজুন</Link></li>
                <li><Link href="/tuitions" className={linkClass}>টিউশন দেখুন</Link></li>
                <li><Link href="/leaderboard" className={linkClass}>সেরা শিক্ষক</Link></li>
                <li><Link href="/blog" className={linkClass}>ব্লগ</Link></li>
                <li><Link href="/coaching" className={linkClass}>কোচিং</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-slate-100">বিশ্বাস ও নিরাপত্তা</h2>
              <ul className="mt-2 space-y-2">
                <li><Link href="/safety" className={linkClass}>নিরাপত্তা</Link></li>
                <li><Link href="/verification" className={linkClass}>ভেরিফিকেশন</Link></li>
                <li><Link href="/privacy" className={linkClass}>গোপনীয়তা</Link></li>
                <li><Link href="/terms" className={linkClass}>শর্তাবলি</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-slate-100">অ্যাকাউন্ট</h2>
              <ul className="mt-2 space-y-2">
                <li><Link href="/login" className={linkClass}>লগইন</Link></li>
                <li><Link href="/register" className={linkClass}>রেজিস্টার</Link></li>
                <li><Link href="/account" className={linkClass}>অ্যাকাউন্ট সেটিংস</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-slate-100">যোগাযোগ</h2>
              <ul className="mt-2 space-y-2">
                <li><Link href="/contact" className={linkClass}>সহায়তা</Link></li>
                <li><a href="mailto:hello@porasathi.com" className={linkClass}>hello@porasathi.com</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-600 dark:border-slate-700 dark:text-slate-400">
          © {new Date().getFullYear()} {siteConfig.brandName} ({siteConfig.brandNameBangla}) — {siteConfig.branding}
        </div>
      </div>
    </footer>
  );
}
