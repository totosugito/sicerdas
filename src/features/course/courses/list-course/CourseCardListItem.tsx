import React from "react";
import { CourseItem } from "@/api/course/courses";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  ImageIcon,
  BookOpen,
  Layers,
  Users,
  Star,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@tanstack/react-router";
import { AppRoute } from "@/constants/app-route";
import { CourseStatusBadge } from "../components/CourseStatusBadge";
import { string_to_locale_date } from "@/lib/my-utils";

interface CourseCardListItemProps {
  course: CourseItem;
  onDelete: (course: CourseItem) => void;
}

export function CourseCardListItem({ course, onDelete }: CourseCardListItemProps) {
  const { t } = useAppTranslation();
  const [hasError, setHasError] = React.useState(false);

  return (
    <div className="group relative flex flex-col bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 overflow-hidden h-full">
      {/* Thumbnail Area */}
      <div className="relative aspect-[16/9] overflow-hidden bg-muted/30">
        {course.thumbnail && !hasError ? (
          <img
            src={course.thumbnail}
            alt={course.courseName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
            <ImageIcon className="h-12 w-12 text-primary/20" />
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
              <svg width="100%" height="100%">
                <pattern
                  id={`pattern-course-${course.id}`}
                  x="0"
                  y="0"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="2" cy="2" r="1" fill="currentColor" />
                </pattern>
                <rect width="100%" height="100%" fill={`url(#pattern-course-${course.id})`} />
              </svg>
            </div>
          </div>
        )}

        {/* Status Badge Overlay */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <CourseStatusBadge status={course.status} />
        </div>

        {/* Action Menu Button */}
        <div className="absolute top-3 right-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 shadow-sm border border-border/40"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-border/60">
              <DropdownMenuGroup>
                <DropdownMenuLabel>{t(($) => $.labels.actions)}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to={AppRoute.course.courses.admin.detail.url.replace("$id", course.id)}
                    className="cursor-pointer"
                  >
                    <Eye className="mr-2 h-4 w-4 text-primary" />
                    {t(($) => $.labels.preview)}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to={AppRoute.course.courses.admin.edit.url.replace("$id", course.id)}
                    className="cursor-pointer"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    {t(($) => $.labels.edit)}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => onDelete(course)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t(($) => $.labels.delete)}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col p-5 flex-grow">
        <Link
          to={AppRoute.course.courses.admin.detail.url.replace("$id", course.id)}
          className="group/title block mb-4 flex-grow"
        >
          <div className="flex flex-col gap-1.5 mb-2">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              {course.category?.name || (
                <span className="italic opacity-60 lowercase">{t(($) => $.labels.noCategory)}</span>
              )}
            </span>
            <h3 className="text-base font-bold text-foreground group-hover/title:text-primary transition-colors line-clamp-1">
              {course.courseName}
            </h3>
          </div>
          <div className="text-xs text-muted-foreground/80 font-medium flex items-center gap-1">
            {course.grade?.name ? (
              `${t(($) => $.labels.level)}: ${course.grade.name}`
            ) : (
              <span className="italic opacity-60 lowercase">{t(($) => $.labels.noLevel)}</span>
            )}
          </div>
        </Link>

        {course.courseDescription && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
            {course.courseDescription}
          </p>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4 pt-3 border-t border-border/40 text-center">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {t(($) => $.course.courses.table.cardLabels.chapters)}
            </span>
            <div className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-primary/70 shrink-0" />
              <span className="text-xs font-semibold">{course.totalChapters ?? 0}</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-0.5 border-x border-border/40 px-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {t(($) => $.course.courses.table.cardLabels.lectures)}
            </span>
            <div className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-blue-500/70 shrink-0" />
              <span className="text-xs font-semibold">{course.totalLectures ?? 0}</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {t(($) => $.course.courses.table.cardLabels.enrolled)}
            </span>
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-emerald-500/70 shrink-0" />
              <span className="text-xs font-semibold">{course.enrolledCount ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
              {Number(course.averageRating || 0).toFixed(1)}
            </span>
            <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80 font-medium">
              ({course.totalRatings ?? 0})
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {string_to_locale_date("id-ID", course.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
