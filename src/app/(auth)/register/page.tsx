import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/features/auth/sign-up-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "অ্যাকাউন্ট তৈরি করুন" };

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>অ্যাকাউন্ট তৈরি করুন</CardTitle>
        <CardDescription>শিক্ষার্থী, অভিভাবক বা শিক্ষক হিসেবে যুক্ত হোন।</CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm />
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-slate-500">
          অ্যাকাউন্ট আছে?{" "}
          <Link href="/login" className="font-medium text-brand-700 hover:underline">
            লগইন করুন
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
