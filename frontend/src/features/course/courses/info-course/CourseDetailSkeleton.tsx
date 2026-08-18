import React from "react";

export function CourseDetailSkeleton() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50/50 dark:bg-slate-900/20 animate-pulse">
      {/* Top Breadcrumb/Back area */}
      <div className="container mx-auto px-4 md:px-6 pt-6">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 pb-12 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main details (Left Side) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card Skeleton */}
            <div className="h-[200px] bg-slate-200 dark:bg-slate-800 rounded-xl" />
            {/* Content Syllabus Skeleton */}
            <div className="h-[300px] bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>

          {/* Action Card (Right Side) */}
          <div className="space-y-6">
            <div className="h-[350px] bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
