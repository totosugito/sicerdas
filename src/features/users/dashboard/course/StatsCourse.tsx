import { useAppTranslation } from "@/lib/i18n-typed";
import { BookOpen, Award, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCourseGlobalStats } from "@/api/course/user-stats";
import { StatsCard } from "../StatsCard";

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
      iconClassName: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
      description: t(($) => $.course.dashboard.stats.enrolledDesc),
    },
    {
      label: t(($) => $.course.public.player.completed),
      value: completedCount,
      icon: Award,
      iconClassName: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
      description: t(($) => $.course.dashboard.stats.completedDesc),
    },
    {
      label: t(($) => $.course.dashboard.completedLectures),
      value: lecturesCount,
      icon: CheckCircle,
      iconClassName: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
      description: t(($) => $.course.dashboard.stats.lecturesDesc),
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm animate-pulse">
            <CardContent className="h-24 bg-slate-50/50 dark:bg-slate-900/50" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((item, index) => (
        <StatsCard
          key={index}
          title={item.label}
          value={item.value}
          icon={item.icon}
          iconClassName={item.iconClassName}
          description={item.description}
          className="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
        />
      ))}
    </div>
  );
};
