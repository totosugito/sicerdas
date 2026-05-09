import { useAppTranslation } from "@/lib/i18n-typed";
import { 
  Trophy, 
  Percent, 
  FileText, 
  Book 
} from "lucide-react";
import { StatsCard } from "./StatsCard";

interface OverviewStatsProps {
  totalExamsTaken?: number;
  accuracyRate?: string;
  totalQuestionsAnswered?: number;
  totalMaterialsRead?: number;
}

export const OverviewStats = ({
  totalExamsTaken = 0,
  accuracyRate = "0",
  totalQuestionsAnswered = 0,
  totalMaterialsRead = 0,
}: OverviewStatsProps) => {
  const { t } = useAppTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      <StatsCard
        title={t(($) => $.exam.sessions.dashboard.stats.totalExams)}
        value={totalExamsTaken}
        icon={Trophy}
        description={t(($) => $.exam.sessions.dashboard.stats.totalExamsDesc)}
        iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
      />
      <StatsCard
        title={t(($) => $.exam.sessions.results.accuracy)}
        value={`${Math.round(parseFloat(accuracyRate))}%`}
        icon={Percent}
        description={t(($) => $.exam.sessions.dashboard.stats.avgScoreDesc)}
        iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
      />
      <StatsCard
        title={t(($) => $.exam.sessions.dashboard.stats.totalQuestions)}
        value={totalQuestionsAnswered}
        icon={FileText}
        description={t(($) => $.exam.sessions.dashboard.empty.noStatsDesc)}
        iconClassName="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
      />
      <StatsCard
        title={t(($) => $.book.dashboard.history.title)}
        value={totalMaterialsRead}
        icon={Book}
        description={t(($) => $.book.dashboard.history.description)}
        iconClassName="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
      />
    </div>
  );
};
