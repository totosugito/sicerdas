import { createFileRoute } from "@tanstack/react-router";
import { useGlobalStats, useSubjectStats } from "@/api/exam-user-stats";
import { useAllSessionHistory } from "@/api/exam-sessions/history";
import { useAppTranslation } from "@/lib/i18n-typed";
import { StatsCard } from "@/components/pages/exam/dashboard/StatsCard";
import { SubjectRadarChart } from "@/components/pages/exam/dashboard/SubjectRadarChart";
import { RecentSessionsList } from "@/components/pages/exam/dashboard/RecentSessionsList";
import { 
  Trophy, 
  Target, 
  CheckCircle, 
  BarChart3, 
  Activity,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppRoute } from "@/constants/app-route";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/(pages)/exam/dashboard")({
  component: ExamDashboardComponent,
});

function ExamDashboardComponent() {
  const { t } = useAppTranslation();

  const { data: globalStatsRes, isLoading: isLoadingGlobal } = useGlobalStats();
  const { data: subjectStatsRes, isLoading: isLoadingSubjects } = useSubjectStats();
  const { data: historyRes, isLoading: isLoadingHistory } = useAllSessionHistory({ limit: 5 });

  const globalStats = globalStatsRes?.data;
  const subjectStats = subjectStatsRes?.data || [];
  const history = historyRes?.data;

  const totalQuestions = globalStats?.totalQuestionsAnswered || 0;
  const correctRate = totalQuestions > 0 
    ? Math.round((globalStats?.totalCorrectAnswers || 0) / totalQuestions * 100) 
    : 0;

  if (!isLoadingGlobal && !globalStats) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <Rocket className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-black mb-2">{t(($) => $.exam.sessions.dashboard.empty.noStats)}</h2>
        <p className="text-slate-500 max-w-md mb-8">
          {t(($) => $.exam.sessions.dashboard.empty.noStatsDesc)}
        </p>
        <Link to={AppRoute.exam.exams.url}>
          <Button size="lg" className="rounded-full px-8 font-bold shadow-lg shadow-primary/20">
            {t(($) => $.exam.sessions.dashboard.empty.startExam)}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container space-y-8 pb-12">
      {/* Header / Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 lg:p-12 shadow-2xl shadow-slate-200 dark:shadow-none">
        <div className="relative z-10 max-w-2xl">
          <Badge className="bg-primary hover:bg-primary text-white border-none px-3 py-1 mb-4 rounded-full font-bold uppercase tracking-widest text-[10px]">
             User Performance Dashboard
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight leading-[1.1]">
            {t(($) => $.exam.sessions.dashboard.title)}
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed mb-0">
            {t(($) => $.exam.sessions.dashboard.description)}
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-30%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t(($) => $.exam.sessions.dashboard.stats.totalExams)}
          value={globalStats?.totalExamsTaken || 0}
          icon={Trophy}
          description={t(($) => $.exam.sessions.dashboard.stats.totalExamsDesc)}
          iconClassName="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        />
        <StatsCard
          title={t(($) => $.exam.sessions.dashboard.stats.avgScore)}
          value={globalStats ? Math.round(parseFloat(globalStats.averageScore)) : 0}
          icon={Target}
          description={t(($) => $.exam.sessions.dashboard.stats.avgScoreDesc)}
          iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatsCard
          title={t(($) => $.exam.sessions.dashboard.stats.accuracy)}
          value={`${correctRate}%`}
          icon={CheckCircle}
          description={t(($) => $.exam.sessions.dashboard.stats.accuracyDesc)}
          iconClassName="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />
        <StatsCard
          title={t(($) => $.exam.sessions.dashboard.stats.totalCorrect)}
          value={globalStats?.totalCorrectAnswers || 0}
          icon={Activity}
          description={`Dari ${totalQuestions} soal`}
          iconClassName="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Radar Chart Section */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black flex items-center gap-2">
                <div className="w-2 h-8 bg-primary rounded-full" />
                {t(($) => $.exam.sessions.dashboard.charts.subjectPerformance)}
              </h2>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                {t(($) => $.exam.sessions.dashboard.charts.subjectPerformanceDesc)}
              </p>
            </div>
          </div>
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 min-h-[450px] shadow-sm">
            {isLoadingSubjects ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <SubjectRadarChart stats={subjectStats} className="h-full w-full" />
            )}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black flex items-center gap-2">
                <div className="w-2 h-8 bg-blue-600 rounded-full" />
                {t(($) => $.exam.sessions.dashboard.charts.recentActivity)}
              </h2>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                {t(($) => $.exam.sessions.dashboard.charts.recentActivityDesc)}
              </p>
            </div>
            <Link to={AppRoute.exam.exams.url}>
              <Button variant="outline" size="sm" className="rounded-full font-bold">
                See All
              </Button>
            </Link>
          </div>
          <div className="flex-1">
            {history && <RecentSessionsList history={history} isLoading={isLoadingHistory} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal Badge for local use
const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}>
    {children}
  </span>
);
