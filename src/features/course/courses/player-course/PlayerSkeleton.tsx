import React from "react";

export function PlayerSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950/40 p-4 md:p-6 animate-pulse">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between gap-3">
          <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="text-right space-y-2">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-md ml-auto" />
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-md ml-auto" />
          </div>
        </div>
        {/* Progress Card Skeleton */}
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          {/* Sidebar Skeleton */}
          <div className="h-[400px] bg-slate-200 dark:bg-slate-800 rounded-xl" />
          {/* Content Skeleton */}
          <div className="h-[500px] bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
