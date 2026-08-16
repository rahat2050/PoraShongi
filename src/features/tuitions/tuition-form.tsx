"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTuition, updateTuition, type TuitionFormInput } from "@/features/tuitions/actions";
import { CLASS_LEVELS, DISTRICTS, SUBJECTS, TEACHING_MODES, TIME_SLOTS, WEEK_DAYS } from "@/config/options";
import { type Tuition } from "@/types/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { CheckboxGroup } from "@/components/ui/checkbox-group";
import { Alert } from "@/components/ui/alert";

function fromTuition(t: Tuition | null) {
  return {
    title: t?.title ?? "",
    classLevel: t?.class_level ?? "",
    subject: t?.subject ?? "",
    district: t?.district ?? "",
    area: t?.area ?? "",
    budget: t?.budget != null ? String(t.budget) : "",
    budgetNegotiable: t?.budget_negotiable ?? false,
    teachingMode: t?.teaching_mode ?? "offline",
    preferredDays: t?.preferred_days ?? [],
    preferredTime: t?.preferred_time ?? "",
    requirements: t?.requirements ?? "",
    isBatch: t?.is_batch ?? false,
    batchSize: t?.batch_size != null ? String(t.batch_size) : "",
  };
}

export function TuitionForm({ tuition }: { tuition?: Tuition | null }) {
  const router = useRouter();
  const initial = fromTuition(tuition ?? null);
  const isEdit = Boolean(tuition);

  const [title, setTitle] = useState(initial.title);
  const [classLevel, setClassLevel] = useState(initial.classLevel);
  const [subject, setSubject] = useState(initial.subject);
  const [district, setDistrict] = useState(initial.district);
  const [area, setArea] = useState(initial.area);
  const [budget, setBudget] = useState(initial.budget);
  const [budgetNegotiable, setBudgetNegotiable] = useState(initial.budgetNegotiable);
  const [teachingMode, setTeachingMode] = useState(initial.teachingMode);
  const [preferredDays, setPreferredDays] = useState<string[]>(initial.preferredDays);
  const [preferredTime, setPreferredTime] = useState(initial.preferredTime);
  const [requirements, setRequirements] = useState(initial.requirements);
  const [isBatch, setIsBatch] = useState(initial.isBatch);
  const [batchSize, setBatchSize] = useState(initial.batchSize);

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const payload: TuitionFormInput = {
      title,
      classLevel,
      subject,
      district: district || undefined,
      area: area || undefined,
      budget: budget ? Number(budget) : null,
      budgetNegotiable,
      teachingMode,
      preferredDays,
      preferredTime: preferredTime || undefined,
      requirements: requirements || undefined,
      isBatch,
      batchSize: isBatch && batchSize ? Number(batchSize) : null,
    };

    setPending(true);
    const result = isEdit && tuition ? await updateTuition(tuition.id, payload) : await createTuition(payload);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    if (isEdit && tuition) {
      router.push(`/dashboard/tuitions/${tuition.id}`);
    } else {
      router.push("/dashboard/tuitions");
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <Alert variant="danger">{error}</Alert>}

      <FormField label="শিরোনাম" htmlFor="tuition-title" required>
        <Input id="tuition-title" name="title" placeholder="যেমন: অষ্টম শ্রেণির জন্য গণিত শিক্ষক দরকার" value={title} onChange={(e) => setTitle(e.target.value)} minLength={3} maxLength={140} required />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="ক্লাস" htmlFor="tuition-class" required>
          <Select id="tuition-class" name="classLevel" value={classLevel} onChange={(e) => setClassLevel(e.target.value)} required>
            <option value="">ক্লাস বাছুন</option>
            {CLASS_LEVELS.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </FormField>
        <FormField label="বিষয়" htmlFor="tuition-subject" required>
          <Select id="tuition-subject" name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required>
            <option value="">বিষয় বাছুন</option>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="জেলা" htmlFor="tuition-district" required={teachingMode !== "online"}>
          <Select id="tuition-district" name="district" value={district} onChange={(e) => setDistrict(e.target.value)} required={teachingMode !== "online"}>
            <option value="">জেলা বাছুন</option>
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </Select>
        </FormField>
        <FormField label="এলাকা (থানা/উপজেলা)">
          <Input placeholder="যেমন: সুনামগঞ্জ সদর" value={area} onChange={(e) => setArea(e.target.value)} />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="বাজেট (৳/মাস)">
          <Input type="number" min={0} placeholder="যেমন: 5000" value={budget} onChange={(e) => setBudget(e.target.value)} />
        </FormField>
        <label className="flex h-11 items-center gap-2 self-end px-1 text-sm text-slate-700 dark:text-slate-200">
          <input type="checkbox" name="budgetNegotiable" checked={budgetNegotiable} onChange={(e) => setBudgetNegotiable(e.target.checked)} className="h-5 w-5 rounded border-slate-300 accent-brand-700" />
          বাজেট আলোচনা সাপেক্ষ
        </label>
      </div>

      <FormField label="পড়ানোর মাধ্যম" htmlFor="tuition-mode" required>
        <Select id="tuition-mode" name="teachingMode" value={teachingMode} onChange={(e) => setTeachingMode(e.target.value)} required>
          {TEACHING_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </Select>
      </FormField>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <input type="checkbox" name="isBatch" checked={isBatch} onChange={(e) => setIsBatch(e.target.checked)} className="h-5 w-5 rounded border-slate-300 accent-brand-700" />
          এটি ব্যাচ টিউশন (একসঙ্গে একাধিক শিক্ষার্থী)
        </label>
        {isBatch && (
          <div className="mt-3">
            <FormField label="সর্বোচ্চ শিক্ষার্থী (সিট)" htmlFor="tuition-batch-size" hint="২–২০০" required>
              <Input id="tuition-batch-size" name="batchSize" type="number" min={2} max={200} placeholder="যেমন: ১০" value={batchSize} onChange={(e) => setBatchSize(e.target.value)} required />
            </FormField>
          </div>
        )}
      </div>

      <FormField label="পছন্দের দিন">
        <CheckboxGroup options={WEEK_DAYS} selected={preferredDays} onChange={setPreferredDays} columns={4} />
      </FormField>

      <FormField label="পছন্দের সময়">
        <Select value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)}>
          <option value="">যেকোনো সময়</option>
          {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
      </FormField>

      <FormField label="চাহিদা / শর্তাবলি">
        <Textarea placeholder="নির্দিষ্ট চাহিদা, বিষয়বস্তু ও অন্যান্য তথ্য…" value={requirements} onChange={(e) => setRequirements(e.target.value)} />
      </FormField>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-5">
        <Button variant="outline" type="button" onClick={() => router.back()}>বাতিল</Button>
        <Button type="submit" loading={pending}>{isEdit ? "সেভ করুন" : "টিউশন তৈরি করুন"}</Button>
      </div>
    </form>
  );
}
