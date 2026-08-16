import { Skeleton } from "@/components/ui/skeleton";

/** Detail পেজের জন্য হালকা skeleton। */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6" aria-busy="true" aria-label="লোড হচ্ছে">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-3/4" />
        <Skeleton className="mt-6 h-16 w-full" />
      </div>
    </div>
  );
}
