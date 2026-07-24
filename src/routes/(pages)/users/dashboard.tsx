import { createFileRoute } from "@tanstack/react-router";
import { useGlobalStats, useSubjectStats } from "@/api/exam/user-stats";
import { useAllSessionHistory } from "@/api/exam/sessions/all";
import { useBookHistory, useBookStats } from "@/api/book";
import { useUserProfileQuery } from "@/api/users";
import { useAuth } from "@/hooks/use-auth";
import { useAppTranslation } from "@/lib/i18n-typed";
import { EnumExamSessionStatus } from "@/api/exam/sessions/types";
import {
  Trophy,
  Book,
  LayoutGrid,
  Clock
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectPositioner,
} from "@/components/ui/select";
import {
  DashboardHero,
  SessionsRecentList,
  PackagesFavoriteList,
  BooksRecentList,
  BooksFavoriteList,
  SubjectRadarChart,
  ActivityBarChart,
  OverviewStats,
  StatsBook
} from "@/components/pages/users/dashboard";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { z } from "zod";

export const dashboardSearchSchema = z.object({
  tab: z.enum(["overview", "assessments", "library"]).optional().catch("overview"),
  days: z.number().optional().catch(7),
  bookFavPage: z.number().optional().catch(1),
  bookRecentPage: z.number().optional().catch(1),
  assessmentPage: z.number().optional().catch(1),
  packageFavPage: z.number().optional().catch(1),
});

export type DashboardSearch = z.infer<typeof dashboardSearchSchema>;

