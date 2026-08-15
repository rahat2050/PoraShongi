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
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {error && <Alert variant="danger">{error}</Alert>}

      <FormField label="টাইটেল" htmlFor="title" required>
        <Input id="title" placeholder="যেমন: Class 8-এর জন্য Math শিক্ষক দরকার" value={title} onChange={(e) => setTitle(e.target.value)} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="ক্লাস" required>
          <Select value={classLevel} onChange={(e) => setClassLevel(e.target.value)}>
            <option value="">ক্লাস বাছুন</option>
            {CLASS_LEVELS.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </FormField>
        <FormField label="বিষয়" required>
          <Select value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="">বিষয় বাছুন</option>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="জেলা">
          <Select value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="">জেলা বাছুন</option>
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </Select>
        </FormField>
        <FormField label="এলাকা (থানা/উপজেলা)">
          <Input placeholder="যেমন: Sunamganj Sadar" value={area} onChange={(e) => setArea(e.target.value)} />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="বাজেট (৳/মাস)">
          <Input type="number" min={0} placeholder="যেমন: 5000" value={budget} onChange={(e) => setBudget(e.target.value)} />
        </FormField>
        <label className="flex h-11 items-center gap-2 self-end px-1 text-sm text-slate-700">
          <input type="checkbox" checked={budgetNegotiable} onChange={(e) => setBudgetNegotiable(e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-brand-600" />
          বাজেট আলোচনা সাপেক্ষ
        </label>
      </div>

      <FormField label="মোড" required>
        <Select value={teachingMode} onChange={(e) => setTeachingMode(e.target.value)}>
          {TEACHING_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </Select>
      </FormField>

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
        <Textarea placeholder="নির্দিষ্ট চাহিদা, topic, নোট…" value={requirements} onChange={(e) => setRequirements(e.target.value)} />
      </FormField>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-5">
        <Button variant="outline" type="button" onClick={() => router.back()}>বাতিল</Button>
        <Button type="submit" loading={pending}>{isEdit ? "সেভ করুন" : "Tuition তৈরি করুন"}</Button>
      </div>
    </form>
  );
}
