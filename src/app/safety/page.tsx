import type { Metadata } from "next";
import { AlertTriangle, Eye, Lock, ShieldCheck, UserX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Safety guidelines",
  description: "How PoraShongi keeps students, guardians and teachers safe.",
};

const sections = [
  {
    icon: Lock,
    title: "Privacy by design",
    body: "Phone numbers, home addresses and other private information are never shown publicly. Minors' location details are hidden everywhere. Row Level Security means users can only ever see data they are allowed to see.",
  },
  {
    icon: Eye,
    title: "What stays private",
    body: "Your contact details are only shared when you choose to share them in a conversation. Reviews and messages are visible only to the people involved, and administrators for moderation.",
  },
  {
    icon: AlertTriangle,
    title: "Report anything suspicious",
    body: "Use the Report button on any teacher, student, guardian, tuition, review or conversation. Reports go straight to our moderation team — fake profiles, harassment, scams, spam and safety concerns are all taken seriously.",
  },
  {
    icon: UserX,
    title: "Block anyone",
    body: "If someone makes you uncomfortable, block them. Blocked users can no longer message you or see you in search results.",
  },
  {
    icon: ShieldCheck,
    title: "Guardians & minors",
    body: "Guardians can link a student account and manage their tuition journey. Minor accounts are protected with extra privacy: their location is never public and consent is required from a linked guardian.",
  },
];

const rules = [
  "Never share your passwords, OTPs or payment details in messages.",
  "Prefer meeting first in a safe, public place (or online) before home tuition.",
  "Keep all communication on PoraShongi until you fully trust the other person.",
  "Do not share home addresses or personal documents with strangers.",
  "Report any request for money outside the platform.",
];

export default function SafetyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <div className="text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-brand-600" aria-hidden />
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Safety guidelines</h1>
        <p className="mx-auto mt-2 max-w-xl text-slate-500">
          PoraShongi is built to protect students — many of whom are minors —
          their guardians and their teachers.
        </p>
      </div>

      <div className="mt-10 space-y-4">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardContent className="flex gap-4 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <section.icon className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">{section.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{section.body}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="font-semibold text-slate-900">Good practices</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {rules.map((rule) => (
            <li key={rule} className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-600">•</span>
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