export const Route = createFileRoute("/(pages)/users/dashboard")({
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
  const bookFavPage = search.bookFavPage || 1;
  const bookRecentPage = search.bookRecentPage || 1;
  const assessmentPage = search.assessmentPage || 1;
  const packageFavPage = search.packageFavPage || 1;

  // Data Fetching
  const { data: globalStatsRes } = useGlobalStats({ enabled: activeTab === "overview" });
  const globalStats = globalStatsRes?.data;

  const { data: profileRes } = useUserProfileQuery();
  const profile = profileRes?.data;

  const { data: subjectStatsRes } = useSubjectStats({ page: 1, limit: activityDays }, { enabled: activeTab === "overview" });
  const subjectStats = subjectStatsRes?.data?.items || [];

  // Active Sessions (Overview Tab)
  const { data: activeSessionsRes, isLoading: isLoadingActiveSessions } = useAllSessionHistory({
    limit: 5,
    page: 1,
    status: EnumExamSessionStatus.IN_PROGRESS
  }, {
    enabled: activeTab === "overview" || activeTab === "library"
  });
  const activeSessions = activeSessionsRes?.data;

  // Session History (Assessments Tab)
  const { data: historyRes, isLoading: isLoadingHistory } = useAllSessionHistory({
    limit: 5,
    page: assessmentPage
  }, {
    enabled: activeTab === "assessments"
  });
  const history = historyRes?.data;

  const { data: bookHistoryRes } = useBookHistory({
    limit: 5,
    page: bookRecentPage
  }, {
    enabled: activeTab === "overview" || activeTab === "library"
  });

  const { data: bookStatsRes } = useBookStats({
    enabled: activeTab === "overview" || activeTab === "library"
  });

  const handleTabChange = (value: string) => {
    navigate({
      search: (prev: DashboardSearch) => ({ ...prev, tab: value }),
    });
  };

  const handleDaysChange = (value: string | null) => {
    if (value !== null) {
      navigate({
        search: (prev: DashboardSearch) => ({ ...prev, days: parseInt(value) }),
      });
    }
  };

  const handleBookFavPageChange = (page: number) => {
    navigate({
      search: (prev: DashboardSearch) => ({ ...prev, bookFavPage: page }),
    });
  };

  const handleBookRecentPageChange = (page: number) => {
    navigate({
      search: (prev: DashboardSearch) => ({ ...prev, bookRecentPage: page }),
    });
  };

  const handleAssessmentPageChange = (page: number) => {
    navigate({
      search: (prev: DashboardSearch) => ({ ...prev, assessmentPage: page }),
    });
  };

  const handlePackageFavPageChange = (page: number) => {
    navigate({
      search: (prev: DashboardSearch) => ({ ...prev, packageFavPage: page }),
    });
  };


  return (
    <div className="page-container">
      <div className="flex flex-col gap-6 w-full">
        {/* --- DASHBOARD HERO --- */}
        <DashboardHero
          user={user}
          profile={profile}
        />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-2">
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
            </TabsList>
          </div>

          {/* --- OVERVIEW TAB --- */}
          <TabsContent value="overview" className="space-y-6 mt-0 animate-in fade-in duration-300">
            {/* Quick Stats Grid */}
            <OverviewStats
              totalExamsTaken={globalStats?.totalExamsTaken}
              accuracyRate={globalStats?.accuracyRate}
              totalQuestionsAnswered={globalStats?.totalQuestionsAnswered}
              totalMaterialsRead={bookHistoryRes?.pagination?.total}
            />

            {/* Activity Filter */}
            <div className="flex items-center justify-end gap-3 mb-4">
              <span className="text-[12px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {t(($) => $.exam.sessions.dashboard.charts.period)}
              </span>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-1 rounded-xl flex items-center shadow-md hover:shadow-lg transition-all duration-200">
                <Select value={activityDays.toString()} onValueChange={handleDaysChange}>
                  <SelectTrigger className="w-[160px] bg-transparent border-none text-slate-900 dark:text-slate-100 font-bold text-sm h-8 focus:ring-0">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>
                        {activityDays === 7 && t(($) => $.exam.sessions.dashboard.charts.activityRange.last7Days)}
                        {activityDays === 14 && t(($) => $.exam.sessions.dashboard.charts.activityRange.last14Days)}
                        {activityDays === 30 && t(($) => $.exam.sessions.dashboard.charts.activityRange.last30Days)}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectPositioner>
                    <SelectContent className="rounded-xl shadow-2xl border-slate-200 dark:border-slate-800">
                      <SelectItem value="7" className="font-medium">{t(($) => $.exam.sessions.dashboard.charts.activityRange.last7Days)}</SelectItem>
                      <SelectItem value="14" className="font-medium">{t(($) => $.exam.sessions.dashboard.charts.activityRange.last14Days)}</SelectItem>
                      <SelectItem value="30" className="font-medium">{t(($) => $.exam.sessions.dashboard.charts.activityRange.last30Days)}</SelectItem>
                    </SelectContent>
                  </SelectPositioner>
                </Select>
              </div>
            </div>

            {/* Engagement Summary Chart */}
            <ActivityBarChart days={activityDays} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subject Performance Radar */}
              <SubjectRadarChart stats={subjectStats} />

              {/* Recent Highlights - Active Sessions */}
              <SessionsRecentList
                history={activeSessions}
                isLoading={isLoadingActiveSessions}
                title={t(($) => $.exam.sessions.active.title)}
                description={t(($) => $.exam.sessions.dashboard.charts.recentActivityDesc)}
              />
            </div>
          </TabsContent>

          {/* --- ASSESSMENTS TAB --- */}
          <TabsContent value="assessments" className="mt-0 outline-none space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SessionsRecentList
                history={history}
                isLoading={isLoadingHistory}
                page={assessmentPage}
                onPageChange={handleAssessmentPageChange}
                title={t(($) => $.exam.sessions.dashboard.charts.recentActivity)}
                description={t(($) => $.exam.sessions.dashboard.charts.recentActivityDesc)}
              />

              <PackagesFavoriteList
                page={packageFavPage}
                onPageChange={handlePackageFavPageChange}
              />
            </div>
          </TabsContent>

          {/* --- LIBRARY TAB --- */}
          <TabsContent value="library" className="mt-0 outline-none space-y-6 animate-in fade-in duration-300">
            {/* Library Collection Summary */}
            <StatsBook
              totalFavorites={bookStatsRes?.data?.totalFavorites}
              totalMaterialsRead={bookStatsRes?.data?.totalMaterialsRead}
              totalDownloads={bookStatsRes?.data?.totalDownloads}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BooksRecentList
                page={bookRecentPage}
                onPageChange={handleBookRecentPageChange}
              />
              <BooksFavoriteList page={bookFavPage} onPageChange={handleBookFavPageChange} />
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
