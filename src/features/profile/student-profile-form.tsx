"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStudentProfile } from "@/features/profile/actions";
import { CLASS_LEVELS, GROUPS, SUBJECTS, TEACHING_MODES, TIME_SLOTS, WEEK_DAYS } from "@/config/options";
import { type StudentProfile } from "@/types/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { CheckboxGroup } from "@/components/ui/checkbox-group";
import { Alert } from "@/components/ui/alert";

export function StudentProfileForm({ data }: { data: StudentProfile | null }) {
  const router = useRouter();
  const [grade, setGrade] = useState(data?.grade ?? "");
  const [studentGroup, setStudentGroup] = useState(data?.student_group ?? "");
  const [institution, setInstitution] = useState(data?.institution ?? "");
  const [subjects, setSubjects] = useState<string[]>(data?.subjects_of_interest ?? []);
  const [mode, setMode] = useState(data?.teaching_mode_preference ?? "");
  const [budget, setBudget] = useState(data?.budget != null ? String(data.budget) : "");
  const [days, setDays] = useState<string[]>(data?.preferred_days ?? []);
  const [time, setTime] = useState(data?.preferred_time ?? "");
  const [bio, setBio] = useState(data?.bio ?? "");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setSaving(true);
    const result = await updateStudentProfile({
      grade,
      studentGroup: studentGroup || undefined,
      institution: institution || undefined,
      subjectsOfInterest: subjects,
      teachingModePreference: mode,
      budget: budget || undefined,
      preferredDays: days,
      preferredTime: time || undefined,
      bio: bio || undefined,
    });
    setSaving(false);
    if (!result.ok) {
      setMessage({ type: "danger", text: result.error });
      return;
    }
    setMessage({ type: "success", text: "শিক্ষার্থী প্রোফাইল সেভ হয়েছে।" });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {message && <Alert variant={message.type}>{message.text}</Alert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="ক্লাস" required>
          <Select value={grade} onChange={(e) => setGrade(e.target.value)}>
            <option value="">ক্লাস বাছুন</option>
            {CLASS_LEVELS.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </FormField>
        <FormField label="গ্রুপ">
          <Select value={studentGroup} onChange={(e) => setStudentGroup(e.target.value)}>
            <option value="">গ্রুপ বাছুন</option>
            {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
          </Select>
        </FormField>
      </div>

      <FormField label="শিক্ষাপ্রতিষ্ঠান">
        <Input placeholder="স্কুল/কলেজের নাম" value={institution} onChange={(e) => setInstitution(e.target.value)} />
      </FormField>

      <FormField label="আগ্রহের বিষয়">
        <CheckboxGroup options={SUBJECTS} selected={subjects} onChange={setSubjects} columns={3} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="মোড পছন্দ" required>
          <Select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="">মোড বাছুন</option>
            {TEACHING_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </Select>
        </FormField>
        <FormField label="বাজেট (৳/মাস)">
          <Input type="number" min={0} placeholder="যেমন: 4000" value={budget} onChange={(e) => setBudget(e.target.value)} />
        </FormField>
      </div>

      <FormField label="পছন্দের দিন">
        <CheckboxGroup options={WEEK_DAYS} selected={days} onChange={setDays} columns={4} />
      </FormField>

      <FormField label="পছন্দের সময়">
        <Select value={time} onChange={(e) => setTime(e.target.value)}>
          <option value="">যেকোনো সময়</option>
          {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
      </FormField>

      <FormField label="নিজের সম্পর্কে">
        <Textarea placeholder="ছোট্ট পরিচয়…" value={bio} onChange={(e) => setBio(e.target.value)} />
      </FormField>

      <div className="flex justify-end border-t border-slate-100 pt-5">
        <Button type="submit" loading={saving}>সেভ করুন</Button>
      </div>
    </form>
  );
}
