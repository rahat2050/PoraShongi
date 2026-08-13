import Link from "next/link";
import { ArrowRight, GraduationCap, MapPin, ShieldCheck, Users } from "lucide-react";
import { siteConfig } from "@/config/site";
import { buttonStyles } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const roles = [
  { icon: GraduationCap, title: "শিক্ষার্থী", desc: "নিজের জন্য যোগ্য শিক্ষক খুঁজুন — class, subject, বাজেট ও এলাকা অনুযায়ী।" },
  { icon: Users, title: "অভিভাবক", desc: "সন্তানের জন্য শিক্ষক খুঁজুন এবং তার tuition journey manage করুন।" },
  { icon: ShieldCheck, title: "শিক্ষক", desc: "নিজের profile তৈরি করুন, tuition/student খুঁজুন, schedule manage করুন।" },
];

const steps = [
  { n: "১", title: "প্রয়োজন দিন", desc: "কোন class, কোন subject, কোন এলাকা, কত বাজেট — লিখুন।" },
  { n: "২", title: "Match পান", desc: "সিস্টেম আপনার সাথে সবচেয়ে compatible শিক্ষক দেখাবে (যেমন ৯৫% Match)।" },
  { n: "৩", title: "Request করুন", desc: "পছন্দের শিক্ষককে tuition request পাঠান।" },
  { n: "৪", title: "শেখা শুরু", desc: "Accept হলে schedule ঠিক করুন, attendance আর review দিন।" },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <Badge variant="brand" className="mb-6">{siteConfig.branding}</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            {siteConfig.brandNameBangla}
          </h1>
          <p className="mt-3 text-xl font-semibold text-brand-700">{siteConfig.tagline}</p>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            শিক্ষার্থী/অভিভাবক আর যোগ্য শিক্ষককে যুক্ত করি — trusted, সহজ ও নিরাপদ উপায়ে।
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/teachers" className={buttonStyles({ size: "lg" })}>
              শিক্ষক খুঁজুন <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/register" className={buttonStyles({ variant: "outline", size: "lg" })}>
              ফ্রিতে যুক্ত হোন
            </Link>
          </div>
          <p className="mt-7 inline-flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="h-4 w-4" aria-hidden />
            বাংলাদেশের যেকোনো এলাকা থেকে — কাছের শিক্ষক খুঁজুন
          </p>
        </div>
      </section>

      {/* Roles */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">সবার জন্য</h2>
            <p className="mt-3 text-slate-600">শিক্ষার্থী, অভিভাবক আর শিক্ষক — সবাই এক trusted প্ল্যাটফর্মে।</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {roles.map((role) => (
              <Card key={role.title} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                    <role.icon className="h-6 w-6" aria-hidden />
                  </div>
                  <CardTitle>{role.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">{role.desc}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">কীভাবে কাজ করে</h2>
            <p className="mt-3 text-slate-600">মাত্র ৪টা ধাপে সঠিক শিক্ষক।</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.n} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 font-bold text-white">
                  {step.n}
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="rounded-3xl bg-brand-950 px-6 py-12 text-center sm:px-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">আজই শুরু করুন</h2>
            <p className="mx-auto mt-3 max-w-2xl text-brand-100/90">
              শিক্ষক হলে profile খুলে student খুঁজুন — শিক্ষার্থী হলে সঠিক শিক্ষক খুঁজে নিন।
            </p>
            <Link href="/register" className={buttonStyles({ size: "lg", className: "mt-8 bg-white text-brand-900 hover:bg-brand-50" })}>
              ফ্রিতে যুক্ত হোন
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
