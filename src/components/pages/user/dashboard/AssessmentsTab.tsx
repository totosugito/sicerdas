import React from "react";
import { Bookmark } from "lucide-react";
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
  SubjectRadarChart,
  RecentSessionsList,
  FavoritePackagesList
} from "@/components/pages/user/dashboard";
import { useAppTranslation } from "@/lib/i18n-typed";

interface AssessmentsTabProps {
  subjectStats: any;
  history: any;
  isLoadingHistory: boolean;
}

export function AssessmentsTab({
  subjectStats,
  history,
  isLoadingHistory,
}: AssessmentsTabProps) {
  const { t } = useAppTranslation();

  return (
    <div className="space-y-6 mt-0 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">{t(($) => $.exam.sessions.dashboard.charts.subjectPerformance)}</CardTitle>
            <CardDescription className="text-xs font-medium">{t(($) => $.exam.sessions.dashboard.charts.subjectPerformanceDesc)}</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <SubjectRadarChart stats={subjectStats} className="h-[350px] w-full" />
          </CardContent>
        </Card>

        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/10 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">{t(($) => $.exam.sessions.dashboard.charts.recentActivity)}</CardTitle>
              <CardDescription className="text-xs font-medium">{t(($) => $.exam.sessions.dashboard.charts.recentActivityDesc)}</CardDescription>
            </div>
            <Link to={AppRoute.user.history.url}>
              <Button variant="outline" size="sm" className="h-8">
                {t(($) => $.exam.sessions.dashboard.charts.seeAll)}
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {history && <RecentSessionsList history={history} isLoading={isLoadingHistory} />}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/10 border-b flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">{t(($) => $.exam.sessions.dashboard.favorites.title)}</CardTitle>
              <CardDescription className="text-xs font-medium">{t(($) => $.exam.sessions.dashboard.favorites.description)}</CardDescription>
            </div>
          </div>
          <Link to={AppRoute.user.favorites.url}>
            <Button variant="outline" size="sm" className="h-8">
              {t(($) => $.exam.sessions.dashboard.charts.seeAll)}
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <FavoritePackagesList />
        </CardContent>
      </Card>
    </div>
  );
}
