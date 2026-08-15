"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";

export function ResetPasswordForm() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const [checking, setChecking] = useState(configured);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
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
    if (password.length < 8) {
      setError("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।");
      return;
    }
    if (password !== confirm) {
      setError("পাসওয়ার্ড দুটো মিলছে না।");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSuccess(true);
  }

  if (checking) return <p className="py-8 text-center text-sm text-slate-400">লোড হচ্ছে…</p>;

  if (success) {
    return (
      <div className="space-y-4">
        <Alert variant="success" title="পাসওয়ার্ড বদলেছে">নতুন পাসওয়ার্ড দিয়ে লগইন করুন।</Alert>
        <Button className="w-full" onClick={() => router.push("/login")}>লগইনে যান</Button>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <Alert variant="warning" title="লিংক মেয়াদোত্তীর্ণ বা ভুল">
        আবার <a href="/forgot-password" className="font-medium underline">reset link</a> নিন।
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && <Alert variant="danger">{error}</Alert>}
      <p className="text-sm text-slate-500">নতুন পাসওয়ার্ড দিন।</p>
      <FormField label="নতুন পাসওয়ার্ড" required hint="কমপক্ষে ৮ অক্ষর">
        <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </FormField>
      <FormField label="আবার লিখুন" required>
        <Input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </FormField>
      <Button type="submit" className="w-full" loading={pending}>পাসওয়ার্ড বদলান</Button>
    </form>
  );
}
