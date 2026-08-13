"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isSupabaseConfigured()) {
      setError("Supabase connect হয়নি। .env.local-এ Supabase URL + anon key বসাও (README দেখুন)।");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && <Alert variant="danger">{error}</Alert>}

      <FormField label="ইমেইল" htmlFor="email" required>
        <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </FormField>

      <FormField label="পাসওয়ার্ড" htmlFor="password" required>
        <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
      </FormField>

      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm font-medium text-brand-700 hover:underline">
          পাসওয়ার্ড ভুলে গেছেন?
        </Link>
      </div>

      <Button type="submit" className="w-full" loading={loading}>
        লগইন করুন
      </Button>
    </form>
  );
}
