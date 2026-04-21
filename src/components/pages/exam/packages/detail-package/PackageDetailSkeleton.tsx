import { Skeleton } from "@/components/ui/skeleton";

export const PackageDetailSkeleton = () => {
  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
      {/* Navigation Skeleton */}
      <div className="flex gap-2 mb-2">
        <Skeleton className="h-6 w-32" />
      </div>

      {/* Hero Skeleton */}
      <div className="rounded-3xl border bg-card p-6 lg:p-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <Skeleton className="h-48 w-full rounded-2xl lg:h-40 lg:w-60" />
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-10 w-3/4" />
            <div className="flex gap-4 mt-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="mt-auto pt-4">
              <Skeleton className="h-12 w-full lg:w-48 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-32 " />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
        <div className="space-y-6 pt-4 border-t">
          <Skeleton className="h-8 w-32" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
};
