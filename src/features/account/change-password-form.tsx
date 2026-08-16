"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { getLocalizedAuthError } from "@/lib/auth/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";

/** লগইন অবস্থায় password বদলানো (account settings-এ)। */
export function ChangePasswordForm() {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8) {
      toast("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে", "danger");
      return;
    }
    if (password !== confirm) {
      toast("পাসওয়ার্ড দুটো মিলছে না", "danger");
      return;
    }
    if (!isSupabaseConfigured()) {
      toast("Supabase connect হয়নি", "danger");
      return;
    }
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setPending(false);
    if (error) {
      toast(getLocalizedAuthError(error, "পাসওয়ার্ড বদলানো যায়নি। আবার চেষ্টা করুন।"), "danger");
      return;
    }
    toast("পাসওয়ার্ড বদলানো হয়েছে", "success");
    setPassword("");
    setConfirm("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="নতুন পাসওয়ার্ড" htmlFor="account-new-password" required hint="কমপক্ষে ৮ অক্ষর">
        <Input id="account-new-password" name="newPassword" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} maxLength={72} required />
      </FormField>
      <FormField label="আবার লিখুন" htmlFor="account-confirm-password" required>
        <Input id="account-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={8} maxLength={72} required />
      </FormField>
      <Button type="submit" loading={pending}>পাসওয়ার্ড বদলান</Button>
    </form>
  );
}
