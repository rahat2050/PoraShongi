import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6" aria-busy="true" aria-label="লোড হচ্ছে">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-6 h-40 w-full" />
      <Skeleton className="mt-4 h-32 w-full" />
    </div>
  );
}
