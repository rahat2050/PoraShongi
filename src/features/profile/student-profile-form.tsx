"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStudentProfile } from "@/features/profile/actions";
import {
  CLASS_LEVELS,
  GROUPS,
  SUBJECTS,
  TEACHING_MODES,
  TIME_SLOTS,
  WEEK_DAYS,
} from "@/config/options";
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
    setMessage({ type: "success", text: "Student profile saved." });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {message && <Alert variant={message.type}>{message.text}</Alert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Class" htmlFor="grade" required>
          <Select id="grade" value={grade} onChange={(e) => setGrade(e.target.value)}>
            <option value="">Select class</option>
            {CLASS_LEVELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Group" htmlFor="studentGroup">
          <Select
            id="studentGroup"
            value={studentGroup}
            onChange={(e) => setStudentGroup(e.target.value)}
          >
            <option value="">Select group</option>
            {GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="Institution" htmlFor="institution">
        <Input
          id="institution"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          placeholder="School / college name"
        />
      </FormField>

      <FormField label="Subjects of interest">
        <CheckboxGroup options={SUBJECTS} selected={subjects} onChange={setSubjects} columns={3} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Teaching mode preference" htmlFor="mode" required>
          <Select id="mode" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="">Select mode</option>
            {TEACHING_MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Budget (৳ / month)" htmlFor="budget">
          <Input
            id="budget"
            type="number"
            min={0}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. 5000"
          />
        </FormField>
      </div>

      <FormField label="Preferred days">
        <CheckboxGroup options={WEEK_DAYS} selected={days} onChange={setDays} columns={4} />
      </FormField>

      <FormField label="Preferred time" htmlFor="time">
        <Select id="time" value={time} onChange={(e) => setTime(e.target.value)}>
          <option value="">Flexible</option>
          {TIME_SLOTS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="About you" htmlFor="bio">
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A short introduction…"
        />
      </FormField>

      <div className="flex justify-end border-t border-slate-100 pt-5">
        <Button type="submit" loading={saving}>
          Save student profile
        </Button>
      </div>
    </form>
  );
}
