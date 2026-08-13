"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTeacherProfile } from "@/features/profile/actions";
import {
  CLASS_LEVELS,
  SUBJECTS,
  TEACHING_MODES,
  TIME_SLOTS,
  WEEK_DAYS,
} from "@/config/options";
import { type TeacherProfile } from "@/types/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { CheckboxGroup } from "@/components/ui/checkbox-group";
import { Alert } from "@/components/ui/alert";

export function TeacherProfileForm({ data }: { data: TeacherProfile | null }) {
  const router = useRouter();

  const [headline, setHeadline] = useState(data?.headline ?? "");
  const [education, setEducation] = useState(data?.education ?? "");
  const [institution, setInstitution] = useState(data?.institution ?? "");
  const [subjects, setSubjects] = useState<string[]>(data?.subjects ?? []);
  const [qualifications, setQualifications] = useState(
    (data?.qualifications ?? []).join(", "),
  );
  const [classes, setClasses] = useState<string[]>(data?.classes_taught ?? []);
  const [experience, setExperience] = useState(
    data?.experience_years != null ? String(data.experience_years) : "",
  );
  const [mode, setMode] = useState(data?.teaching_mode ?? "");
  const [area, setArea] = useState(data?.teaching_area ?? "");
  const [salary, setSalary] = useState(
    data?.expected_salary != null ? String(data.expected_salary) : "",
  );
  const [days, setDays] = useState<string[]>(data?.available_days ?? []);
  const [time, setTime] = useState(data?.available_time ?? "");
  const [bio, setBio] = useState(data?.bio ?? "");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const qualificationsArray = qualifications
      .split(",")
      .map((q) => q.trim())
      .filter(Boolean);

    setSaving(true);
    const result = await updateTeacherProfile({
      headline: headline || undefined,
      education,
      institution: institution || undefined,
      subjects,
      qualifications: qualificationsArray,
      classesTaught: classes,
      experienceYears: experience || undefined,
      teachingMode: mode,
      teachingArea: area || undefined,
      expectedSalary: salary || undefined,
      availableDays: days,
      availableTime: time || undefined,
      bio: bio || undefined,
    });
    setSaving(false);

    if (!result.ok) {
      setMessage({ type: "danger", text: result.error });
      return;
    }
    setMessage({ type: "success", text: "Teacher profile saved." });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {message && <Alert variant={message.type}>{message.text}</Alert>}

      <FormField label="Headline" htmlFor="headline">
        <Input
          id="headline"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="e.g. Experienced Math & Physics teacher"
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Education" htmlFor="education" required>
          <Input
            id="education"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder="e.g. B.Sc. in Mathematics"
          />
        </FormField>
        <FormField label="Institution" htmlFor="institution">
          <Input
            id="institution"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="University / college"
          />
        </FormField>
      </div>

      <FormField label="Qualifications" htmlFor="qualifications" hint="Comma separated.">
        <Input
          id="qualifications"
          value={qualifications}
          onChange={(e) => setQualifications(e.target.value)}
          placeholder="e.g. M.Sc. Mathematics, B.Ed."
        />
      </FormField>

      <FormField label="Subjects" required>
        <CheckboxGroup options={SUBJECTS} selected={subjects} onChange={setSubjects} columns={3} />
      </FormField>

      <FormField label="Classes you teach" required>
        <CheckboxGroup options={CLASS_LEVELS} selected={classes} onChange={setClasses} columns={3} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Experience (years)" htmlFor="experience">
          <Input
            id="experience"
            type="number"
            min={0}
            max={80}
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="e.g. 5"
          />
        </FormField>
        <FormField label="Expected salary (৳ / month)" htmlFor="salary">
          <Input
            id="salary"
            type="number"
            min={0}
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="e.g. 8000"
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Teaching mode" htmlFor="mode" required>
          <Select id="mode" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="">Select mode</option>
            {TEACHING_MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Teaching area" htmlFor="area">
          <Input
            id="area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="e.g. Sunamganj town, Sylhet"
          />
        </FormField>
      </div>

      <FormField label="Available days">
        <CheckboxGroup options={WEEK_DAYS} selected={days} onChange={setDays} columns={4} />
      </FormField>

      <FormField label="Available time" htmlFor="time">
        <Select id="time" value={time} onChange={(e) => setTime(e.target.value)}>
          <option value="">Flexible</option>
          {TIME_SLOTS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Bio" htmlFor="bio">
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell students and guardians about your teaching style…"
        />
      </FormField>

      <div className="flex justify-end border-t border-slate-100 pt-5">
        <Button type="submit" loading={saving}>
          Save teacher profile
        </Button>
      </div>
    </form>
  );
}
