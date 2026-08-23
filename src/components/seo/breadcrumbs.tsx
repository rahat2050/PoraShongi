import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbList, type BreadcrumbItem } from "@/lib/seo/jsonld";

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;

  return (
    <>
      <JsonLd data={breadcrumbList(items)} />
      <nav aria-label="breadcrumb" className="mb-5">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
          {items.map((item, index) => {
            const last = index === items.length - 1;
            return (
              <li key={`${item.name}-${index}`} className="inline-flex items-center gap-1">
                {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />}
                {last || !item.path ? (
                  <span className={last ? "font-medium text-slate-700 dark:text-slate-200" : undefined} aria-current={last ? "page" : undefined}>
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.path} className="hover:text-brand-700 hover:underline dark:hover:text-brand-300">
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
