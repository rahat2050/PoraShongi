import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  MapPin,
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
      "Find the right teacher for your subjects, level and learning pace.",
  },
  {
    key: "teacher",
    icon: BookOpen,
    title: "For teachers",
    bangla: "শিক্ষক",
    description:
      "Build a verified profile and get discovered by students and guardians.",
  },
  {
    key: "guardian",
    icon: Users,
    title: "For guardians",
    bangla: "অভিভাবক",
    description:
      "Manage tuition and keep track of your children's learning journey.",
  },
];

const foundation = [
  {
    icon: KeyRound,
    title: "Secure authentication",
    description:
      "Registration, login, logout, session handling and password recovery built on Supabase Auth.",
  },
  {
    icon: BadgeCheck,
    title: "Role-based access",
    description:
      "Student, teacher, guardian and admin roles enforced on the server, never just the UI.",
  },
  {
    icon: ShieldCheck,
    title: "Row Level Security",
    description:
      "Every user sees only their own data. Admin operations stay protected.",
  },
  {
    icon: LayoutDashboard,
    title: "Profile foundation",
    description:
      "A clean, scalable profile architecture ready to power the full marketplace.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <Badge variant="brand" className="mb-6">
            Phase 1 · Foundation &amp; Architecture
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
            <Link href="/register" className={buttonStyles({ size: "lg" })}>
              Get started <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/login"
              className={buttonStyles({ variant: "outline", size: "lg" })}
            >
              Sign in
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

      {/* Foundation */}
      <section id="features" className="scroll-mt-20 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              A solid foundation first
            </h2>
            <p className="mt-3 text-slate-600">
              Phase 1 lays the groundwork the whole marketplace will be built
              on.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {foundation.map((item) => (
              <div
                key={item.title}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-6"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <item.icon className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {item.description}
                  </p>
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
