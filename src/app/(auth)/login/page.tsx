import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/features/auth/sign-in-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "লগইন" };

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>আবার স্বাগতম</CardTitle>
        <CardDescription>আপনার অ্যাকাউন্টে লগইন করুন।</CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm />
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-slate-500">
          নতুন এখানে?{" "}
          <Link href="/register" className="font-medium text-brand-700 hover:underline">
            অ্যাকাউন্ট তৈরি করুন
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
