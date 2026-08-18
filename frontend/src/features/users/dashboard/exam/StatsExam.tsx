import { useAppTranslation } from "@/lib/i18n-typed";
import { Trophy, Percent, FileText, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useGlobalStats } from "@/api/exam/user-stats";
import { StatsCard } from "../StatsCard";

export const StatsExam = () => {
  const { t } = useAppTranslation();
  const { data: statsRes, isLoading } = useGlobalStats();
  const stats = statsRes?.data;

  const totalExams = stats?.totalExamsTaken ?? 0;
  const accuracyRate = stats?.accuracyRate ?? "0";
  const totalQuestions = stats?.totalQuestionsAnswered ?? 0;
  const averageScore = stats?.averageScore ?? "0";
  const totalCorrect = stats?.totalCorrectAnswers ?? 0;
  const totalWrong = stats?.totalWrongAnswers ?? 0;

  const items = [
    {
      label: t(($) => $.exam.sessions.dashboard.stats.totalExams),
      value: totalExams,
      icon: Trophy,
      iconClassName: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
      description: t(($) => $.exam.sessions.dashboard.stats.totalExamsDesc),
    },
    {
      label: t(($) => $.exam.sessions.dashboard.stats.avgScore),
      value: `${Math.round(parseFloat(averageScore))}`,
      icon: Award,
      iconClassName: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
      description: t(($) => $.exam.sessions.dashboard.stats.avgScoreDesc),
    },
    {
      label: t(($) => $.exam.sessions.dashboard.stats.accuracy),
      value: `${Math.round(parseFloat(accuracyRate))}%`,
      icon: Percent,
      iconClassName: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
      description: t(($) => $.exam.sessions.dashboard.stats.accuracyDesc),
    },
    {
      label: t(($) => $.exam.sessions.dashboard.stats.totalQuestions),
      value: totalQuestions,
      icon: FileText,
      iconClassName: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
      description: `${t(($) => $.exam.sessions.results.stats.correct)}: ${totalCorrect} | ${t(($) => $.exam.sessions.results.stats.wrong)}: ${totalWrong}`,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm animate-pulse">
            <CardContent className="h-24 bg-slate-50/50 dark:bg-slate-900/50" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
