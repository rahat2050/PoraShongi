"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { getLocalizedAuthError } from "@/lib/auth/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";

interface SignUpFieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignUpForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [fieldErrors, setFieldErrors] = useState<SignUpFieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  function validate(): boolean {
    const nextErrors: SignUpFieldErrors = {};
    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim();

    if (normalizedName.length < 2) nextErrors.fullName = "কমপক্ষে ২ অক্ষরের নাম লিখুন।";
    if (!EMAIL_PATTERN.test(normalizedEmail)) nextErrors.email = "সঠিক ইমেইল ঠিকানা লিখুন।";
    if (password.length < 8) nextErrors.password = "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।";
    if (password !== confirm) nextErrors.confirm = "পাসওয়ার্ড দুটো মিলছে না।";

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validate()) return;
    if (!isSupabaseConfigured()) {
      setError("অ্যাকাউন্ট সেবা এখনো কনফিগার করা হয়নি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          role,
          ...(referralCode.trim() ? { referral_code: referralCode.trim().toUpperCase() } : {}),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (authError) {
      setError(getLocalizedAuthError(authError, "অ্যাকাউন্ট তৈরি করা যায়নি। তথ্য পরীক্ষা করে আবার চেষ্টা করুন।"));
      return;
    }

    if (!data.session) {
      setSuccess("অ্যাকাউন্ট তৈরি হয়েছে। ইমেইলের ভেরিফিকেশন লিংকে ক্লিক করে তারপর লগইন করুন।");
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  async function resendVerification() {
    if (!isSupabaseConfigured() || !EMAIL_PATTERN.test(email.trim())) return;
    setError(null);
    setResending(true);
    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setResending(false);

    if (resendError) {
      setError(getLocalizedAuthError(resendError, "ভেরিফিকেশন ইমেইল আবার পাঠানো যায়নি। একটু পরে চেষ্টা করুন।"));
      return;
    }
    setSuccess("ভেরিফিকেশন ইমেইল আবার পাঠানো হয়েছে। ইনবক্স ও স্প্যাম ফোল্ডার দেখুন।");
  }

  if (success) {
    return (
      <div className="space-y-4">
        <Alert variant="success" title="প্রায় শেষ!">{success}</Alert>
        {error && <Alert variant="danger">{error}</Alert>}
        <Button type="button" variant="outline" className="w-full" loading={resending} onClick={resendVerification}>
          ভেরিফিকেশন ইমেইল আবার পাঠান
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="danger">{error}</Alert>}

      <FormField label="পুরো নাম" htmlFor="fullName" required error={fieldErrors.fullName}>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          placeholder="আপনার নাম"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          minLength={2}
          maxLength={100}
          required
          invalid={Boolean(fieldErrors.fullName)}
          aria-invalid={Boolean(fieldErrors.fullName)}
          aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
        />
      </FormField>

      <FormField label="আমি একজন…" htmlFor="role" required>
        <Select id="role" name="role" value={role} onChange={(event) => setRole(event.target.value)} required>
          <option value="student">শিক্ষার্থী ({ROLE_LABELS.student.en})</option>
          <option value="guardian">অভিভাবক ({ROLE_LABELS.guardian.en})</option>
          <option value="teacher">শিক্ষক ({ROLE_LABELS.teacher.en})</option>
        </Select>
      </FormField>

      <FormField label="ইমেইল" htmlFor="email" required error={fieldErrors.email}>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          invalid={Boolean(fieldErrors.email)}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
        />
      </FormField>

      <FormField label="রেফারেল কোড (ঐচ্ছিক)" htmlFor="referralCode" hint="বন্ধুর কোড থাকলে লিখুন">
        <Input
          id="referralCode"
          name="referralCode"
          placeholder="যেমন: PS1234ABCD"
          value={referralCode}
          onChange={(event) => setReferralCode(event.target.value)}
          maxLength={32}
        />
      </FormField>

      <FormField label="পাসওয়ার্ড" htmlFor="password" required hint="কমপক্ষে ৮ অক্ষর" error={fieldErrors.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          maxLength={72}
          required
          invalid={Boolean(fieldErrors.password)}
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? "password-error" : "password-hint"}
        />
      </FormField>

      <FormField label="পাসওয়ার্ড আবার লিখুন" htmlFor="confirm" required error={fieldErrors.confirm}>
        <Input
          id="confirm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          minLength={8}
          maxLength={72}
          required
          invalid={Boolean(fieldErrors.confirm)}
          aria-invalid={Boolean(fieldErrors.confirm)}
          aria-describedby={fieldErrors.confirm ? "confirm-error" : undefined}
        />
      </FormField>

      <Button type="submit" className="w-full" loading={loading}>
        অ্যাকাউন্ট তৈরি করুন
      </Button>
    </form>
  );
}
