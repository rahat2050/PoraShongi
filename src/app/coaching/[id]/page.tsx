import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, MapPin, Phone } from "lucide-react";
import { listCoachingCenters, listCoachingCourses } from "@/lib/data/ecosystem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTaka } from "@/lib/utils";

export const metadata: Metadata = { title: "Coaching Center" };
export const dynamic = "force-dynamic";

export default async function CoachingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // center খুঁজি (list থেকে — ছোট data-র জন্য আলাদা RPC বানাইনি)
  const all = (await listCoachingCenters()).data ?? [];
  const center = all.find((c) => c.id === id);
  if (!center) notFound();

  const courses = (await listCoachingCourses(center.id)).data ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <Link href="/coaching" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" aria-hidden /> সব কোচিং সেন্টার
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{center.name}</h1>
            {center.verified && <Badge variant="success">Verified</Badge>}
          </div>

          <dl className="mt-4 space-y-2 text-sm text-slate-600">
            {(center.area || center.district) && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" aria-hidden />
                {[center.area, center.district].filter(Boolean).join(", ")}
              </div>
            )}
            {center.contact && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" aria-hidden />
                {center.contact}
              </div>
            )}
          </dl>

          {center.description && (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">{center.description}</p>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-brand-600" aria-hidden /> কোর্স ({courses.length})</CardTitle></CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <p className="text-sm text-slate-400">কোনো কোর্স যোগ করা হয়নি।</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{course.title}</p>
                    {course.description && <p className="text-xs text-slate-500">{course.description}</p>}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{formatTaka(course.price)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
