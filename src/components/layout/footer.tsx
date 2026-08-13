import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-sm text-slate-500">{siteConfig.tagline}</p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm text-slate-500 sm:grid-cols-3">
            <div>
              <h4 className="font-semibold text-slate-700">প্ল্যাটফর্ম</h4>
              <ul className="mt-2 space-y-2">
                <li><Link href="/teachers" className="hover:text-brand-700">শিক্ষক খুঁজুন</Link></li>
                <li><Link href="/tuitions" className="hover:text-brand-700">Tuition দেখুন</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-700">অ্যাকাউন্ট</h4>
              <ul className="mt-2 space-y-2">
                <li><Link href="/login" className="hover:text-brand-700">লগইন</Link></li>
                <li><Link href="/register" className="hover:text-brand-700">রেজিস্টার</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-700">যোগাযোগ</h4>
              <ul className="mt-2 space-y-2">
                <li>hello@porasathi.com</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} {siteConfig.brandName} ({siteConfig.brandNameBangla}) — {siteConfig.branding}
        </div>
      </div>
    </footer>
  );
}
