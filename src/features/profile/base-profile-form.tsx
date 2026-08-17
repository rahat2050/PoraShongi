"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { updateBaseProfile } from "@/features/profile/actions";
import { isCloudinaryConfigured } from "@/lib/env";
import { uploadProfileImage } from "@/lib/cloudinary";
import { DISTRICTS } from "@/config/options";
import { type Profile } from "@/types/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";

export function BaseProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [district, setDistrict] = useState(profile.district ?? "");
  const [area, setArea] = useState(profile.area ?? "");
  const [gender, setGender] = useState(profile.gender ?? "");
  const [isMinor, setIsMinor] = useState(profile.is_minor ?? false);
  const [guardianConsent, setGuardianConsent] = useState(profile.guardian_consent ?? false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const cloudinaryReady = isCloudinaryConfigured();

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const result = await uploadProfileImage(file);
    setUploading(false);
    if (result.ok) {
      setAvatarUrl(result.url);
      toast("ছবি আপলোড হয়েছে—সেভ করলে প্রোফাইলে যুক্ত হবে", "success");
    } else {
      toast(result.error, "danger");
    }
    event.target.value = "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const result = await updateBaseProfile({
      fullName,
      district: district || undefined,
      area: area || undefined,
      gender: gender || undefined,
      isMinor,
      guardianConsent,
      avatarUrl: avatarUrl || undefined,
    });
    setSaving(false);
    if (!result.ok) {
      toast(result.error, "danger");
      return;
    }
    toast("প্রোফাইল আপডেট হয়েছে", "success");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-4">
        <Avatar src={avatarUrl} name={fullName} size="xl" />
        <div className="flex-1 space-y-2">
          {cloudinaryReady && (
            <>
              <input ref={fileRef} id="profile-photo" name="profilePhoto" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} aria-label="প্রোফাইল ছবি নির্বাচন করুন" />
              <Button type="button" variant="outline" size="sm" loading={uploading} onClick={() => fileRef.current?.click()}>
                <Camera className="h-4 w-4" aria-hidden /> ছবি আপলোড
              </Button>
            </>
          )}
          <FormField label="অথবা ছবির URL" htmlFor="avatar-url">
            <Input id="avatar-url" name="avatarUrl" type="url" placeholder="https://…/avatar.jpg" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
          </FormField>
        </div>
      </div>

      <FormField label="পুরো নাম" htmlFor="profile-full-name" required>
        <Input id="profile-full-name" name="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="আপনার নাম" minLength={2} maxLength={100} required />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="জেলা" htmlFor="profile-district">
          <Select id="profile-district" name="district" value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="">জেলা বাছুন</option>
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </Select>
        </FormField>
        <FormField label="এলাকা (থানা/উপজেলা)" htmlFor="profile-area">
          <Input id="profile-area" name="area" placeholder="যেমন: সুনামগঞ্জ সদর" value={area} onChange={(e) => setArea(e.target.value)} maxLength={120} />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="লিঙ্গ" htmlFor="profile-gender">
          <Select id="profile-gender" name="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">বলতে চাই না</option>
            <option value="male">পুরুষ</option>
            <option value="female">মহিলা</option>
          </Select>
        </FormField>
        {profile.role === "student" && (
          <FormField label="নাবালক সুরক্ষা" hint="১৮ বছরের কম হলে টিক দিন—লোকেশন প্রকাশ করা হবে না।">
            <label className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm text-slate-700 dark:border-slate-600 dark:text-slate-200">
              <input type="checkbox" name="isMinor" checked={isMinor} onChange={(e) => setIsMinor(e.target.checked)} className="h-5 w-5 rounded border-slate-300 accent-brand-700" />
              আমি নাবালক (১৮ বছরের কম)
            </label>
          </FormField>
        )}
      </div>

      {profile.role === "student" && (
        <FormField label="অভিভাবকের সঙ্গে লিংক" hint="চালু করলে একজন নিবন্ধিত অভিভাবক আপনাকে তার অ্যাকাউন্টের সঙ্গে যুক্ত করতে পারবেন। যেকোনো সময় বন্ধ করা যাবে।">
          <label className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:text-slate-200">
            <input
              type="checkbox"
              name="guardianConsent"
              checked={guardianConsent}
              onChange={(event) => setGuardianConsent(event.target.checked)}
              className="h-5 w-5 shrink-0 rounded border-slate-300 accent-brand-700"
            />
            অভিভাবক লিংক করার অনুমতি দিচ্ছি
          </label>
        </FormField>
      )}

      <div className="flex justify-end border-t border-slate-100 pt-5 dark:border-slate-700">
        <Button type="submit" loading={saving}>সেভ করুন</Button>
      </div>
    </form>
  );
}
