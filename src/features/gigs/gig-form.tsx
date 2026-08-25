"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGig, updateGig, type GigFormInput } from "@/features/gigs/actions";
import { CLASS_LEVELS, SUBJECTS, TEACHING_MODES } from "@/config/options";
import type { TutorGigOwn } from "@/types/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { CheckboxGroup } from "@/components/ui/checkbox-group";
import { Alert } from "@/components/ui/alert";

function fromGig(gig: TutorGigOwn | null) {
  return {
    title: gig?.title ?? "",
    description: gig?.description ?? "",
    subjects: gig?.subjects ?? [],
    classLevels: gig?.class_levels ?? [],
    teachingMode: gig?.teaching_mode ?? "online",
    durationWeeks: gig?.duration_weeks != null ? String(gig.duration_weeks) : "8",
    sessionsPerWeek: gig?.sessions_per_week != null ? String(gig.sessions_per_week) : "2",
    price: gig?.price != null ? String(gig.price) : "",
    includesTrial: gig?.includes_trial ?? false,
    publish: gig ? gig.status === "published" : true,
  };
}

export function GigForm({ gig }: { gig?: TutorGigOwn | null }) {
  const router = useRouter();
  const initial = fromGig(gig ?? null);
  const isEdit = Boolean(gig);

  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [subjects, setSubjects] = useState<string[]>(initial.subjects);
  const [classLevels, setClassLevels] = useState<string[]>(initial.classLevels);
  const [teachingMode, setTeachingMode] = useState(initial.teachingMode);
  const [durationWeeks, setDurationWeeks] = useState(initial.durationWeeks);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(initial.sessionsPerWeek);
  const [price, setPrice] = useState(initial.price);
  const [includesTrial, setIncludesTrial] = useState(initial.includesTrial);
  const [publish, setPublish] = useState(initial.publish);

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const weeks = Number(durationWeeks) || 0;
  const perWeek = Number(sessionsPerWeek) || 0;
  const totalSessions = weeks > 0 && perWeek > 0 ? weeks * perWeek : 0;
  const perSession = totalSessions > 0 && Number(price) > 0 ? Math.round(Number(price) / totalSessions) : 0;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const payload: GigFormInput = {
      title,
      description,
      subjects,
      classLevels,
      teachingMode,
      durationWeeks,
      sessionsPerWeek,
      price,
      includesTrial,
      publish,
    };

    const result = isEdit && gig ? await updateGig(gig.id, payload) : await createGig(payload);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/dashboard/gigs");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
      {error ? <Alert variant="danger">{error}</Alert> : null}

      <FormField label="প্যাকেজের শিরোনাম" htmlFor="gig-title" required hint="উদাহরণ: এইচএসসি পদার্থবিজ্ঞান — ৮ সপ্তাহের সম্পূর্ণ প্রস্তুতি">
        <Input
          id="gig-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          placeholder="যা পড়াবেন তা সংক্ষেপে"
        />
      </FormField>

      <FormField
        label="বিস্তারিত"
        htmlFor="gig-description"
        required
        hint="কী কী পড়ানো হবে, কীভাবে, কীসহ (নোট, পরীক্ষা, সন্দেহ নিরসন) — কমপক্ষে ২০ অক্ষর।"
      >
        <Textarea
          id="gig-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={6}
          maxLength={2000}
          placeholder="পাঠ্যক্রম, পড়ানোর ধরন ও যা যা অন্তর্ভুক্ত"
        />
      </FormField>

      <FormField label="বিষয়" htmlFor="gig-subjects" required>
        <CheckboxGroup options={SUBJECTS} selected={subjects} onChange={setSubjects} columns={3} />
      </FormField>

      <FormField label="ক্লাস" htmlFor="gig-classes" required>
        <CheckboxGroup options={CLASS_LEVELS} selected={classLevels} onChange={setClassLevels} columns={4} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-3">
        <FormField label="পড়ানোর ধরন" htmlFor="gig-mode" required>
          <Select id="gig-mode" value={teachingMode} onChange={(event) => setTeachingMode(event.target.value)}>
            {TEACHING_MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="সময়কাল (সপ্তাহ)" htmlFor="gig-weeks" required>
          <Input
            id="gig-weeks"
            type="number"
            min={1}
            max={104}
            value={durationWeeks}
            onChange={(event) => setDurationWeeks(event.target.value)}
          />
        </FormField>

        <FormField label="সপ্তাহে ক্লাস" htmlFor="gig-sessions" required>
          <Input
            id="gig-sessions"
            type="number"
            min={1}
            max={14}
            value={sessionsPerWeek}
            onChange={(event) => setSessionsPerWeek(event.target.value)}
          />
        </FormField>
      </div>

      <FormField
        label="প্যাকেজ মূল্য (৳)"
        htmlFor="gig-price"
        required
        hint={
          totalSessions > 0
            ? `মোট ${totalSessions}টি ক্লাস${perSession > 0 ? ` · প্রতি ক্লাসে প্রায় ৳${perSession}` : ""}`
            : "সম্পূর্ণ প্যাকেজের মূল্য লিখুন, প্রতি ঘণ্টার নয়।"
        }
      >
        <Input
          id="gig-price"
          type="number"
          min={0}
          max={5000000}
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          placeholder="যেমন: 6000"
        />
      </FormField>

      <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
        <input
          type="checkbox"
          checked={includesTrial}
          onChange={(event) => setIncludesTrial(event.target.checked)}
          className="mt-1 h-5 w-5 rounded border-slate-300 accent-brand-600"
        />
        <span className="text-sm leading-6 text-slate-700 dark:text-slate-200">
          প্রথম ক্লাসটি ফ্রি ট্রায়াল হিসেবে দেব
          <span className="block text-xs text-slate-500 dark:text-slate-400">
            অভিভাবক প্রথমে দেখে নিতে চান — ট্রায়াল থাকলে সাড়া বেশি মেলে।
          </span>
        </span>
      </label>

      <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
        <input
          type="checkbox"
          checked={publish}
          onChange={(event) => setPublish(event.target.checked)}
          className="mt-1 h-5 w-5 rounded border-slate-300 accent-brand-600"
        />
        <span className="text-sm leading-6 text-slate-700 dark:text-slate-200">
          সবার জন্য প্রকাশ করুন
          <span className="block text-xs text-slate-500 dark:text-slate-400">
            না চেক করলে খসড়া হিসেবে থাকবে — শুধু আপনি দেখতে পাবেন।
          </span>
        </span>
      </label>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "সংরক্ষণ হচ্ছে…" : isEdit ? "আপডেট করুন" : "প্যাকেজ তৈরি করুন"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/gigs")}>
          বাতিল
        </Button>
      </div>
    </form>
  );
}
