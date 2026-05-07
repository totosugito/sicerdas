import React from "react";
import {
  Trophy,
  Target,
  Book,
  Bookmark,
  TrendingUp,
  CheckCircle,
  Activity,
  ChevronRight
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { AppRoute } from "@/constants/app-route";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  StatsCard,
  RecentSessionsList,
  RecentBooksList,
  ActivityBarChart
} from "@/components/pages/user/dashboard";
import { useAppTranslation } from "@/lib/i18n-typed";

interface OverviewTabProps {
  globalStats: any;
  totalQuestions: number;
  correctRate: number;
  bookHistory: any[];
  bookHistoryRes: any;
  bookFavoritesRes: any;
  history: any;
  isLoadingHistory: boolean;
  handleTabChange: (value: string) => void;
}

export function OverviewTab({
  globalStats,
  totalQuestions,
  correctRate,
  bookHistory,
  bookHistoryRes,
  bookFavoritesRes,
  history,
  isLoadingHistory,
  handleTabChange,
}: OverviewTabProps) {
  const { t } = useAppTranslation();

  return (
    <div className="space-y-6 mt-0 animate-in fade-in duration-300">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <StatsCard
          title={t(($) => $.exam.sessions.dashboard.stats.totalExams)}
          value={globalStats?.totalExamsTaken || 0}
          icon={Trophy}
          description={t(($) => $.exam.sessions.dashboard.stats.totalExamsDesc)}
          iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatsCard
          title={t(($) => $.exam.sessions.dashboard.stats.avgScore)}
          value={globalStats ? Math.round(parseFloat(globalStats.averageScore)) : 0}
          icon={Target}
          description={t(($) => $.exam.sessions.dashboard.stats.avgScoreDesc)}
          iconClassName="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
        />
        <StatsCard
          title={t(($) => $.book.dashboard.history.title)}
          value={bookHistoryRes?.data?.meta?.total || 0}
          icon={Book}
          description={t(($) => $.book.dashboard.history.description)}
          iconClassName="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        />
        <StatsCard
          title={t(($) => $.book.dashboard.favorites.title)}
          value={bookFavoritesRes?.data?.meta?.total || 0}
          icon={Bookmark}
          description={t(($) => $.book.dashboard.favorites.description)}
          iconClassName="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Highlights - Unified Split View */}
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/10 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">{t(($) => $.exam.sessions.dashboard.recentHighlights)}</CardTitle>
                  <CardDescription className="text-xs font-medium">{t(($) => $.exam.sessions.dashboard.recentHighlightsDesc)}</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-2">
              <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t(($) => $.exam.sessions.dashboard.latestExams)}</span>
                <Link to={AppRoute.user.history.url} className="text-[10px] font-black uppercase text-primary hover:underline">{t(($) => $.exam.sessions.dashboard.charts.seeAll)}</Link>
              </div>
              {history && <RecentSessionsList history={{ ...history, items: history.items.slice(0, 4) }} isLoading={isLoadingHistory} />}
            </div>
          </CardContent>
        </Card>

        {/* Engagement Summary Chart */}
        <Card className="shadow-sm overflow-hidden h-full">
          <CardHeader className="bg-muted/10 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">{t(($) => $.exam.sessions.dashboard.charts.activityHistory)}</CardTitle>
                <CardDescription className="text-xs font-medium">{t(($) => $.exam.sessions.dashboard.charts.activityHistoryDesc)}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-4">
            <ActivityBarChart days={7} className="h-[280px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
