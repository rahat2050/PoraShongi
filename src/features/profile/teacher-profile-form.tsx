"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTeacherProfile } from "@/features/profile/actions";
import { CLASS_LEVELS, SUBJECTS, TEACHING_MODES, TIME_SLOTS, WEEK_DAYS } from "@/config/options";
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
  const [qualifications, setQualifications] = useState((data?.qualifications ?? []).join(", "));
  const [classes, setClasses] = useState<string[]>(data?.classes_taught ?? []);
  const [experience, setExperience] = useState(data?.experience_years != null ? String(data.experience_years) : "");
  const [mode, setMode] = useState(data?.teaching_mode ?? "");
  const [area, setArea] = useState(data?.teaching_area ?? "");
  const [salary, setSalary] = useState(data?.expected_salary != null ? String(data.expected_salary) : "");
  const [days, setDays] = useState<string[]>(data?.available_days ?? []);
  const [time, setTime] = useState(data?.available_time ?? "");
  const [teachingStyle, setTeachingStyle] = useState(data?.teaching_style ?? "");
  const [languages, setLanguages] = useState((data?.languages ?? []).join(", "));
  const [bio, setBio] = useState(data?.bio ?? "");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    if (!education.trim() || subjects.length === 0 || classes.length === 0 || !mode) {
      setMessage({ type: "danger", text: "শিক্ষাগত যোগ্যতা, বিষয়, ক্লাস ও পড়ানোর মাধ্যম পূরণ করুন।" });
      return;
    }
    setSaving(true);
    const result = await updateTeacherProfile({
      headline: headline || undefined,
      education,
      institution: institution || undefined,
      subjects,
      qualifications: qualifications.split(",").map((q) => q.trim()).filter(Boolean),
      classesTaught: classes,
      experienceYears: experience || undefined,
      teachingMode: mode,
      teachingArea: area || undefined,
      expectedSalary: salary || undefined,
      availableDays: days,
      availableTime: time || undefined,
      teachingStyle: teachingStyle || undefined,
      languages: languages.split(",").map((l) => l.trim()).filter(Boolean),
      bio: bio || undefined,
    });
    setSaving(false);
    if (!result.ok) {
      setMessage({ type: "danger", text: result.error });
      return;
    }
    setMessage({ type: "success", text: "শিক্ষক প্রোফাইল সেভ হয়েছে।" });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {message && <Alert variant={message.type}>{message.text}</Alert>}

      <FormField label="হেডলাইন">
        <Input placeholder="যেমন: অভিজ্ঞ গণিত ও পদার্থবিজ্ঞান শিক্ষক" value={headline} onChange={(e) => setHeadline(e.target.value)} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="শিক্ষাগত যোগ্যতা" htmlFor="teacher-education" required>
          <Input id="teacher-education" name="education" placeholder="যেমন: গণিতে স্নাতক" value={education} onChange={(e) => setEducation(e.target.value)} maxLength={160} required />
        </FormField>
        <FormField label="প্রতিষ্ঠান">
          <Input placeholder="বিশ্ববিদ্যালয়/কলেজ" value={institution} onChange={(e) => setInstitution(e.target.value)} />
        </FormField>
      </div>

      <FormField label="অতিরিক্ত যোগ্যতা (কমা দিয়ে আলাদা)" hint="যেমন: এমএসসি গণিত, বিএড">
        <Input value={qualifications} onChange={(e) => setQualifications(e.target.value)} />
      </FormField>

      <FormField label="বিষয়" required>
        <CheckboxGroup options={SUBJECTS} selected={subjects} onChange={setSubjects} columns={3} />
      </FormField>

      <FormField label="যে ক্লাস পড়ান" required>
        <CheckboxGroup options={CLASS_LEVELS} selected={classes} onChange={setClasses} columns={3} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="অভিজ্ঞতা (বছর)">
          <Input type="number" min={0} max={80} placeholder="যেমন: 5" value={experience} onChange={(e) => setExperience(e.target.value)} />
        </FormField>
        <FormField label="প্রত্যাশিত বেতন (৳/মাস)">
          <Input type="number" min={0} placeholder="যেমন: 8000" value={salary} onChange={(e) => setSalary(e.target.value)} />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="পড়ানোর মাধ্যম" htmlFor="teacher-mode" required>
          <Select id="teacher-mode" name="teachingMode" value={mode} onChange={(e) => setMode(e.target.value)} required>
            <option value="">মাধ্যম বাছুন</option>
            {TEACHING_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </Select>
        </FormField>
        <FormField label="পড়ানোর এলাকা">
          <Input placeholder="যেমন: সুনামগঞ্জ শহর" value={area} onChange={(e) => setArea(e.target.value)} />
        </FormField>
      </div>

      <FormField label="যে দিন ফ্রি">
        <CheckboxGroup options={WEEK_DAYS} selected={days} onChange={setDays} columns={4} />
      </FormField>

      <FormField label="যে সময় ফ্রি">
        <Select value={time} onChange={(e) => setTime(e.target.value)}>
          <option value="">যেকোনো সময়</option>
          {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
      </FormField>

      <FormField label="পড়ানোর ধরণ">
        <Textarea placeholder="যেমন: ধৈর্য ধরে বুঝিয়ে পড়াই, নিয়মিত প্র্যাকটিস করাই…" value={teachingStyle} onChange={(e) => setTeachingStyle(e.target.value)} rows={2} />
      </FormField>

      <FormField label="পড়ানোর ভাষা (কমা দিয়ে আলাদা)" hint="যেমন: বাংলা, ইংরেজি">
        <Input placeholder="বাংলা, ইংরেজি" value={languages} onChange={(e) => setLanguages(e.target.value)} />
      </FormField>

      <FormField label="বায়ো">
        <Textarea placeholder="আপনার পড়ানোর পদ্ধতি সম্পর্কে লিখুন…" value={bio} onChange={(e) => setBio(e.target.value)} />
      </FormField>

      <div className="flex justify-end border-t border-slate-100 pt-5">
        <Button type="submit" loading={saving}>সেভ করুন</Button>
      </div>
    </form>
  );
}
