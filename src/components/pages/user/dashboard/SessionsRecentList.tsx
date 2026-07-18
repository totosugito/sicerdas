import { AllSessionHistoryResponse } from "@/api/exam/sessions/all";
import { EnumExamSessionStatus, EnumExamSessionMode } from "@/api/exam/sessions/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppRoute } from "@/constants/app-route";
import { useAppTranslation } from "@/lib/i18n-typed";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, XCircle, Clock, ChevronRight, Activity, History } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { string_to_locale_date } from "@/lib/my-utils";
import { EXAM_MODE_STYLES } from "@/constants/exam-var";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LocalePagination } from "@/components/custom/components/LocalePagination";

interface SessionsRecentListProps {
  history?: AllSessionHistoryResponse["data"];
  isLoading?: boolean;
  page?: number;
  onPageChange?: (page: number) => void;
  title?: string;
  description?: string;
}

export const SessionsRecentList = ({
  history,
  isLoading,
  page,
  onPageChange,
  title,
  description
}: SessionsRecentListProps) => {
  const { t, i18n } = useAppTranslation();

  const renderContent = () => {
    if (isLoading || !history) {
      // ... (skeleton logic remains same)
      return (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-5">
              <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-16 rounded-md" />
                  <Skeleton className="h-3 w-12 rounded-md" />
                </div>
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-6 w-12 rounded-md" />
                <Skeleton className="h-3 w-16 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (history.items.length === 0) {
      // ... (empty logic remains same)
      return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-3xl flex items-center justify-center border border-primary/20 dark:border-primary/80 shadow-xl shadow-primary/5">
              <Activity className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {t(($) => $.exam.sessions.history.empty)}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[280px] mt-2 font-medium leading-relaxed">
            {t(($) => $.exam.sessions.dashboard.empty.noStatsDesc)}
          </p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {history.items.map((session) => (
          <Link
            key={session.id}
            to={session.status === EnumExamSessionStatus.COMPLETED ? AppRoute.exam.results.url : AppRoute.exam.session.url}
            params={{ id: session.id }}
            className="group flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200"
          >
            <div className="flex-shrink-0">
              <div
                className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                  session.status === EnumExamSessionStatus.COMPLETED
                    ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                    : session.status === EnumExamSessionStatus.IN_PROGRESS
                      ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                )}
              >
                {session.status === EnumExamSessionStatus.COMPLETED ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : session.status === EnumExamSessionStatus.IN_PROGRESS ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-2 py-0 border-[1.5px]",
                    EXAM_MODE_STYLES[session.mode].bg,
                    EXAM_MODE_STYLES[session.mode].text,
                    EXAM_MODE_STYLES[session.mode].border
                  )}
                >
                  {session.mode === EnumExamSessionMode.STUDY
                    ? t(($) => $.exam.sessions.modeLabel.study)
                    : t(($) => $.exam.sessions.modeLabel.tryout)}
                </Badge>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">
                  {string_to_locale_date(i18n.language, session.startTime)}
                </span>
              </div>
              <h4 className="text-[15px] font-bold text-slate-900 dark:text-white truncate leading-tight group-hover:text-primary transition-colors">
                {session.packageTitle}
              </h4>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {session.sectionTitle}
              </p>
            </div>

            <div className="text-right shrink-0">
              {session.score !== null ? (
                <div className="flex flex-col items-end">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-2xl font-black text-primary leading-none">
                      {Math.round(session.score)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 leading-none">
                      / 100
                    </span>
                  </div>
                  <div className="flex items-center text-[10px] font-black text-primary uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    {t(($) => $.exam.sessions.dashboard.recentActivity.review)}
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-end">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {t(($) => $.exam.sessions.dashboard.recentActivity.noScore)}
                  </span>
                  <div className="flex items-center text-[10px] font-black text-amber-500 uppercase tracking-widest mt-2 transition-all duration-300 group-hover:translate-x-1">
                    {t(($) => $.exam.sessions.dashboard.recentActivity.resume)}
                    <ChevronRight className="w-3 h-3 ml-0.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              )}
            </div>
          </Link>
        ))}

        {history?.meta && history.meta.totalPages > 1 && page && onPageChange && (
          <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
            <LocalePagination
              currentPage={page}
              totalPages={history.meta.totalPages}
              onPageChange={onPageChange}
              className="mt-0"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/10 border-b flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <History className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">
              {title || t(($) => $.exam.sessions.dashboard.charts.recentActivity)}
            </CardTitle>
            <CardDescription className="text-xs font-medium">
              {description || t(($) => $.exam.sessions.dashboard.charts.recentActivityDesc)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {renderContent()}
      </CardContent>
    </Card>
  );
};
