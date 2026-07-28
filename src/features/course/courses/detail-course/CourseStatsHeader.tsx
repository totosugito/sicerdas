import React from "react";
import { CourseItem } from "@/api/course/courses";
import { useAppTranslation } from "@/lib/i18n-typed";
import { CourseStatusBadge } from "../components/CourseStatusBadge";
import { BookOpen, Layers, Users, Star, GraduationCap, FolderTree } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CourseStatsHeaderProps {
  course?: CourseItem | null;
  isLoading?: boolean;
}

export function CourseStatsHeader({ course, isLoading }: CourseStatsHeaderProps) {
  const { t } = useAppTranslation();

  if (isLoading || !course) {
    return (
      <div className="flex flex-col gap-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-muted animate-pulse rounded-2xl border border-border/50"
            />
          ))}
        </div>
        <div className="h-12 bg-muted animate-pulse rounded-2xl border border-border/40" />
      </div>
    );
  }

  const stats = [
    {
      label: "Total Bab",
      value: course.totalChapters ?? 0,
      icon: <Layers className="h-5 w-5 text-primary" />,
      color: "primary",
    },
    {
      label: "Total Materi",
      value: course.totalLectures ?? 0,
      icon: <BookOpen className="h-5 w-5 text-blue-500" />,
      color: "blue",
    },
    {
      label: "Peserta Enrolled",
      value: course.enrolledCount ?? 0,
      icon: <Users className="h-5 w-5 text-emerald-500" />,
      color: "emerald",
    },
    {
      label: "Rating",
      value: (
        <span className="flex items-center gap-1.5">
          {Number(course.averageRating || 5.0).toFixed(1)}
          <span className="text-xs font-normal text-muted-foreground">
            ({course.totalRatings ?? 0})
          </span>
        </span>
      ),
      icon: <Star className="h-5 w-5 text-amber-500 fill-amber-500/20" />,
      color: "amber",
    },
  ];

  return (
    <div className="flex flex-col gap-6 mb-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:border-primary/20 transition-all"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {stat.label}
              </span>
              <div
                className={cn(
                  "p-2 rounded-xl transition-colors",
                  stat.color === "primary"
                    ? "bg-primary/10 text-primary"
                    : stat.color === "blue"
                      ? "bg-blue-500/10 text-blue-600"
                      : stat.color === "emerald"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-amber-500/10 text-amber-600",
                )}
              >
                {stat.icon}
              </div>
            </div>
            <div className="text-2xl font-black tracking-tight flex items-baseline gap-1">
              {stat.value}
            </div>

            <div
              className={cn(
                "absolute -right-4 -bottom-4 w-16 h-16 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity",
                stat.color === "primary"
                  ? "bg-primary"
                  : stat.color === "blue"
                    ? "bg-blue-500"
                    : stat.color === "emerald"
                      ? "bg-emerald-500"
                      : "bg-amber-500",
              )}
            />
          </div>
        ))}
      </div>

      {/* Meta Info Bar */}
      <div className="flex flex-wrap items-center gap-4 px-6 py-3 bg-muted/30 rounded-2xl border border-border/40 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm">
          <FolderTree className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {t(($) => $.course.courses.form.categoryId.label)}:
          </span>
          <span className="font-bold">{course.category?.name || "-"}</span>
        </div>

        <div className="h-4 w-px bg-border/60" />

        <div className="flex items-center gap-2 text-sm">
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {t(($) => $.education.grade.text)}:
          </span>
          <span className="font-bold">{course.grade?.name || "-"}</span>
        </div>

        <div className="h-4 w-px bg-border/60" />

        <div className="flex items-center gap-2 text-sm ml-auto">
          <CourseStatusBadge status={course.status} />
          {course.isPublic && (
            <Badge variant="outline" className="rounded-lg px-2.5 py-0.5 bg-background/50">
              {t(($) => $.course.courses.form.isPublic.label)}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
