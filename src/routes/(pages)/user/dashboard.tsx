import { createFileRoute } from "@tanstack/react-router";
import { useGlobalStats, useSubjectStats } from "@/api/exam-user-stats";
import { useAllSessionHistory } from "@/api/exam-sessions/history";
import { useBookList } from "@/api/book/book-list";
import { useAuth } from "@/hooks/use-auth";
import { useAppTranslation } from "@/lib/i18n-typed";
import {
  OverviewTab,
  AssessmentsTab,
  LibraryTab,
  ActivityTab,
  DashboardHero
} from "@/components/pages/user/dashboard";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Trophy,
  Book,
  LayoutGrid,
  History,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { AppRoute } from "@/constants/app-route";
import { z } from "zod";

export const dashboardSearchSchema = z.object({
  tab: z.enum(["overview", "assessments", "library", "activity"]).optional().catch("overview"),
  days: z.number().optional().catch(7),
});

export type DashboardSearch = z.infer<typeof dashboardSearchSchema>;

export const Route = createFileRoute("/(pages)/user/dashboard")({
  validateSearch: (search) => dashboardSearchSchema.parse(search),
  component: ExamDashboardComponent,
});

function ExamDashboardComponent() {
  const { user } = useAuth();
  const { t } = useAppTranslation();
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const activeTab = search.tab || "overview";
  const activityDays = search.days || 7;

  // Data Fetching
  const { data: globalStatsRes } = useGlobalStats({ days: activityDays });
  const globalStats = globalStatsRes?.data;

  const { data: subjectStatsRes } = useSubjectStats({ days: activityDays });
  const subjectStats = subjectStatsRes?.data?.items || [];

  const { data: historyRes, isLoading: isLoadingHistory } = useAllSessionHistory({
    limit: 10,
    page: 1
  });
  const history = historyRes?.data;

  const { data: bookHistoryRes } = useBookList({
    limit: 10,
    page: 1,
    isHistory: true
  });
  const bookHistory = bookHistoryRes?.data?.items || [];

  const { data: bookFavoritesRes } = useBookList({
    limit: 10,
    page: 1,
    isBookmarked: true
  });

  const handleTabChange = (value: string) => {
    navigate({
      search: (prev: DashboardSearch) => ({ ...prev, tab: value }),
    });
  };

  const handleDaysChange = (value: string) => {
    navigate({
      search: (prev: DashboardSearch) => ({ ...prev, days: parseInt(value) }),
    });
  };

  // Derived Stats
  const totalQuestions = subjectStats.reduce((acc, curr) => acc + curr.totalQuestionsAnswered, 0);
  const correctRate = totalQuestions > 0
    ? Math.round((subjectStats.reduce((acc, curr) => acc + curr.totalCorrect, 0) / totalQuestions) * 100)
    : 0;

  if (!isLoadingHistory && (!history || history.items.length === 0) && bookHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
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
    <div className="page-container">
      <div className="flex flex-col gap-6 w-full">
        {/* --- DASHBOARD HERO --- */}
        <DashboardHero
          user={user}
          activityDays={activityDays}
          handleDaysChange={handleDaysChange}
        />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-8">
          <div className="flex items-center justify-center sm:justify-start">
            <TabsList className="inline-flex items-center p-1.5 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 h-auto gap-1">
              <TabsTrigger
                value="overview"
                className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 gap-2"
              >
                <LayoutGrid className="w-4 h-4 transition-transform data-[state=active]:scale-110" />
                {t(($) => $.exam.sessions.dashboard.tabs.overview)}
              </TabsTrigger>
              <TabsTrigger
                value="assessments"
                className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 gap-2"
              >
                <Trophy className="w-4 h-4 transition-transform data-[state=active]:scale-110" />
                {t(($) => $.exam.sessions.dashboard.tabs.assessments)}
              </TabsTrigger>
              <TabsTrigger
                value="library"
                className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 gap-2"
              >
                <Book className="w-4 h-4 transition-transform data-[state=active]:scale-110" />
                {t(($) => $.exam.sessions.dashboard.tabs.library)}
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 gap-2"
              >
                <History className="w-4 h-4 transition-transform data-[state=active]:scale-110" />
                {t(($) => $.exam.sessions.dashboard.tabs.activity)}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* --- OVERVIEW TAB --- */}
          <TabsContent value="overview">
            <OverviewTab
              globalStats={globalStats}
              totalQuestions={totalQuestions}
              correctRate={correctRate}
              bookHistory={bookHistory}
              bookHistoryRes={bookHistoryRes}
              bookFavoritesRes={bookFavoritesRes}
              history={history}
              isLoadingHistory={isLoadingHistory}
              handleTabChange={handleTabChange}
            />
          </TabsContent>

          {/* --- ASSESSMENTS TAB --- */}
          <TabsContent value="assessments">
            <AssessmentsTab
              subjectStats={subjectStats}
              history={history}
              isLoadingHistory={isLoadingHistory}
            />
          </TabsContent>

          {/* --- LIBRARY TAB --- */}
          <TabsContent value="library">
            <LibraryTab />
          </TabsContent>

          {/* --- ACTIVITY TAB --- */}
          <TabsContent value="activity">
            <ActivityTab
              history={history}
              bookHistory={bookHistory}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
