"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isSupabaseConfigured()) {
      setError("Supabase connect হয়নি। .env.local-এ Supabase URL + anon key বসাও।");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setSuccess("যদি এই ইমেইলে অ্যাকাউন্ট থাকে, তাহলে reset link পাঠানো হয়েছে। ইনবক্স দেখুন।");
  }

  if (success) return <Alert variant="success" title="ইমেইল দেখুন">{success}</Alert>;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && <Alert variant="danger">{error}</Alert>}
      <p className="text-sm text-slate-500">আপনার অ্যাকাউন্টের ইমেইল লিখুন — password reset link পাঠাবো।</p>
      <FormField label="ইমেইল" htmlFor="email" required>
        <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </FormField>
      <Button type="submit" className="w-full" loading={loading}>
        Reset link পাঠান
      </Button>
    </form>
  );
}
