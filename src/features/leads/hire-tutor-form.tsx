"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Send } from "lucide-react";
import { CLASS_LEVELS, DISTRICTS, SUBJECTS, TEACHING_MODES, TIME_SLOTS, WEEK_DAYS } from "@/config/options";
import { submitTutorLead } from "@/features/leads/actions";
import { Alert } from "@/components/ui/alert";
import { Button, buttonStyles } from "@/components/ui/button";
import { CheckboxGroup } from "@/components/ui/checkbox-group";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SuccessBurst } from "@/components/motion/success-burst";

export function HireTutorForm() {
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [district, setDistrict] = useState("");
  const [area, setArea] = useState("");
  const [teachingMode, setTeachingMode] = useState<"online" | "offline" | "both">("offline");
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [preferredTime, setPreferredTime] = useState("");
  const [budget, setBudget] = useState("");
  const [note, setNote] = useState("");
  const [website, setWebsite] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const result = await submitTutorLead({
      contactName,
      contactPhone,
      contactEmail,
      classLevel,
      subjects,
      district,
      area,
      teachingMode,
      preferredDays,
      preferredTime,
      budget,
      note,
      website,
    });

    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-800 dark:bg-emerald-950/40">
        <SuccessBurst />
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 dark:text-emerald-400" aria-hidden />
        <h2 className="mt-4 text-2xl font-black text-emerald-900 dark:text-emerald-100">
          আপনার অনুরোধ পেয়েছি
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-emerald-800 dark:text-emerald-200">
          আমাদের টিম আপনার চাহিদা দেখে উপযুক্ত শিক্ষক বাছাই করে <strong>{contactPhone}</strong> নম্বরে যোগাযোগ করবে।
          সাধারণত ২৪ ঘণ্টার মধ্যে সাড়া দেওয়া হয়।
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/register" className={buttonStyles()}>
            অ্যাকাউন্ট খুলুন — নিজেই শিক্ষক বাছুন
          </Link>
          <Link href="/teachers" className={buttonStyles({ variant: "outline" })}>
            এখনই শিক্ষক দেখুন
          </Link>
        </div>
        <p className="mt-5 text-xs leading-6 text-emerald-700 dark:text-emerald-300">
          অ্যাকাউন্ট খুললে একই ফোন নম্বর দিয়ে এই অনুরোধটি আপনার ড্যাশবোর্ডে যুক্ত করা যাবে।
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <Alert variant="danger">{error}</Alert>}

      <fieldset className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <legend className="px-2 text-sm font-bold text-slate-900 dark:text-slate-100">১. কী পড়াতে হবে</legend>

        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <FormField label="ক্লাস" htmlFor="lead-class" required>
            <Select id="lead-class" value={classLevel} onChange={(e) => setClassLevel(e.target.value)} required>
              <option value="">ক্লাস বাছুন</option>
              {CLASS_LEVELS.map((value) => <option key={value} value={value}>{value}</option>)}
            </Select>
          </FormField>

          <FormField label="পড়ানোর মাধ্যম" htmlFor="lead-mode" required>
            <Select
              id="lead-mode"
              value={teachingMode}
              onChange={(e) => setTeachingMode(e.target.value as "online" | "offline" | "both")}
            >
              {TEACHING_MODES.map((value) => <option key={value.value} value={value.value}>{value.label}</option>)}
            </Select>
          </FormField>
        </div>

        <div className="mt-4">
          <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
            বিষয় <span className="text-red-500" aria-hidden>*</span>
            <span className="ml-1 text-xs font-normal text-slate-500 dark:text-slate-400">(সর্বোচ্চ ৮টি)</span>
          </p>
          <CheckboxGroup options={SUBJECTS} selected={subjects} onChange={setSubjects} columns={3} />
        </div>
      </fieldset>

      <fieldset className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <legend className="px-2 text-sm font-bold text-slate-900 dark:text-slate-100">২. কোথায় ও কখন</legend>

        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <FormField label="জেলা" htmlFor="lead-district" hint="অনলাইনে পড়াতে চাইলে খালি রাখতে পারেন।">
            <Select id="lead-district" value={district} onChange={(e) => setDistrict(e.target.value)}>
              <option value="">জেলা বাছুন</option>
              {DISTRICTS.map((value) => <option key={value} value={value}>{value}</option>)}
            </Select>
          </FormField>

          <FormField label="এলাকা" htmlFor="lead-area" hint="থানা/উপজেলা লিখলে কাছের শিক্ষক পাওয়া সহজ হয়।">
            <Input id="lead-area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="যেমন: সদর" maxLength={80} />
          </FormField>

          <FormField label="পছন্দের সময়" htmlFor="lead-time">
            <Select id="lead-time" value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)}>
              <option value="">যেকোনো সময়</option>
              {TIME_SLOTS.map((value) => <option key={value} value={value}>{value}</option>)}
            </Select>
          </FormField>

          <FormField label="মাসিক বাজেট (৳)" htmlFor="lead-budget" hint="আনুমানিক দিলেই হবে — আলোচনা সাপেক্ষ।">
            <Input id="lead-budget" type="number" min={0} max={1000000} value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="যেমন: 4000" />
          </FormField>
        </div>

        <div className="mt-4">
          <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">পছন্দের দিন</p>
          <CheckboxGroup options={WEEK_DAYS} selected={preferredDays} onChange={setPreferredDays} columns={4} />
        </div>
      </fieldset>

      <fieldset className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <legend className="px-2 text-sm font-bold text-slate-900 dark:text-slate-100">৩. আপনার যোগাযোগ</legend>

        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <FormField label="আপনার নাম" htmlFor="lead-name" required>
            <Input id="lead-name" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="পূর্ণ নাম" required minLength={2} maxLength={80} autoComplete="name" />
          </FormField>

          <FormField label="মোবাইল নম্বর" htmlFor="lead-phone" required hint="এই নম্বরে আমরা কল বা WhatsApp করব।">
            <Input id="lead-phone" type="tel" inputMode="numeric" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="01712345678" required autoComplete="tel" />
          </FormField>

          <FormField label="ইমেইল" htmlFor="lead-email" hint="ঐচ্ছিক।" className="sm:col-span-2">
            <Input id="lead-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="you@example.com" maxLength={160} autoComplete="email" />
          </FormField>
        </div>

        <FormField label="বিস্তারিত" htmlFor="lead-note" hint="শিক্ষকের লিঙ্গ, অভিজ্ঞতা বা অন্য কোনো চাহিদা থাকলে লিখুন।" className="mt-4">
          <Textarea id="lead-note" value={note} onChange={(e) => setNote(e.target.value)} rows={4} maxLength={1000} placeholder="যেমন: মহিলা শিক্ষক প্রয়োজন, সপ্তাহে ৩ দিন।" />
        </FormField>

        {/* Honeypot — স্ক্রিন রিডার ও কীবোর্ড থেকে সম্পূর্ণ লুকানো, শুধু বট পূরণ করে। */}
        <div aria-hidden className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
          <label htmlFor="lead-website">Website</label>
          <input id="lead-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
      </fieldset>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
          পাঠানোর মাধ্যমে আপনি আমাদের{" "}
          <Link href="/privacy" className="font-medium underline">গোপনীয়তা নীতি</Link> ও{" "}
          <Link href="/terms" className="font-medium underline">শর্তাবলি</Link> মেনে নিচ্ছেন।
        </p>
        <Button type="submit" size="lg" loading={pending} className="shrink-0">
          <Send className="h-4 w-4" aria-hidden />
          অনুরোধ পাঠান
        </Button>
      </div>
    </form>
  );
}
