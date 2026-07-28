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
import { string_to_locale_date } from "@/lib/my-utils";
import { cn } from "@/lib/utils";

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
          </div>
        )}

        {/* Status & Badge Overlay */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <Badge
            className={cn(
              "shadow-sm border-transparent capitalize",
              course.status === "published"
                ? "bg-emerald-600 text-white dark:bg-emerald-600/20 dark:text-emerald-400"
                : "bg-amber-500 text-white dark:bg-amber-500/20 dark:text-amber-400"
            )}
          >
            {course.status}
          </Badge>
          {course.category && (
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm shadow-sm">
              {course.category.name}
            </Badge>
          )}
        </div>

        {/* Action Menu Button */}
        <div className="absolute top-3 right-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-md shadow-sm border border-border/40 hover:bg-background"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{t(($) => $.labels.actions)}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link to={AppRoute.course.courses.admin.detail.url.replace("$id", course.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    {t(($) => $.labels.preview)}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={AppRoute.course.courses.admin.edit.url.replace("$id", course.id)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t(($) => $.labels.edit)}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(course)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t(($) => $.labels.delete)}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          <span>{course.courseCode}</span>
        </div>

        <Link
          to={AppRoute.course.courses.admin.detail.url.replace("$id", course.id)}
          className="font-bold text-lg text-foreground hover:text-primary transition-colors line-clamp-2"
        >
          {course.courseName}
        </Link>

        {course.courseDescription && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {course.courseDescription}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between">
          <span className="font-semibold text-sm">
            {course.price === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400">Gratis</span>
            ) : (
              `Rp ${course.price.toLocaleString("id-ID")}`
            )}
          </span>
          <span className="text-xs text-muted-foreground">
            {string_to_locale_date("id-ID", course.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
