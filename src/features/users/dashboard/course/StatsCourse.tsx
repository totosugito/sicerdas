import { useAppTranslation } from "@/lib/i18n-typed";
import { BookOpen, Award, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCourseGlobalStats } from "@/api/course/user-stats";

export const StatsCourse = () => {
  const { t } = useAppTranslation();
  const { data: statsRes, isLoading } = useCourseGlobalStats();
  const stats = statsRes?.data;

  const enrolledCount = stats?.totalCoursesEnrolled ?? 0;
  const completedCount = stats?.totalCoursesCompleted ?? 0;
  const lecturesCount = stats?.totalLecturesCompleted ?? 0;

  const items = [
    {
      label: t(($) => $.course.courses.table.cardLabels.enrolled),
      value: enrolledCount,
      icon: BookOpen,
      bg: "bg-blue-500/10",
      text: "text-blue-600 dark:text-blue-400",
    },
    {
      label: t(($) => $.course.public.player.completed),
      value: completedCount,
      icon: Award,
      bg: "bg-emerald-500/10",
      text: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: t(($) => $.course.dashboard.completedLectures),
      value: lecturesCount,
      icon: CheckCircle,
      bg: "bg-indigo-500/10",
      text: "text-indigo-600 dark:text-indigo-400",
    },
  ];

  if (isLoading) {
    return (
      <Card className="overflow-hidden animate-pulse">
        <CardContent className="h-24 bg-slate-100 dark:bg-slate-800" />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row items-stretch divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-white/5">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex-1 p-5 flex items-center gap-4 group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300",
                item.bg,
                item.text
              )}>
                <item.icon className="w-6 h-6" />
              </div>

              <div className="flex flex-col">
                <span className="text-2xl font-black tabular-nums tracking-tight text-slate-900 dark:text-white leading-none mb-1">
                  {item.value}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
