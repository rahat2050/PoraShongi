import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  GraduationCap,
  KeyRound,
  MapPin,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { buttonStyles } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const roles = [
  {
    key: "student",
    icon: GraduationCap,
    title: "For students",
    bangla: "শিক্ষার্থী",
    description:
      "Post your tuition requirement, find the right teacher and send a request.",
  },
  {
    key: "teacher",
    icon: BookOpen,
    title: "For teachers",
    bangla: "শিক্ষক",
    description:
      "Build a verified profile, get discovered and receive tuition requests.",
  },
  {
    key: "guardian",
    icon: Users,
    title: "For guardians",
    bangla: "অভিভাবক",
    description:
      "Link your child's account and manage their tuition journey end-to-end.",
  },
];

const features = [
  {
    icon: Search,
    title: "Search & filter",
    description:
      "Find teachers and tuitions by class, subject, location, budget and mode — with pagination.",
  },
  {
    icon: KeyRound,
    title: "Requests & replies",
    description:
      "Send tuition requests to teachers, who accept or reject them. Duplicate requests are blocked.",
  },
  {
    icon: BadgeCheck,
    title: "Verification & trust",
    description:
      "Verified, education and phone status help you choose with confidence.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy by design",
    description:
      "Row Level Security keeps every account's data private — no sensitive info is ever public.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <Badge variant="brand" className="mb-6">
            Bangladesh&apos;s tuition marketplace
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            {siteConfig.brandNameBangla}
          </h1>
          <p className="mt-3 text-xl font-semibold text-brand-700">
            {siteConfig.tagline}
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {siteConfig.description}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/teachers" className={buttonStyles({ size: "lg" })}>
              Find a teacher <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/register"
              className={buttonStyles({ variant: "outline", size: "lg" })}
            >
              Join free
            </Link>
          </div>
          <p className="mt-7 inline-flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="h-4 w-4" aria-hidden />
            Serving {siteConfig.region}
          </p>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Made for everyone in learning
            </h2>
            <p className="mt-3 text-slate-600">
              PoraShongi brings students, teachers and guardians onto one
              trusted platform.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {roles.map((role) => (
              <Card key={role.key} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                    <role.icon className="h-6 w-6" aria-hidden />
                  </div>
                  <CardTitle>{role.title}</CardTitle>
                  <CardDescription className="font-medium text-brand-700">
                    {role.bangla}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                  {role.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Everything you need to connect
            </h2>
            <p className="mt-3 text-slate-600">
              A simple, safe marketplace for tuition in Bangladesh.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {features.map((item) => (
              <div
                key={item.title}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-6"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <item.icon className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security note */}
      <section id="security" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="rounded-3xl bg-brand-950 px-6 py-12 text-center sm:px-12">
            <ShieldCheck className="mx-auto h-10 w-10 text-brand-300" aria-hidden />
            <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
              Privacy &amp; safety by design
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-brand-100/90">
              Supabase Row Level Security keeps every user&apos;s data private.
              Service-role keys never reach the browser, and every protected
              route is authorized on the server.
            </p>
            <Link
              href="/register"
              className={buttonStyles({
                size: "lg",
                className: "mt-8 bg-white text-brand-900 hover:bg-brand-50",
              })}
            >
              Join PoraShongi
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
