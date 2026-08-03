import React from "react";
import { Loader2, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useSessionHistory } from "@/api/exam/sessions";
import { EnumExamSessionStatus } from "@/api/exam/types";
import { ExamSessionStatusConfig } from "@/constants/app-enum";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { AppRoute } from "@/constants/app-route";

import { LocalePagination } from "@/components/ui/locale-pagination";

interface PlayerExamHistoryProps {
  packageId?: string;
  sectionId?: string;
  onSetExamSessionId: (sessionId?: string) => void;
  courseId?: string;
  lectureId?: string;
}

export const PlayerExamHistory: React.FC<PlayerExamHistoryProps> = ({
  packageId,
  sectionId,
  onSetExamSessionId,
  courseId,
  lectureId,
}) => {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);

  const { data: historyRes, isLoading: isHistoryLoading } = useSessionHistory(
    packageId,
    sectionId,
    { page, limit: 5 }
  );

  const history = historyRes?.data?.items || [];
  const totalPages = historyRes?.data?.meta?.totalPages || 0;

  const getStatusBadge = (status: string) => {
    const config = ExamSessionStatusConfig[status as keyof typeof ExamSessionStatusConfig];
    if (!config) return null;

    return (
      <Badge
        variant={config.variant as any}
        className={cn(
          "px-1.5 py-0 text-[10px] uppercase font-bold",
          config.animate && "animate-pulse",
        )}
      >
        {t(($) => ($.exam.sessions.status as any)[config.labelKey.split(".").pop()!])}
      </Badge>
    );
  };

  const getModeLabel = (mode: string) => {
    return mode === "study"
      ? t(($) => $.exam.sessions.mode.study)
      : t(($) => $.exam.sessions.mode.tryout);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
        {t(($) => $.exam.sessions.history.title)}
      </h3>
      {isHistoryLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : history.length > 0 ? (
        <div className="divide-y border rounded-xl overflow-hidden bg-card">
          {history.map((item) => (
            <button
              key={item.id}
              className="cursor-pointer group flex w-full items-center justify-between p-3.5 text-left transition-all hover:bg-primary/5 active:bg-primary/10"
              onClick={() => {
                const isCompleted = item.status === EnumExamSessionStatus.COMPLETED;
                if (isCompleted) {
                  navigate({
                    to: AppRoute.exam.results.url,
                    params: { id: item.id },
                    search: {
                      courseId,
                      lectureId,
                    },
                  });
                } else {
                  onSetExamSessionId(item.id);
                }
              }}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{getModeLabel(item.mode)}</span>
                  {getStatusBadge(item.status)}
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(item.startTime), "PPP p", { locale: localeId })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {item.score !== null && (
                  <div className="text-right">
                    <div className="text-sm font-bold text-primary">{item.score}</div>
                    <div className="text-xs text-muted-foreground">
                      {t(($) => $.exam.sessions.score)}
                    </div>
                  </div>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-sm text-muted-foreground border rounded-xl border-dashed">
          {t(($) => $.exam.sessions.history.empty)}
        </div>
      )}
      {totalPages > 1 && (
        <LocalePagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          className="mt-2"
        />
      )}
    </div>
  );
};
