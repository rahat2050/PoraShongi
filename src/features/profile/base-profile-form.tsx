"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ExternalLink, HardDrive, Link2, Trash2 } from "lucide-react";
import { updateBaseProfile } from "@/features/profile/actions";
import { DISTRICTS } from "@/config/options";
import { normalizeProfileImageUrl, PROFILE_IMAGE_URL_MAX_LENGTH } from "@/lib/profile-image-url";
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
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [district, setDistrict] = useState(profile.district ?? "");
  const [area, setArea] = useState(profile.area ?? "");
  const [gender, setGender] = useState(profile.gender ?? "");
  const [isMinor, setIsMinor] = useState(profile.is_minor ?? false);
  const [guardianConsent, setGuardianConsent] = useState(profile.guardian_consent ?? false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [saving, setSaving] = useState(false);

  const imageResult = useMemo(
    () => avatarUrl.trim() ? normalizeProfileImageUrl(avatarUrl) : null,
    [avatarUrl],
  );
  const previewUrl = imageResult?.ok ? imageResult.url : null;
  const imageError = imageResult && !imageResult.ok ? imageResult.error : null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (imageError) {
      toast(imageError, "danger");
      return;
    }

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
    if (imageResult?.ok) setAvatarUrl(imageResult.url);
    toast("প্রোফাইল আপডেট হয়েছে", "success");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section className="rounded-2xl border border-brand-200 bg-brand-50/60 p-4 dark:border-brand-800 dark:bg-brand-950/30" aria-labelledby="external-photo-title">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="shrink-0 text-center">
            <Avatar src={previewUrl} name={fullName} size="xl" className="ring-4 ring-white shadow-md dark:ring-slate-800" />
            <p className="mt-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">লাইভ প্রিভিউ</p>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="external-photo-title" className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
                  <Link2 className="h-4 w-4 text-brand-700 dark:text-brand-300" aria-hidden />
                  বাইরের ছবির লিংক
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                  ছবি এখানে আপলোড হবে না—শুধু লিংকটি সংরক্ষিত হবে।
                </p>
              </div>
              <a
                href="https://drive.google.com/drive/my-drive"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-brand-300 bg-white px-3 text-xs font-bold text-brand-800 transition-colors hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:border-brand-700 dark:bg-slate-900 dark:text-brand-200 dark:hover:bg-brand-950"
              >
                Google Drive খুলুন <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            </div>

            <div className="mt-4 grid gap-2 text-xs text-slate-600 sm:grid-cols-3 dark:text-slate-300">
              {["ছবি Drive/Dropbox-এ দিন", "Sharing: Anyone with link", "Share link এখানে paste করুন"].map((step, index) => (
                <div key={step} className="flex items-start gap-2 rounded-xl border border-brand-100 bg-white/80 p-2.5 dark:border-brand-900 dark:bg-slate-900/70">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-700 text-[10px] font-bold text-white">{index + 1}</span>
                  <span className="leading-5">{step}</span>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <FormField
                label="প্রোফাইল ছবির লিংক"
                htmlFor="avatar-url"
                error={imageError}
                hint="Google Drive share link, Dropbox link অথবা যেকোনো public HTTPS image link দিন।"
              >
                <Input
                  id="avatar-url"
                  name="avatarUrl"
                  type="url"
                  inputMode="url"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="https://drive.google.com/file/d/.../view"
                  value={avatarUrl}
                  onChange={(event) => setAvatarUrl(event.target.value)}
                  maxLength={PROFILE_IMAGE_URL_MAX_LENGTH}
                  invalid={Boolean(imageError)}
                  aria-describedby={imageError ? "avatar-url-error" : "avatar-url-hint"}
                />
              </FormField>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {previewUrl && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  ছবির লিংক পরীক্ষা করুন <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              )}
              {avatarUrl && (
                <Button type="button" variant="ghost" size="sm" className="h-9 text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40" onClick={() => setAvatarUrl("")}>
                  <Trash2 className="h-3.5 w-3.5" aria-hidden /> ছবি সরান
                </Button>
              )}
            </div>

            <p className="mt-3 flex items-start gap-2 rounded-xl bg-brand-100/70 px-3 py-2 text-xs leading-5 text-brand-900 dark:bg-brand-950/70 dark:text-brand-100">
              <HardDrive className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              PoraSathi storage-এ কোনো image file রাখা হবে না; database-এ শুধু ছোট URL text থাকবে।
            </p>
            {previewUrl && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" aria-hidden /> লিংকটি গ্রহণযোগ্য—সেভ করলে প্রোফাইলে ব্যবহার হবে।
              </p>
            )}
          </div>
        </div>
      </section>

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
