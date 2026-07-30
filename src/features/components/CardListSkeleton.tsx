import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";

interface CardListSkeletonProps {
  count?: number;
}

export function CardListSkeleton({ count = 8 }: CardListSkeletonProps) {
  const { openSideMenu } = useAuthStore();

  const gridClass = openSideMenu
    ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  return (
    <div className={cn(gridClass)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-4 border border-border/50 rounded-2xl p-4 bg-card/40"
        >
          <Skeleton className="h-24 w-full rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="pt-4 border-t border-border/40">
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
