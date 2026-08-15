import type { Metadata } from "next";
import { ResetPasswordForm } from "@/features/auth/reset-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "পাসওয়ার্ড রিসেট" };

export default function ResetPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>নতুন পাসওয়ার্ড</CardTitle>
        <CardDescription>নতুন পাসওয়ার্ড দিয়ে লগইন করবেন।</CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm />
      </CardContent>
    </Card>
  );
}
