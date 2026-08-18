import { useActiveCourses } from "@/api/course/enrollments";
import { BookOpen, ChevronRight, Play } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LocalePagination } from "@/components/ui/locale-pagination";
import { useAppTranslation } from "@/lib/i18n-typed";
import { EmptyState } from "@/components/general";
import { string_to_locale_date } from "@/lib/my-utils";

import { AppRoute } from "@/constants/app-route";

interface CoursesActiveListProps {
  page?: number;
  onPageChange?: (page: number) => void;
  limit?: number;
}

export const CoursesActiveList = ({ page = 1, onPageChange, limit = 5 }: CoursesActiveListProps) => {
  const { t, i18n } = useAppTranslation();
  const { data: res, isLoading } = useActiveCourses({ page, limit });
  const activeCourses = res?.data || [];

  if (isLoading) {
    return (
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4">
            <Skeleton className="w-14 h-14 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4 rounded-md" />
              <Skeleton className="h-3 w-1/4 rounded-md" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  if (activeCourses.length === 0) {
    return (
      <EmptyState
        variant="glow"
        color="primary"
        icon={Play}
        title={t(($) => $.course.dashboard.active.empty)}
        description={t(($) => $.course.dashboard.active.emptyDesc)}
      >
        <Link to={AppRoute.course.courses.courses.url}>
          <Button variant="outline" className="px-8 transition-all duration-300">
            {t(($) => $.course.menu)}
          </Button>
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {activeCourses.map((item) => (
        <Link
          key={item.enrollmentId}
          to={AppRoute.course.courses.player.url}
          params={{ id: item.course.id }}
          className="group flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200"
        >
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200 dark:border-slate-700 transition-transform duration-300 group-hover:scale-105">
            {item.course.thumbnail ? (
              <img
                src={item.course.thumbnail}
                alt={item.course.courseName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-slate-400" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              {item.course.courseCode}
            </span>
            <h4 className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors leading-tight mt-0.5">
              {item.course.courseName}
            </h4>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              {item.enrolledAt
                ? t(($) => $.course.dashboard.active.enrolledAt, {
                    date: string_to_locale_date(i18n.language, item.enrolledAt, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }) || "",
                  })
                : ""}
            </p>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
        </Link>
      ))}

      {res?.pagination && res.pagination.totalPages > 1 && onPageChange && (
        <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
          <LocalePagination
            currentPage={page}
            totalPages={res.pagination.totalPages}
            onPageChange={onPageChange}
            className="mt-0"
          />
        </div>
      )}
    </div>
  );
};
