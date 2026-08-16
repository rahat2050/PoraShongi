"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { getLocalizedAuthError } from "@/lib/auth/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";

interface PasswordErrors {
  password?: string;
  confirm?: string;
}

export function ResetPasswordForm() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const [checking, setChecking] = useState(configured);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<PasswordErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!configured) return;
    const supabase = createClient();
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setHasSession(Boolean(data.session));
        setChecking(false);
      }
    });
    return () => {
      active = false;
    };
  }, [configured]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const nextErrors: PasswordErrors = {};
    if (password.length < 8) nextErrors.password = "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।";
    if (password !== confirm) nextErrors.confirm = "পাসওয়ার্ড দুটো মিলছে না।";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (updateError) {
      setError(getLocalizedAuthError(updateError, "পাসওয়ার্ড বদলানো যায়নি। নতুন রিসেট লিংক নিয়ে আবার চেষ্টা করুন।"));
      return;
    }
    setSuccess(true);
  }

  if (!configured) {
    return <Alert variant="warning">পাসওয়ার্ড রিসেট সেবা এখনো কনফিগার করা হয়নি।</Alert>;
  }

  if (checking) return <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">লোড হচ্ছে…</p>;

  if (success) {
    return (
      <div className="space-y-4">
        <Alert variant="success" title="পাসওয়ার্ড বদলেছে">নতুন পাসওয়ার্ড দিয়ে লগইন করুন।</Alert>
        <Button className="w-full" onClick={() => router.replace("/login")}>লগইনে যান</Button>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <Alert variant="warning" title="লিংক মেয়াদোত্তীর্ণ বা ভুল">
        আবার <a href="/forgot-password" className="font-medium underline">রিসেট লিংক</a> নিন।
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="danger">{error}</Alert>}
      <p className="text-sm text-slate-500 dark:text-slate-300">নতুন পাসওয়ার্ড দিন।</p>
      <FormField label="নতুন পাসওয়ার্ড" htmlFor="newPassword" required hint="কমপক্ষে ৮ অক্ষর" error={fieldErrors.password}>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          maxLength={72}
          required
          invalid={Boolean(fieldErrors.password)}
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? "newPassword-error" : "newPassword-hint"}
        />
      </FormField>
      <FormField label="আবার লিখুন" htmlFor="confirmPassword" required error={fieldErrors.confirm}>
        <Input
          id="confirmPassword"
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
          aria-describedby={fieldErrors.confirm ? "confirmPassword-error" : undefined}
        />
      </FormField>
      <Button type="submit" className="w-full" loading={pending}>পাসওয়ার্ড বদলান</Button>
    </form>
  );
}
