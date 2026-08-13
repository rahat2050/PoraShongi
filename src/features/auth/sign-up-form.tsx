"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { REGISTERABLE_ROLES, ROLE_LABELS } from "@/lib/auth/roles";
import { registerSchema, type RegisterInput } from "@/validation/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";

type FieldErrors = Partial<Record<keyof RegisterInput, string>>;

export function SignUpForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<string>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSuccess(null);

    const parsed = registerSchema.safeParse({
      fullName,
      role,
      email,
      password,
      confirmPassword,
    });
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof RegisterInput;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    if (!isSupabaseConfigured()) {
      setFormError(
        "Supabase is not configured. Copy `.env.example` to `.env.local` and set your Supabase keys.",
      );
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          full_name: parsed.data.fullName,
          role: parsed.data.role,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    // Email confirmation is enabled → no session yet.
    if (!data.session) {
      setSuccess(
        "Account created! Please check your email to confirm your address, then sign in.",
      );
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (success) {
    return (
      <div className="space-y-4">
        <Alert variant="success" title="Almost there!">
          {success}
        </Alert>
        <Link href="/login" className="text-sm font-medium text-brand-700 hover:underline">
          Go to sign in →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError && <Alert variant="danger">{formError}</Alert>}

      <FormField
        label="Full name"
        htmlFor="fullName"
        error={errors.fullName}
        required
      >
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          placeholder="Your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          invalid={Boolean(errors.fullName)}
        />
      </FormField>

      <FormField label="I am a…" htmlFor="role" error={errors.role} required>
        <Select
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          invalid={Boolean(errors.role)}
        >
          {REGISTERABLE_ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r].en} · {ROLE_LABELS[r].bn}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Email" htmlFor="email" error={errors.email} required>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          invalid={Boolean(errors.email)}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Password"
          htmlFor="password"
          error={errors.password}
          required
        >
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            invalid={Boolean(errors.password)}
          />
        </FormField>

        <FormField
          label="Confirm password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword}
          required
        >
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            invalid={Boolean(errors.confirmPassword)}
          />
        </FormField>
      </div>

      <Button type="submit" className="w-full" loading={loading}>
        Create account
      </Button>

      <p className="text-center text-xs text-slate-500">
        By continuing you agree to the PoraShongi terms and privacy policy.
      </p>
    </form>
  );
}
