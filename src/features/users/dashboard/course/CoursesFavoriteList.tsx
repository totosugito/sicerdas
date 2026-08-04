import { useFavoriteCourses } from "@/api/course/courses/user/favorites";
import { BookOpen, ChevronRight, Bookmark } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LocalePagination } from "@/components/ui/locale-pagination";
import { useAppTranslation } from "@/lib/i18n-typed";

import { AppRoute } from "@/constants/app-route";
import { EmptyState } from "@/components/general";

interface CoursesFavoriteListProps {
  page?: number;
  onPageChange?: (page: number) => void;
  limit?: number;
}

export const CoursesFavoriteList = ({ page = 1, onPageChange, limit = 5 }: CoursesFavoriteListProps) => {
  const { t } = useAppTranslation();
  const { data: res, isLoading } = useFavoriteCourses({ page, limit });
  const favoriteCourses = res?.data?.items || [];

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

  if (favoriteCourses.length === 0) {
    return (
      <EmptyState
        variant="glow"
        color="amber"
        icon={Bookmark}
        title={t(($) => $.course.dashboard.favorites.empty)}
        description={t(($) => $.course.dashboard.favorites.emptyDesc)}
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
      {favoriteCourses.map((item) => (
        <Link
          key={item.id}
          to={AppRoute.course.courses.detail.url}
          params={{ id: item.id }}
          className="group flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200"
        >
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200 dark:border-slate-700 transition-transform duration-300 group-hover:scale-105">
            {item.thumbnail ? (
              <img
                src={item.thumbnail}
                alt={item.courseName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-slate-400" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              {item.courseCode}
            </span>
            <h4 className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors leading-tight mt-0.5">
              {item.courseName}
            </h4>
            {item.rating && (
              <p className="text-xs font-medium text-amber-500 mt-1">
                ★ {item.rating.toFixed(1)} Rating
              </p>
            )}
          </div>

          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
        </Link>
      ))}

      {res?.data?.meta && res.data.meta.totalPages > 1 && onPageChange && (
        <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
          <LocalePagination
            currentPage={page}
            totalPages={res.data.meta.totalPages}
            onPageChange={onPageChange}
            className="mt-0"
          />
        </div>
      )}
    </div>
  );
};
