import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/features/auth/sign-in-form";
import { getAuthErrorMessage, getSafeNextPath } from "@/lib/auth/redirects";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = { title: "লগইন" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const query = await searchParams;
  const nextPath = getSafeNextPath(query.next);
  const initialError = getAuthErrorMessage(query.error);

  return (
    <Card>
      <CardHeader>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">আবার স্বাগতম</h1>
        <CardDescription>আপনার অ্যাকাউন্টে লগইন করুন।</CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm nextPath={nextPath} initialError={initialError} />
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-slate-500 dark:text-slate-300">
          নতুন এখানে?{" "}
          <Link href="/register" className="font-medium text-brand-700 hover:underline dark:text-brand-300">
            অ্যাকাউন্ট তৈরি করুন
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
