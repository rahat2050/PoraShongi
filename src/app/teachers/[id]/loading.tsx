import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6" aria-busy="true" aria-label="শিক্ষকের প্রোফাইল লোড হচ্ছে">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-5 sm:flex-row">
          <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-4 w-72 max-w-full" />
            <div className="grid gap-3 pt-3 sm:grid-cols-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
      <Skeleton className="mt-6 h-72 w-full rounded-2xl" />
    </div>
  );
}
