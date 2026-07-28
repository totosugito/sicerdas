import React from "react";
import { CourseItem, PaginatedCourseListResponse } from "@/api/course/courses";
import { PaginationData } from "@/components/table";
import { CourseCardListItem } from "./CourseCardListItem";
import { useAppTranslation } from "@/lib/i18n-typed";
import { BookOpen } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";

interface CourseCardListProps {
  data: PaginatedCourseListResponse;
  isLoading: boolean;
  paginationData: PaginationData;
  onPaginationChange?: (pagination: { page: number; limit: number }) => void;
  onDelete: (course: CourseItem) => void;
}

export function CourseCardList({
  data,
  isLoading,
  paginationData,
  onDelete,
}: CourseCardListProps) {
  const { t } = useAppTranslation();
  const { openSideMenu } = useAuthStore();
  const items = data?.data?.items || [];

  const gridClass = openSideMenu
    ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  if (!isLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 bg-card rounded-2xl border border-dashed border-border/60 text-center">
        <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
          <BookOpen className="h-10 w-10 text-primary opacity-40" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          {t(($) => $.course.courses.table.noData)}
        </h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
          {t(($) => $.course.courses.description)}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className={cn(gridClass)}>
        {isLoading
          ? Array.from({ length: paginationData?.limit || 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-2xl bg-muted/40 animate-pulse border border-border/20"
              />
            ))
          : items.map((course) => (
              <CourseCardListItem key={course.id} course={course} onDelete={onDelete} />
            ))}
      </div>
    </div>
  );
}
