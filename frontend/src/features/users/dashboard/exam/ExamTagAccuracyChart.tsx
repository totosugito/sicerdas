import { useState } from "react";
import { useTagStats } from "@/api/exam/user-stats";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Target, BarChart2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LocalePagination } from "@/components/ui/locale-pagination";
import { EmptyState } from "@/components/general";

interface ExamTagAccuracyChartProps {
  className?: string;
}

export const ExamTagAccuracyChart = ({ className }: ExamTagAccuracyChartProps) => {
  const { t } = useAppTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const { data: statsRes, isLoading } = useTagStats({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    sortBy: "accuracyRate",
    order: "desc",
  });

  const stats = statsRes?.data?.items || [];
  const meta = statsRes?.data?.meta;
  const totalItems = meta?.total || 0;
  const totalPages = meta?.totalPages || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4 px-6 py-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/3 rounded-md" />
                <Skeleton className="h-4 w-12 rounded-md" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      );
    }

    if (totalItems === 0) {
      return (
        <EmptyState
          variant="glow"
          color="primary"
          icon={Target}
          title={t(($) => $.exam.sessions.dashboard.empty.noStats)}
          description={t(($) => $.exam.sessions.dashboard.empty.noStatsDesc)}
          className="m-6 border-0 py-8"
        />
      );
    }

    return (
      <div className="space-y-5 px-6 py-5">
        {stats.map((item) => {
          const totalAnswered = Number(item.totalQuestionsAnswered);
          const hasAttempts = totalAnswered > 0;
          const accuracy = hasAttempts ? Math.round(parseFloat(item.accuracyRate)) : 0;

          // Determine progress bar color based on accuracy
          let progressColor = "bg-rose-500";
          if (!hasAttempts) {
            progressColor = "bg-slate-200 dark:bg-slate-700";
          } else if (accuracy >= 80) {
            progressColor = "bg-emerald-500";
          } else if (accuracy >= 60) {
            progressColor = "bg-amber-500";
          }

          return (
            <div key={item.tagId} className="space-y-1.5 group">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-700 dark:text-slate-300 truncate max-w-[65%] group-hover:text-primary transition-colors">
                  {item.tagName}
                </span>
                <span className="text-slate-900 dark:text-white flex items-center gap-1.5">
                  {hasAttempts ? (
                    <>
                      <span>{accuracy}%</span>
                      <span className="text-xs text-slate-400 font-normal">
                        ({item.totalCorrect}/{item.totalQuestionsAnswered})
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-normal italic">
                      {t(($) => $.exam.sessions.dashboard.charts.notAttempted)}
                    </span>
                  )}
                </span>
              </div>
              <div className="relative w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                  style={{ width: `${hasAttempts ? accuracy : 0}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className={`w-full shadow-sm overflow-hidden flex flex-col ${className || ""}`}>
      <CardHeader className="bg-muted/10 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">
              {t(($) => $.exam.sessions.dashboard.charts.subjectPerformance)}
            </CardTitle>
            <CardDescription className="text-xs font-medium">
              {t(($) => $.exam.sessions.dashboard.charts.subjectPerformanceDesc)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto max-h-[350px]">
        {renderContent()}
      </CardContent>
      {totalPages > 1 && (
        <CardFooter className="flex items-center justify-between border-t px-6 py-3 bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-xs text-slate-500 font-medium">
            {t(($) => $.exam.sessions.dashboard.charts.showingEntries, {
              start: startIndex + 1,
              end: Math.min(startIndex + ITEMS_PER_PAGE, totalItems),
              total: totalItems,
            })}
          </span>
          <LocalePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="mt-0"
          />
        </CardFooter>
      )}
    </Card>
  );
};
