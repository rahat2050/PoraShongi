import type { Metadata } from "next";
import { ResetPasswordForm } from "@/features/auth/reset-password-form";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = { title: "পাসওয়ার্ড রিসেট" };

export default function ResetPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">নতুন পাসওয়ার্ড</h1>
        <CardDescription>নতুন পাসওয়ার্ড দিয়ে লগইন করবেন।</CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm />
      </CardContent>
    </Card>
  );
}
