import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Info, HelpCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ExamStatus, EXAM_STATUS_STYLES, ExamSessionMode, EXAM_STATUS_GROUPS, EnumExamStatus } from "@/constants/exam-var";

export interface SummaryItem {
  status: ExamStatus;
}

interface CbtSummaryProps {
  items: SummaryItem[];
  mode: ExamSessionMode;
  className?: string;
}

import { useAppTranslation } from "@/lib/i18n-typed";
import { EnumExamSessionMode } from "backend/src/db/schema/exam/enums";

export const CbtSummary: React.FC<CbtSummaryProps> = ({ items, mode, className }) => {
  const { t } = useAppTranslation();
  const getCount = (status: ExamStatus | ExamStatus[]) => {
    if (Array.isArray(status)) {
      return items.filter((item) => status.includes(item.status)).length;
    }
    return items.filter((item) => item.status === status).length;
  };

  return (
    <Card className={cn("overflow-hidden py-0 gap-0", className)}>
      <CardHeader className="py-3 px-6 border-b flex flex-row items-center !pb-3">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
          {t($ => $.exam.sessions.cbt.summary.title)}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {[
          ...EXAM_STATUS_GROUPS.common,
          ...(mode === EnumExamSessionMode.TRYOUT ? EXAM_STATUS_GROUPS.tryout : []),
          ...(mode === EnumExamSessionMode.STUDY ? EXAM_STATUS_GROUPS.study : [])
        ].filter(status => {
          // In STUDY mode, we don't show "Answered" separately
          if (mode === EnumExamSessionMode.STUDY && status === EnumExamStatus.ANSWERED) return false;
          return true;
        }).map((status) => {
          // Special handling for labels and icons
          const labelKey = status === EnumExamStatus.UNANSWERED && mode === EnumExamSessionMode.STUDY
            ? EnumExamStatus.UNANSWERED
            : status;

          const getIcon = (s: ExamStatus) => {
            switch (s) {
              case EnumExamStatus.CORRECT: return <CheckCircle2 className={cn("w-4 h-4", EXAM_STATUS_STYLES.correct.icon)} />;
              case EnumExamStatus.WRONG: return <XCircle className={cn("w-4 h-4", EXAM_STATUS_STYLES.wrong.icon)} />;
              case EnumExamStatus.DOUBTFUL: return <HelpCircle className={cn("w-4 h-4", EXAM_STATUS_STYLES.doubtful.icon)} />;
              case EnumExamStatus.ANSWERED: return <CheckCircle2 className={cn("w-4 h-4", EXAM_STATUS_STYLES.answered.icon)} />;
              default: return <Info className={cn("w-4 h-4", EXAM_STATUS_STYLES.unanswered.icon)} />;
            }
          };

          // Original code had some logic for counting unanswered+answered in study mode
          const count = status === EnumExamStatus.UNANSWERED && mode === EnumExamSessionMode.STUDY
            ? getCount([EnumExamStatus.UNANSWERED, EnumExamStatus.ANSWERED])
            : getCount(status as any);

          return (
            <SummaryRow
              key={status}
              label={t(($: any) => $.exam.sessions.cbt.summary[status])}
              count={count}
              icon={getIcon(status)}
              activeClass={cn(EXAM_STATUS_STYLES[status].border, EXAM_STATUS_STYLES[status].bg)}
              textColorClass={EXAM_STATUS_STYLES[status].text}
            />
          );
        })}
      </CardContent>
    </Card>
  );
};

const SummaryRow: React.FC<{ label: string; count: number; icon: React.ReactNode; activeClass?: string; textColorClass?: string }> = ({
  label,
  count,
  icon,
  activeClass,
  textColorClass
}) => (
  <div className={cn("flex items-center justify-between p-2 px-4 rounded-xl border border-transparent transition-all duration-200", activeClass, 'border-0')}>
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center">
        {icon}
      </div>
      <span className="text-xs font-medium tracking-tight text-slate-600 dark:text-slate-400">{label}</span>
    </div>
    <span className={cn("text-sm font-bold", textColorClass)}>{count}</span>
  </div>
);
