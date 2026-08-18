import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function CourseEditSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full container mx-auto p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-1/3" />
      </div>
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-[450px] space-y-6">
          <div className="border border-border rounded-2xl bg-card p-6 space-y-6">
            <Skeleton className="h-6 w-1/2" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex justify-end pt-4 border-t">
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
        <div className="flex-1 w-full space-y-6">
          <div className="border border-border rounded-2xl bg-card p-6 space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
