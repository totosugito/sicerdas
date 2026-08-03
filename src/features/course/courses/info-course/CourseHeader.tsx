import React from "react";
import { CourseItem } from "@/api/course/courses";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Layers, BookOpen } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";

interface CourseHeaderProps {
  course?: CourseItem;
}

export function CourseHeader({ course }: CourseHeaderProps) {
  const { t } = useAppTranslation();

  return (
    <Card className="overflow-hidden border-border/40 shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="text-xs font-semibold">
            {course?.category?.name || t(($) => $.course.courses.table.columns.category)}
          </Badge>
          <Badge className="bg-primary/10 text-primary border-none text-xs font-semibold">
            {course?.grade?.name || t(($) => $.course.courses.table.gradeFilter)}
          </Badge>
          {course?.price === 0 && (
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-xs font-bold">
              {t(($) => $.course.public.detail.free)}
            </Badge>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
          {course?.courseName}
        </h1>

        {course?.courseDescription && (
          <div className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-line mb-6">
            {course.courseDescription}
          </div>
        )}

        {/* Rating & Stats row */}
        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm">
          <div className="flex items-center gap-1.5">
            <Star className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />
            <span className="font-bold text-slate-950 dark:text-white">
              {Number(course?.averageRating || 5.0).toFixed(1)}
            </span>
            <span className="text-slate-400 dark:text-slate-500">
              ({course?.totalRatings || 0} {t(($) => $.labels.rating)})
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Layers className="h-4 w-4" />
            <span>
              {course?.totalChapters || 0} {t(($) => $.course.courses.table.cardLabels.chapters)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <BookOpen className="h-4 w-4" />
            <span>
              {course?.totalLectures || 0} {t(($) => $.course.courses.table.cardLabels.lectures)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
