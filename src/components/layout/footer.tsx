import Link from "next/link";
import { ArrowUpRight, ExternalLink, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { SocialIcon } from "@/components/shared/social-icon";
import { Logo } from "@/components/layout/logo";
import {
  contactConfig,
  getHotlineTelUrl,
  getWhatsAppUrl,
  paymentMethods,
  siteConfig,
  socialLinks,
} from "@/config/site";
import { developer } from "@/config/developer";

const linkClass = "inline-flex min-h-9 items-center rounded-md text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300";

export function Footer() {
  return (
    <footer className="dark relative overflow-hidden border-t border-white/10 bg-slate-950 text-slate-300">
      <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-brand-700/15 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-12 sm:px-6 md:py-16">
        <div className="mb-12 flex flex-col gap-6 rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-sm font-bold text-white">সাহায্য বা নিরাপত্তা নিয়ে প্রশ্ন আছে?</p>
            <p className="mt-1 text-sm text-slate-300">
              সরাসরি কল করুন <a href={getHotlineTelUrl()} className="font-semibold text-white underline underline-offset-4 hover:text-brand-200">{contactConfig.hotlineDisplay}</a> — {contactConfig.hoursBn}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={getHotlineTelUrl()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-slate-950 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300">
              <Phone className="h-4 w-4" aria-hidden /> কল করুন
            </a>
            <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">
              <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
            </a>
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

            <address className="mt-5 space-y-2 text-sm not-italic text-slate-300">
              <a href={getHotlineTelUrl()} className={`${linkClass} gap-2`}>
                <Phone className="h-4 w-4 shrink-0 text-brand-300" aria-hidden />
                {contactConfig.hotlineDisplay}
              </a>
              <a href={`mailto:${contactConfig.email}`} className={`${linkClass} gap-2`}>
                <Mail className="h-4 w-4 shrink-0 text-brand-300" aria-hidden />
                {contactConfig.email}
              </a>
              <p className="flex items-start gap-2 py-1 text-slate-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" aria-hidden />
                {contactConfig.addressBn}
              </p>
            </address>

            {socialLinks.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {socialLinks.map((social) => (
                    <li key={social.key}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        title={social.label}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-200 transition-colors hover:border-brand-400 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
                      >
                        <SocialIcon name={social.key} className="h-[18px] w-[18px]" />
                      </a>
                    </li>
                ))}
              </ul>
            )}

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white">পেমেন্ট গ্রহণ করি</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {paymentMethods.map((method) => (
                  <li
                    key={method.key}
                    title={`${method.label} — ${method.hint}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold text-slate-100"
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: method.tone }} aria-hidden />
                    {method.label}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs leading-6 text-slate-400">
                Premium activation ম্যানুয়ালি হয় — আমরা কোনো card, PIN বা wallet credential সংরক্ষণ করি না।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-9 text-sm sm:grid-cols-4">
            <FooterGroup title="প্ল্যাটফর্ম">
              <li><Link href="/hire-tutor" className={linkClass}>শিক্ষক চেয়ে অনুরোধ</Link></li>
              <li><Link href="/teachers" className={linkClass}>শিক্ষক খুঁজুন</Link></li>
              <li><Link href="/teachers/sunamganj" className={linkClass}>সুনামগঞ্জের শিক্ষক</Link></li>
              <li><Link href="/teachers/sylhet" className={linkClass}>সিলেটের শিক্ষক</Link></li>
              <li><Link href="/teachers/online" className={linkClass}>অনলাইন শিক্ষক</Link></li>
              <li><Link href="/subjects" className={linkClass}>বিষয় অনুযায়ী শিক্ষক</Link></li>
              <li><Link href="/tuitions" className={linkClass}>টিউশন দেখুন</Link></li>
              <li><Link href="/leaderboard" className={linkClass}>সেরা শিক্ষক</Link></li>
              <li><Link href="/how-it-works" className={linkClass}>কীভাবে কাজ করে</Link></li>
              <li><Link href="/about" className={linkClass}>আমাদের সম্পর্কে</Link></li>
              <li><Link href="/blog" className={linkClass}>শিক্ষা ব্লগ</Link></li>
              <li><Link href="/coaching" className={linkClass}>কোচিং সেন্টার</Link></li>
              <li><Link href="/resources" className={linkClass}>শিক্ষা রিসোর্স</Link></li>
              <li><Link href="/affiliate" className={linkClass}>অ্যাফিলিয়েট প্রোগ্রাম</Link></li>
              <li><Link href="/app" className={linkClass}>অ্যাপ ইনস্টল করুন</Link></li>
              <li><Link href="/premium" className={linkClass}>Premium</Link></li>
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
              <li><a href={getHotlineTelUrl()} className={linkClass}>হটলাইন</a></li>
              <li>
                <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className={`${linkClass} group gap-1.5`}>
                  WhatsApp <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                </a>
              </li>
              <li>
                <a href={`mailto:${contactConfig.email}`} className={`${linkClass} group gap-1.5`}>
                  ইমেইল করুন <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                </a>
              </li>
              <li><Link href="/careers" className={linkClass}>ক্যারিয়ার</Link></li>
            </FooterGroup>
          </div>
        </div>

        <div data-footer-bottom className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteConfig.brandName} ({siteConfig.brandNameBangla})</p>
          <p className="flex flex-wrap items-center gap-1.5">
            <span>Developed by</span>
            <a
              href={developer.links.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1 font-bold text-brand-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
            >
              {developer.name}
              <ExternalLink className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </a>
            <span aria-hidden>·</span>
            <span>Discover → Match → Connect → Manage → Trust</span>
          </p>
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
