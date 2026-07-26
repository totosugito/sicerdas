import React from "react";
import { useCbtStore } from "@/stores/useCbtStore";
import { cn } from "@/lib/utils";
import { HelpCircle, CheckCircle2 } from "lucide-react";
import { ExamStatus, EXAM_STATUS_STYLES, ExamSessionMode, EXAM_STATUS_GROUPS, EnumExamStatus } from "@/constants/exam-var";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { EnumExamSessionMode } from "backend/src/db/schema/exam/enums";

export interface GridItem {
  questionId: string;
  order: number;
  status: ExamStatus;
}

interface CbtNavigationGridProps {
  items: GridItem[];
  mode: ExamSessionMode;
  onQuestionSelect: (questionId: string) => void;
  onToggleDoubtful: (questionId: string, isDoubtful: boolean) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export const CbtNavigationGrid: React.FC<CbtNavigationGridProps> = ({
  items,
  mode,
  onQuestionSelect,
  onToggleDoubtful,
  isMobile = false,
  onClose,
}) => {
  const { activeQuestionId } = useCbtStore();
  const { t } = useAppTranslation();

  const getButtonStyles = (status: ExamStatus, isActive: boolean) => {
    const base = cn(
      "relative transition-all duration-200 font-medium rounded-lg border flex items-center justify-center aspect-square p-0",
      "text-xs md:text-sm md:border-2"
    );
    const styles = EXAM_STATUS_STYLES[status];

    if (isActive) {
      return cn(
        base,
        styles.bg,
        status === EnumExamStatus.UNANSWERED ? "text-primary" : styles.text,
        "border-primary shadow-lg shadow-primary/15 font-bold"
      );
    }

    return cn(base, styles.bg, styles.text, styles.border);
  };

  const activeItem = items.find((item) => item.questionId === activeQuestionId);

  return (
    <Card className={cn(
      "flex flex-col w-full md:w-[320px] py-0 gap-0",
      isMobile 
        ? "h-full border-none shadow-none bg-transparent overflow-visible" 
        : "h-fit max-h-[calc(100vh-12rem)] overflow-hidden"
    )}>
      <CardHeader className="py-3 px-6 border-b flex flex-row items-center justify-between !pb-3">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex-1 text-center pl-6">
          {t($ => $.exam.sessions.cbt.navigation.title)}
        </CardTitle>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-4 overflow-hidden p-4 md:p-6">
        <div className={cn(
          "pb-1 grid overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800",
          "grid-cols-8 sm:grid-cols-10 md:grid-cols-5 gap-1.5 md:gap-3"
        )}>
          {items.map((item) => {
            const isActive = activeQuestionId === item.questionId;
            return (
              <button
                key={item.questionId}
                className={getButtonStyles(item.status, isActive)}
                onClick={() => onQuestionSelect(item.questionId)}
              >
                {item.order}
                {item.status === EnumExamStatus.DOUBTFUL && !isActive && (
                  <div className={cn(
                    "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900",
                    EXAM_STATUS_STYLES.doubtful.dot
                  )} />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-5 pt-5 border-t">
          {mode === EnumExamSessionMode.TRYOUT && activeItem && (
            <div
              className={cn(
                "flex items-center p-3 md:p-4 rounded-xl border transition-all duration-300 cursor-pointer",
                activeItem.status === "doubtful"
                  ? EXAM_STATUS_STYLES.doubtful.active
                  : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
              onClick={() => onToggleDoubtful(activeItem.questionId, activeItem.status !== "doubtful")}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={cn(
                  "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                  activeItem.status === EnumExamStatus.DOUBTFUL
                    ? cn(EXAM_STATUS_STYLES.doubtful.dot, EXAM_STATUS_STYLES.doubtful.border, "text-black")
                    : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                )}>
                  {activeItem.status === EnumExamStatus.DOUBTFUL && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{t($ => $.exam.sessions.cbt.navigation.doubtful)}</p>
                  <p className="text-xs opacity-70">{t($ => $.exam.sessions.cbt.navigation.doubtfulDesc)}</p>
                </div>
                <HelpCircle className={cn(
                  "w-4 h-4 opacity-40",
                  activeItem.status === EnumExamStatus.DOUBTFUL && "animate-pulse"
                )} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {[
              ...EXAM_STATUS_GROUPS.common,
              ...(mode === EnumExamSessionMode.TRYOUT ? EXAM_STATUS_GROUPS.tryout : []),
              ...(mode === EnumExamSessionMode.STUDY ? EXAM_STATUS_GROUPS.study : [])
            ].map((status) => (
              <div key={status} className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <div className={cn(
                  "w-2.5 h-2.5 rounded-full border-2",
                  EXAM_STATUS_STYLES[status].border,
                  status !== EnumExamStatus.UNANSWERED && EXAM_STATUS_STYLES[status].bg
                )}></div>
                <span>{t(($: any) => $.exam.sessions.cbt.navigation.status[status])}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
