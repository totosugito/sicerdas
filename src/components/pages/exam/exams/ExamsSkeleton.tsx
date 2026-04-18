import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ExamsSkeletonProps {
  viewMode: "grid" | "list";
  length?: number;
}

export const ExamsSkeleton = ({ viewMode, length = 8 }: ExamsSkeletonProps) => {
  return (
    <div
      className={cn(
        "grid gap-6",
        viewMode === "grid"
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "grid-cols-1",
      )}
    >
      {Array.from({ length }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden",
            viewMode === "list"
              ? "flex flex-col sm:flex-row h-auto sm:h-48"
              : "flex flex-col h-full",
          )}
        >
          {/* Thumbnail Skeleton */}
          <div
            className={cn(
              "relative bg-slate-100 dark:bg-slate-800 animate-pulse",
              viewMode === "grid"
                ? "aspect-video w-full"
                : "aspect-video sm:aspect-square w-full sm:w-48",
            )}
          />

          {/* Content Skeleton */}
          <div className="flex flex-col flex-1 p-5 gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <Skeleton className="h-4 w-16" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>

            <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <div className="flex gap-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
