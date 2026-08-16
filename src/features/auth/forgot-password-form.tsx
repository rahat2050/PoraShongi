"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { getLocalizedAuthError } from "@/lib/auth/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setEmailError(null);
    setSuccess(null);

    const normalizedEmail = email.trim();
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setEmailError("সঠিক ইমেইল ঠিকানা লিখুন।");
      return;
    }
    if (!isSupabaseConfigured()) {
      setError("পাসওয়ার্ড রিসেট সেবা এখনো কনফিগার করা হয়নি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);

    if (authError) {
      setError(getLocalizedAuthError(authError, "রিসেট লিংক পাঠানো যায়নি। একটু পরে আবার চেষ্টা করুন।"));
      return;
    }

    setSuccess("এই ইমেইলে অ্যাকাউন্ট থাকলে রিসেট লিংক পাঠানো হয়েছে। ইনবক্স ও স্প্যাম ফোল্ডার দেখুন।");
  }

  if (success) return <Alert variant="success" title="ইমেইল দেখুন">{success}</Alert>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="danger">{error}</Alert>}
      <p className="text-sm text-slate-500 dark:text-slate-300">আপনার অ্যাকাউন্টের ইমেইল লিখুন—পাসওয়ার্ড রিসেট লিংক পাঠানো হবে।</p>
      <FormField label="ইমেইল" htmlFor="email" required error={emailError}>
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
          invalid={Boolean(emailError)}
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? "email-error" : undefined}
        />
      </FormField>
      <Button type="submit" className="w-full" loading={loading}>
        রিসেট লিংক পাঠান
      </Button>
    </form>
  );
}
