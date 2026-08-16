"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/teachers", label: "শিক্ষক খুঁজুন" },
  { href: "/tuitions", label: "Tuition" },
  { href: "/coaching", label: "Coaching" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/messages", label: "মেসেজ" },
  { href: "/dashboard/referrals", label: "রেফারেল" },
  { href: "/account", label: "প্রাইভেসি ও অ্যাকাউন্ট" },
  { href: "/#how", label: "কীভাবে কাজ করে" },
];

/** মোবাইলের জন্য হ্যামবার্গার menu — ছোট স্ক্রিনে এখন menu-ই দেখা যায় না। */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100"
        aria-label={open ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-16 border-b border-slate-200 bg-white px-4 py-3 shadow-lg">
          <nav className="flex flex-col gap-1" aria-label="মোবাইল মেনু">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
