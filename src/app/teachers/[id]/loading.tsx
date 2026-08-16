import { Skeleton } from "@/components/ui/skeleton";

/** Detail পেজের জন্য হালকা skeleton। */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6" aria-busy="true" aria-label="লোড হচ্ছে">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="mt-6 h-6 w-full" />
        <Skeleton className="mt-3 h-4 w-full" />
      </div>
    </div>
  );
}
