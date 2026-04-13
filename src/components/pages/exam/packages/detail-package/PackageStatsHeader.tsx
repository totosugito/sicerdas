import React from "react";
import { ExamPackage } from "@/api/exam-packages";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Badge } from "@/components/ui/badge";
import { Eye, Bookmark, Star, Clock, Trophy, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface PackageStatsHeaderProps {
  pkg: ExamPackage;
  isLoading?: boolean;
}

export function PackageStatsHeader({ pkg, isLoading }: PackageStatsHeaderProps) {
  const { t } = useAppTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 bg-muted animate-pulse rounded-2xl border border-border/50"
          />
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: t(($) => $.exam.packages.table.columns.views),
      value: pkg.viewCount || 0,
      icon: <Eye className="h-5 w-5 text-blue-500" />,
      color: "blue",
    },
    {
      label: t(($) => $.exam.packages.table.columns.bookmarks),
      value: pkg.bookmarkCount || 0,
      icon: <Bookmark className="h-5 w-5 text-emerald-500" />,
      color: "emerald",
    },
    {
      label: t(($) => $.exam.packages.table.columns.rating),
      value: Number(pkg.rating || 0).toFixed(1),
      icon: <Star className="h-5 w-5 text-amber-500 fill-amber-500/20" />,
      color: "amber",
    },
    {
      label: t(($) => $.exam.packages.table.columns.questions),
      value: `${pkg.activeQuestions} / ${pkg.totalQuestions}`,
      icon: <Trophy className="h-5 w-5 text-purple-500" />,
      color: "purple",
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
                  stat.color === "blue"
                    ? "bg-blue-500/10 text-blue-600"
                    : stat.color === "emerald"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : stat.color === "amber"
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-purple-500/10 text-purple-600",
                )}
              >
                {stat.icon}
              </div>
            </div>
            <div className="text-2xl font-black tracking-tight flex items-baseline gap-1">
              {stat.value}
            </div>

            {/* Subtle background glow on hover */}
            <div
              className={cn(
                "absolute -right-4 -bottom-4 w-16 h-16 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity",
                stat.color === "blue"
                  ? "bg-blue-500"
                  : stat.color === "emerald"
                    ? "bg-emerald-500"
                    : stat.color === "amber"
                      ? "bg-amber-500"
                      : "bg-purple-500",
              )}
            />
          </div>
        ))}
      </div>

      {/* Meta Info Bar */}
      <div className="flex flex-wrap items-center gap-4 px-6 py-3 bg-muted/30 rounded-2xl border border-border/40 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm">
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {t(($) => $.exam.packages.table.columns.educationGrade)}:
          </span>
          <span className="font-bold">{pkg.educationGradeName || "-"}</span>
        </div>

        <div className="h-4 w-px bg-border/60" />

        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {t(($) => $.exam.packages.table.columns.duration)}:
          </span>
          <span className="font-bold">
            {pkg.durationMinutes} {t(($) => $.labels.minutes)}
          </span>
        </div>

        <div className="h-4 w-px bg-border/60" />

        <div className="flex items-center gap-2 text-sm ml-auto">
          <Badge
            variant={pkg.isActive ? "success" : "secondary"}
            className="rounded-lg px-2.5 py-0.5"
          >
            {pkg.isActive ? t(($) => $.labels.active) : t(($) => $.labels.inactive)}
          </Badge>
          <Badge variant="outline" className="capitalize rounded-lg px-2.5 py-0.5 bg-background/50">
            {pkg.examType?.replaceAll("_", " ")}
          </Badge>
        </div>
      </div>
    </div>
  );
}
