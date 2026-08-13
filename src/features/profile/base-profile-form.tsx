"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { isCloudinaryConfigured } from "@/lib/env";
import { buildOptimizedImageUrl, uploadProfileImage } from "@/lib/cloudinary";
import { updateBaseProfile } from "@/features/profile/actions";
import { type Profile } from "@/types/index";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";
import { Modal } from "@/components/ui/modal";

export function BaseProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null);

  const cloudinaryReady = isCloudinaryConfigured();

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage(null);
    const result = await uploadProfileImage(file);
    setUploading(false);
    if (result.ok) {
      setAvatarUrl(result.url);
      setMessage({ type: "success", text: "Avatar uploaded — save your profile to apply it." });
    } else {
      setMessage({ type: "danger", text: result.error });
    }
    event.target.value = "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setSaving(true);
    const result = await updateBaseProfile({
      fullName,
      displayName: displayName || undefined,
      location: location || undefined,
      phone: phone || undefined,
      avatarUrl: avatarUrl || undefined,
    });
    setSaving(false);
    if (!result.ok) {
      setMessage({ type: "danger", text: result.error });
      return;
    }
    setMessage({ type: "success", text: "Profile updated successfully." });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {message && <Alert variant={message.type}>{message.text}</Alert>}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="rounded-full transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          aria-label="Preview profile picture"
        >
          <Avatar src={avatarUrl} name={fullName || displayName} size="xl" />
        </button>
        {cloudinaryReady ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
            <Button
              type="button"
              variant="outline"
              loading={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4" aria-hidden />
              Upload image
            </Button>
          </>
        ) : (
          <Input
            placeholder="https://…/avatar.jpg"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            aria-label="Avatar image URL"
          />
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Full name" htmlFor="fullName" required>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
          />
        </FormField>
        <FormField label="Display name" htmlFor="displayName">
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Public name (optional)"
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Location" htmlFor="location">
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City / district"
          />
        </FormField>
        <FormField label="Phone" htmlFor="phone" hint="Used for verification — never shown publicly.">
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01XXXXXXXXX"
          />
        </FormField>
      </div>

      <div className="flex justify-end border-t border-slate-100 pt-5">
        <Button type="submit" loading={saving}>
          Save profile
        </Button>
      </div>

      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Profile picture"
        size="sm"
      >
        <div className="flex justify-center">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={buildOptimizedImageUrl(avatarUrl, { width: 512, height: 512 })}
              alt="Profile"
              className="h-64 w-64 rounded-full object-cover"
            />
          ) : (
            <Avatar src={null} name={fullName || displayName} size="xl" />
          )}
        </div>
      </Modal>
    </form>
  );
}
