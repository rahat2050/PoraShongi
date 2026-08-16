import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6" aria-busy="true" aria-label="লোড হচ্ছে">
      <Skeleton className="h-10 w-40" />
      <div className="mt-4 flex-1 space-y-3">
        <Skeleton className="h-14 w-3/4" />
        <Skeleton className="h-14 w-1/2 self-end" />
        <Skeleton className="h-14 w-2/3" />
      </div>
    </div>
  );
}
