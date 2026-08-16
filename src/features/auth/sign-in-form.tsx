"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { getSafeNextPath } from "@/lib/auth/redirects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";

export function SignInForm({
  nextPath,
  initialError = null,
}: {
  nextPath?: string | null;
  initialError?: string | null;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("ইমেইল লিখুন।");
      return;
    }
    if (!password) {
      setError("পাসওয়ার্ড লিখুন।");
      return;
    }
    if (!isSupabaseConfigured()) {
      setError("লগইন সেবা এখনো কনফিগার করা হয়নি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);

    if (authError) {
      setError("ইমেইল বা পাসওয়ার্ড সঠিক নয়। আবার চেষ্টা করুন।");
      return;
    }

    router.replace(getSafeNextPath(nextPath));
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="danger">{error}</Alert>}

      <FormField label="ইমেইল" htmlFor="email" required>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </FormField>

      <FormField label="পাসওয়ার্ড" htmlFor="password" required>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </FormField>

      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300">
          পাসওয়ার্ড ভুলে গেছেন?
        </Link>
      </div>

      <Button type="submit" className="w-full" loading={loading}>
        লগইন করুন
      </Button>
    </form>
  );
}
