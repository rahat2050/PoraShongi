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
      toast("ছবি upload হয়েছে — সেভ করলে প্রোফাইলে বসবে", "success");
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
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="flex items-center gap-4">
        <Avatar src={avatarUrl} name={fullName} size="xl" />
        <div className="flex-1 space-y-2">
          {cloudinaryReady && (
            <>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
              <Button type="button" variant="outline" size="sm" loading={uploading} onClick={() => fileRef.current?.click()}>
                <Camera className="h-4 w-4" aria-hidden /> ছবি upload
              </Button>
            </>
          )}
          <FormField label="অথবা ছবির URL">
            <Input placeholder="https://…/avatar.jpg" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
          </FormField>
        </div>
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
