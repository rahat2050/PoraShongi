import Link from "next/link";
import { SearchX } from "lucide-react";
import { TeacherCard } from "@/components/shared/teacher-card";
import { Reveal } from "@/components/motion/reveal";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonStyles } from "@/components/ui/button";
import { teacherItemListJsonLd } from "@/lib/seo/jsonld";
import type { TeacherPublic } from "@/types/index";

export function PublicTeacherResults({
  teachers,
  total,
  page,
  totalPages,
  buildHref,
  emptyTitle,
  emptyDescription,
  listName,
  listPath,
}: {
  teachers: TeacherPublic[];
  total: number;
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
  emptyTitle: string;
  emptyDescription: string;
  listName?: string;
  listPath?: string;
}) {
  return (
    <div className="mt-8">
      {listName && listPath && teachers.length > 0 && (
        <JsonLd
          data={teacherItemListJsonLd({
            name: listName,
            path: page > 1 ? `${listPath}?page=${page}` : listPath,
            teachers,
            total,
            page,
            pageSize: 12,
          })}
        />
      )}
      <p className="mb-4 text-sm text-slate-500">
        {total} জন প্রকাশিত শিক্ষক{totalPages > 1 ? ` · পাতা ${page}/${totalPages}` : ""}
      </p>
      {teachers.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher, index) => (
            <Reveal key={teacher.id} delay={Math.min(index * 70, 350)} className="h-full">
              <TeacherCard teacher={teacher} />
            </Reveal>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<SearchX className="h-6 w-6" aria-hidden />}
          title={emptyTitle}
          description={emptyDescription}
        />
      )}
      <div className="mt-8">
        <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
      </div>
      <p className="mt-6 text-sm text-slate-500">
        আরও ফিল্টার লাগলে{" "}
        <Link href="/teachers" className={buttonStyles({ variant: "ghost", className: "h-auto px-1 py-0 text-sm" })}>
          শিক্ষক খোঁজার পাতায় যান
        </Link>
        ।
      </p>
    </div>
  );
}
