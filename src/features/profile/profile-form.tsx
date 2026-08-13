"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/modal";
import { isCloudinaryConfigured } from "@/lib/env";
import { buildOptimizedImageUrl, uploadProfileImage } from "@/lib/cloudinary";
import { updateProfileSchema } from "@/validation/profile";
import { type Profile } from "@/types/index";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type FieldErrors = Partial<
  Record<"fullName" | "displayName" | "location", string>
>;

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<{
    type: "success" | "danger";
    text: string;
  } | null>(null);

  const cloudinaryReady = isCloudinaryConfigured();

  async function handleFileSelection(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage(null);
    const result = await uploadProfileImage(file);
    setUploading(false);
    if (result.ok) {
      setAvatarUrl(result.url);
      setMessage({
        type: "success",
        text: "Avatar uploaded — save your profile to apply it.",
      });
    } else {
      setMessage({ type: "danger", text: result.error });
    }
    event.target.value = "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const parsed = updateProfileSchema.safeParse({
      fullName,
      displayName,
      location,
    });
    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key && !errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.fullName,
        display_name: parsed.data.displayName || null,
        location: parsed.data.location || null,
        avatar_url: avatarUrl || null,
      })
      .eq("id", profile.id);
    setSaving(false);

    if (error) {
      setMessage({ type: "danger", text: error.message });
      return;
    }

    setMessage({ type: "success", text: "Profile updated successfully." });
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Profile picture</CardTitle>
          <CardDescription>
            {cloudinaryReady
              ? "Uploaded securely via Cloudinary and auto-optimized."
              : "Cloudinary is not configured — paste an image URL instead."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="rounded-full transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            aria-label="Preview profile picture"
          >
            <Avatar
              src={avatarUrl}
              name={fullName || displayName}
              size="xl"
            />
          </button>
          {cloudinaryReady ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelection}
              />
              <Button
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
          {avatarUrl && (
            <p className="break-all text-center text-xs text-slate-400">
              {buildOptimizedImageUrl(avatarUrl, { width: 96, height: 96 })}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>
            Update the details shown on your profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {message && (
              <Alert variant={message.type}>{message.text}</Alert>
            )}

            <FormField
              label="Full name"
              htmlFor="fullName"
              error={fieldErrors.fullName}
              required
            >
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                invalid={Boolean(fieldErrors.fullName)}
                placeholder="Your full name"
              />
            </FormField>

            <FormField
              label="Display name"
              htmlFor="displayName"
              error={fieldErrors.displayName}
              hint="Optional — shown publicly instead of your full name."
            >
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                invalid={Boolean(fieldErrors.displayName)}
                placeholder="e.g. Rifat Sir"
              />
            </FormField>

            <FormField
              label="Location"
              htmlFor="location"
              error={fieldErrors.location}
              hint="Optional — e.g. Sunamganj, Sylhet"
            >
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                invalid={Boolean(fieldErrors.location)}
                placeholder="City / district"
              />
            </FormField>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

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
              src={buildOptimizedImageUrl(avatarUrl, {
                width: 512,
                height: 512,
              })}
              alt="Profile"
              className="h-64 w-64 rounded-full object-cover"
            />
          ) : (
            <Avatar src={null} name={fullName || displayName} size="xl" />
          )}
        </div>
      </Modal>
    </div>
  );
}
