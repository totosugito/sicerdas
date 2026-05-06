import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useGlobalStats, useSubjectStats, useActivityStats } from "@/api/exam-user-stats";
import { useAllSessionHistory } from "@/api/exam-sessions/history";
import { useAppTranslation } from "@/lib/i18n-typed";
import {
  StatsCard,
  SubjectRadarChart,
  ActivityBarChart,
  RecentSessionsList,
  FavoritePackagesList
} from "@/components/pages/exam/dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trophy,
  Target,
  CheckCircle,
  Activity,
  Rocket,
  Clock,
  Bookmark
} from "lucide-react";
import { LoadingView } from "@/components/app/LoadingView";
import { Button } from "@/components/ui/button";
import { AppRoute } from "@/constants/app-route";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { z } from "zod";

const dashboardSearchSchema = z.object({
  days: z.number().optional().catch(7),
});

export const Route = createFileRoute("/(pages)/exam/dashboard")({
  validateSearch: (search) => dashboardSearchSchema.parse(search),
  component: ExamDashboardComponent,
});

type DashboardSearch = z.infer<typeof dashboardSearchSchema>;

function ExamDashboardComponent() {
  const { t } = useAppTranslation();
  const search = useSearch({ from: Route.id });
  const navigate = useNavigate({ from: Route.id });
  const activityDays = search.days ?? 7;

  const { data: globalStatsRes, isLoading: isLoadingGlobal } = useGlobalStats();
  const { data: subjectStatsRes, isLoading: isLoadingSubjects } = useSubjectStats();
  const { data: historyRes, isLoading: isLoadingHistory } = useAllSessionHistory({ limit: 5 });

  const globalStats = globalStatsRes?.data;
  const subjectStats = subjectStatsRes?.data?.items || [];
  const history = historyRes?.data;

  const totalQuestions = globalStats?.totalQuestionsAnswered || 0;
  const correctRate = Math.round(parseFloat(globalStats?.accuracyRate || "0"));

  const handleDaysChange = (value: string) => {
    navigate({
      search: (prev: DashboardSearch) => ({ ...prev, days: parseInt(value) }),
    });
  };

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
    <div className="page-container-no-top">
      {/* Header / Hero */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900 text-white p-8 lg:p-12 shadow-2xl shadow-slate-200 dark:shadow-none w-full">
        <div className="relative z-10 max-w-2xl">
          <Badge className="bg-primary hover:bg-primary text-white border-none px-3 py-1 mb-4 rounded-full font-bold uppercase tracking-widest text-[10px]">
            {t(($) => $.exam.sessions.dashboard.badge)}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
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
          description={t(($) => $.exam.sessions.dashboard.stats.totalCorrectDesc, { count: totalQuestions })}
          iconClassName="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-stretch mt-2">
        {/* Radar Chart Card */}
        <Card className="rounded-3xl border-slate-100 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden gap-0">
          <CardHeader className="pb-4 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100/50 dark:border-slate-800/50">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-8 bg-primary rounded-full shadow-sm" />
              <div>
                <CardTitle className="text-xl font-bold tracking-tight">
                  {t(($) => $.exam.sessions.dashboard.charts.subjectPerformance)}
                </CardTitle>
                <CardDescription className="text-sm font-medium opacity-80">
                  {t(($) => $.exam.sessions.dashboard.charts.subjectPerformanceDesc)}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-[400px]">
            {isLoadingSubjects ? (
              <LoadingView
                title={t(($) => $.exam.sessions.dashboard.charts.loadingTitle)}
                message={t(($) => $.exam.sessions.dashboard.charts.loadingMessage)}
                className="h-full border-0 bg-transparent shadow-none"
              />
            ) : (
              <SubjectRadarChart stats={subjectStats} className="h-full w-full" />
            )}
          </CardContent>
        </Card>

        {/* Activity Bar Chart Card */}
        <Card className="rounded-3xl border-slate-100 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden gap-0">
          <CardHeader className="pb-4 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100/50 dark:border-slate-800/50">
            <div className="flex flex-row items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-8 bg-indigo-500 rounded-full shadow-sm" />
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight">
                    {t(($) => $.exam.sessions.dashboard.charts.activityHistory)}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium opacity-80">
                    {t(($) => $.exam.sessions.dashboard.charts.activityHistoryDesc)}
                  </CardDescription>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <Select
                  value={activityDays.toString()}
                  onValueChange={handleDaysChange}
                >
                  <SelectTrigger className="w-[130px] h-8 border-0 bg-transparent shadow-none font-bold focus:ring-0 text-xs px-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800 shadow-xl">
                    <SelectItem value="7" className="rounded-lg font-medium text-xs">
                      {t(($) => $.exam.sessions.dashboard.charts.activityRange.last7Days)}
                    </SelectItem>
                    <SelectItem value="14" className="rounded-lg font-medium text-xs">
                      {t(($) => $.exam.sessions.dashboard.charts.activityRange.last14Days)}
                    </SelectItem>
                    <SelectItem value="30" className="rounded-lg font-medium text-xs">
                      {t(($) => $.exam.sessions.dashboard.charts.activityRange.last30Days)}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-[400px]">
            <ActivityBarChart days={activityDays} className="h-full w-full" />
          </CardContent>
        </Card>
      </div>

      {/* Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-stretch">
        {/* Recent Activity Card */}
        <Card className="rounded-3xl border-slate-100 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100/50 dark:border-slate-800/50">
            <div className="flex flex-row items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-8 bg-blue-600 rounded-full shadow-sm" />
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight">
                    {t(($) => $.exam.sessions.dashboard.charts.recentActivity)}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium opacity-80">
                    {t(($) => $.exam.sessions.dashboard.charts.recentActivityDesc)}
                  </CardDescription>
                </div>
              </div>
              <Link to={AppRoute.exam.history.url}>
                <Button variant="outline" size="sm" className="rounded-full font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                  {t(($) => $.exam.sessions.dashboard.charts.seeAll)}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {history && (
              <RecentSessionsList
                history={{ ...history, items: history.items.slice(0, 4) }}
                isLoading={isLoadingHistory}
              />
            )}
          </CardContent>
        </Card>

        {/* Favorite Packages Card */}
        <Card className="rounded-3xl border-slate-100 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100/50 dark:border-slate-800/50">
            <div className="flex flex-row items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-8 bg-amber-500 rounded-full shadow-sm" />
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight">
                    {t(($) => $.exam.sessions.dashboard.favorites.title)}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium opacity-80">
                    {t(($) => $.exam.sessions.dashboard.favorites.description)}
                  </CardDescription>
                </div>
              </div>
              <Link to={AppRoute.exam.favorites.url}>
                <Button variant="outline" size="sm" className="rounded-full font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                  {t(($) => $.exam.sessions.dashboard.charts.seeAll)}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <FavoritePackagesList limit={4} />
          </CardContent>
        </Card>
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
