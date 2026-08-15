"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateBaseProfile } from "@/features/profile/actions";
import { DISTRICTS } from "@/config/options";
import { type Profile } from "@/types/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";

export function BaseProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [district, setDistrict] = useState(profile.district ?? "");
  const [area, setArea] = useState(profile.area ?? "");
  const [gender, setGender] = useState(profile.gender ?? "");
  const [isMinor, setIsMinor] = useState(profile.is_minor ?? false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setSaving(true);
    const result = await updateBaseProfile({
      fullName,
      district: district || undefined,
      area: area || undefined,
      gender: gender || undefined,
      isMinor,
      avatarUrl: avatarUrl || undefined,
    });
    setSaving(false);
    if (!result.ok) {
      setMessage({ type: "danger", text: result.error });
      return;
    }
    setMessage({ type: "success", text: "প্রোফাইল আপডেট হয়েছে।" });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {message && <Alert variant={message.type}>{message.text}</Alert>}

      <div className="flex items-center gap-4">
        <Avatar src={avatarUrl} name={fullName} size="xl" />
        <FormField label="ছবির URL" className="flex-1">
          <Input placeholder="https://…/avatar.jpg" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
        </FormField>
      </div>

      <FormField label="পুরো নাম" required>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="আপনার নাম" />
      </FormField>

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
        <FormField label="লিঙ্গ">
          <Select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">বলতে চাই না</option>
            <option value="male">পুরুষ</option>
            <option value="female">মহিলা</option>
          </Select>
        </FormField>
        {profile.role === "student" && (
          <FormField label="নাবালক সুরক্ষা" hint="১৮ বছরের কম হলে টিক দিন — location public হবে না।">
            <label className="flex h-11 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm text-slate-700">
              <input type="checkbox" checked={isMinor} onChange={(e) => setIsMinor(e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-brand-600" />
              আমি নাবালক (১৮ বছরের কম)
            </label>
          </FormField>
        )}
      </div>

      <div className="flex justify-end border-t border-slate-100 pt-5">
        <Button type="submit" loading={saving}>সেভ করুন</Button>
      </div>
    </form>
  );
}
