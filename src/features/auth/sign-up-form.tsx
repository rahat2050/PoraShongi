"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";

export function SignUpForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirm) {
      setError("পাসওয়ার্ড দুটো মিলছে না।");
      return;
    }
    if (password.length < 8) {
      setError("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।");
      return;
    }
    if (!isSupabaseConfigured()) {
      setError("Supabase connect হয়নি। .env.local-এ Supabase URL + anon key বসাও (README দেখুন)।");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (!data.session) {
      setSuccess("অ্যাকাউন্ট তৈরি হয়েছে! ইমেইল verify করে তারপর লগইন করুন।");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (success) {
    return <Alert variant="success" title="প্রায় শেষ!">{success}</Alert>;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && <Alert variant="danger">{error}</Alert>}

      <FormField label="পুরো নাম" htmlFor="fullName" required>
        <Input id="fullName" autoComplete="name" placeholder="আপনার নাম" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </FormField>

      <FormField label="আমি একজন…" htmlFor="role" required>
        <Select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="student">শিক্ষার্থী ({ROLE_LABELS.student.en})</option>
          <option value="guardian">অভিভাবক ({ROLE_LABELS.guardian.en})</option>
          <option value="teacher">শিক্ষক ({ROLE_LABELS.teacher.en})</option>
        </Select>
      </FormField>

      <FormField label="ইমেইল" htmlFor="email" required>
        <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </FormField>

      <FormField label="পাসওয়ার্ড" htmlFor="password" required hint="কমপক্ষে ৮ অক্ষর">
        <Input id="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </FormField>

      <FormField label="পাসওয়ার্ড আবার লিখুন" htmlFor="confirm" required>
        <Input id="confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </FormField>

      <Button type="submit" className="w-full" loading={loading}>
        অ্যাকাউন্ট তৈরি করুন
      </Button>
    </form>
  );
}
