import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6" aria-busy="true" aria-label="লোড হচ্ছে">
      <Skeleton className="h-8 w-48" />
      <div className="mt-6 space-y-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    </div>
  );
}
