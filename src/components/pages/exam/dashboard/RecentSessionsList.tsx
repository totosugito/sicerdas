import { AllSessionHistoryResponse } from "@/api/exam-sessions/history";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppRoute } from "@/constants/app-route";
import { useAppTranslation } from "@/lib/i18n-typed";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, XCircle, Clock, ChevronRight, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface RecentSessionsListProps {
  history: AllSessionHistoryResponse["data"];
  isLoading?: boolean;
}

export const RecentSessionsList = ({ history, isLoading }: RecentSessionsListProps) => {
  const { t } = useAppTranslation();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (history.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
        <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          {t(($) => $.exam.sessions.history.empty)}
        </h3>
        <p className="text-sm text-slate-500 max-w-[250px]">
          Start your first exam to see your history here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.items.map((session) => (
        <div
          key={session.id}
          className="group relative flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
        >
          <div className="flex-shrink-0">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                session.status === "completed"
                  ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  : session.status === "in_progress"
                  ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              )}
            >
              {session.status === "completed" ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : session.status === "in_progress" ? (
                <Clock className="w-6 h-6" />
              ) : (
                <XCircle className="w-6 h-6" />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0">
                {session.mode}
              </Badge>
              <span className="text-[10px] font-bold text-muted-foreground">
                {format(new Date(session.startTime), "PPP p")}
              </span>
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
              {session.packageTitle}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {session.sectionTitle}
            </p>
          </div>

          <div className="text-right shrink-0">
            {session.score !== null ? (
              <div className="mb-1">
                <span className="text-xl font-black text-primary">
                  {Math.round(session.score)}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground ml-1">
                  / 100
                </span>
              </div>
            ) : (
              <div className="mb-1">
                <span className="text-xs font-bold text-muted-foreground italic">
                  No Score
                </span>
              </div>
            )}
            <Link
              to={session.status === "completed" ? AppRoute.exam.results.url : AppRoute.exam.session.url}
              params={{ id: session.id }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] font-bold uppercase tracking-wider px-2 group-hover:bg-primary group-hover:text-white transition-colors"
              >
                {session.status === "completed" ? "Review" : "Resume"}
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};
