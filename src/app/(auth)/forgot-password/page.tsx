import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "পাসওয়ার্ড ভুলে গেছেন" };

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>পাসওয়ার্ড ভুলে গেছেন?</CardTitle>
        <CardDescription>চিন্তা নেই — reset link পাঠাবো।</CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
      <CardFooter className="justify-center">
        <Link href="/login" className="text-sm font-medium text-brand-700 hover:underline">
          লগইনে ফিরে যান
        </Link>
      </CardFooter>
    </Card>
  );
}
