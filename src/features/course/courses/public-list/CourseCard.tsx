import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAppTranslation } from "@/lib/i18n-typed";
import type { CourseItem } from "@/api/course/courses";
import { useAuthStore } from "@/stores/useAuthStore";
import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "@tanstack/react-router";
import { AppRoute } from "@/constants/app-route";
import { ImageIcon, Layers, BookOpen, Users, Star } from "lucide-react";

interface CourseCardProps {
  courses: CourseItem[];
  viewMode: "grid" | "list";
}

export const CourseCard = ({ courses, viewMode }: CourseCardProps) => {
  const { openSideMenu } = useAuthStore();

  const gridClass =
    viewMode === "grid"
      ? openSideMenu
        ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6"
        : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      : "grid grid-cols-1 gap-4";

  return (
    <div className={gridClass}>
      {courses.map((course) => (
        <CourseCardView key={course.id} course={course} viewMode={viewMode} />
      ))}
    </div>
  );
};

interface CourseCardViewProps {
  course: CourseItem;
  viewMode: "grid" | "list";
}

const CourseCardView = ({ course, viewMode }: CourseCardViewProps) => {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const [hasError, setHasError] = React.useState(false);
  const isListView = viewMode === "list";

  const handleCardClick = () => {
    navigate({
      to: AppRoute.course.courses.detail.url,
      params: { id: course.id },
    });
  };

  return (
    <Card
      className={cn(
        "group hover:shadow-lg hover:border-primary/30 transition-all duration-300 overflow-hidden cursor-pointer",
        isListView ? "flex flex-row h-auto min-h-[180px]" : "flex flex-col h-full",
      )}
      onClick={handleCardClick}
    >
      {/* Thumbnail Area */}
      <div
        className={cn(
          "relative overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0",
          isListView ? "w-40 sm:w-56" : "aspect-[16/9] w-full",
        )}
      >
        {course.thumbnail && !hasError ? (
          <img
            src={course.thumbnail}
            alt={course.courseName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-transparent relative">
            <ImageIcon className="h-10 w-10 text-primary/20" />
          </div>
        )}

        {/* Grade Badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-primary hover:bg-primary/95 text-white rounded shadow-sm backdrop-blur-sm text-xs px-2 py-0.5 border-none">
            {course.grade?.name || t(($) => $.course.courses.table.gradeFilter)}
          </Badge>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex flex-col gap-1 mb-2">
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
            {course.category?.name || t(($) => $.course.courses.table.columns.category)}
          </span>
          <h3
            className={cn(
              "font-bold text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors",
              isListView ? "text-base sm:text-lg line-clamp-2" : "text-base line-clamp-2",
            )}
          >
            <Link
              to={AppRoute.course.courses.detail.url}
              params={{ id: course.id }}
              onClick={(e) => e.stopPropagation()}
            >
              {course.courseName}
            </Link>
          </h3>
        </div>

        {course.courseDescription && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {course.courseDescription}
          </p>
        )}

        {/* Info row / columns */}
        <div className="grid grid-cols-3 gap-2 py-2 mb-3 border-y border-slate-100 dark:border-slate-800 text-center">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
              {t(($) => $.course.courses.table.cardLabels.chapters)}
            </span>
            <div className="flex items-center gap-1">
              <Layers className="h-3 w-3 text-primary/70 shrink-0" />
              <span className="text-xs font-semibold">{course.totalChapters ?? 0}</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-0.5 border-x border-slate-100 dark:border-slate-800 px-1">
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
              {t(($) => $.course.courses.table.cardLabels.lectures)}
            </span>
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-blue-500/70 shrink-0" />
              <span className="text-xs font-semibold">{course.totalLectures ?? 0}</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
              {t(($) => $.course.courses.table.cardLabels.enrolled)}
            </span>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-emerald-500/70 shrink-0" />
              <span className="text-xs font-semibold">{course.enrolledCount ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
              {Number(course.averageRating || 0).toFixed(1)}
            </span>
            <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-medium">
              ({course.totalRatings ?? 0})
            </span>
          </div>
          
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {course.price === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">{t(($) => $.course.public.detail.free)}</span>
            ) : (
              `Rp ${course.price.toLocaleString("id-ID")}`
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
