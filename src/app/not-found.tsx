import Link from "next/link";
import { Compass, GraduationCap } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";

/** সুন্দর 404 — ব্যবহারকারী হারিয়ে গেলে পথ দেখায়। */
export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <div className="relative">
        <p className="text-8xl font-extrabold tracking-tight text-brand-600 sm:text-9xl">৪০৪</p>
        <GraduationCap className="absolute -right-8 -top-4 h-14 w-14 rotate-12 text-brand-300 sm:h-16 sm:w-16" aria-hidden />
      </div>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
        পেজটা পাওয়া যায়নি
      </h1>
      <p className="mt-2 max-w-sm text-slate-500 dark:text-slate-400">
        আপনি যে পেজ খুঁজছেন সেটা নেই বা সরিয়ে ফেলা হয়েছে। চিন্তা নেই — নিচের লিংক থেকে এগিয়ে যান।
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonStyles()}>হোমে যান</Link>
        <Link href="/teachers" className={buttonStyles({ variant: "outline" })}>
          <Compass className="h-4 w-4" aria-hidden /> শিক্ষক খুঁজুন
        </Link>
      </div>
    </div>
  );
}
