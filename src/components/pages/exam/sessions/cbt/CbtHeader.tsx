import React from "react";
import { useCbtStore } from "@/stores/useCbtStore";
import { Button } from "@/components/ui/button";
import { useAppTranslation } from "@/lib/i18n-typed";
import { ArrowLeft, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { DialogModal } from "@/components/custom/components/DialogModal";
import { EnumExamStatus, ExamStatus, ExamSessionMode } from "@/constants/exam-var";
import { HelpCircle, Info } from "lucide-react";
import { EnumExamSessionMode } from "backend/src/db/schema/exam/enums";

export interface SummaryItem {
  status: ExamStatus;
}

interface CbtHeaderProps {
  title: string;
  subtitle?: string;
  mode: ExamSessionMode;
  onSubmit: () => void;
  isSubmitting?: boolean;
  showSubmit?: boolean;
  onGoToResult?: () => void;
  onExit?: () => void;
  items?: SummaryItem[];
  durationSeconds?: number;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export const CbtHeader: React.FC<CbtHeaderProps> = ({
  title,
  subtitle,
  mode,
  onSubmit,
  isSubmitting,
  showSubmit = true,
  onGoToResult,
  onExit,
  items = [],
  durationSeconds,
}) => {
  const { t } = useAppTranslation();
  const { elapsedSeconds } = useCbtStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = React.useState(false);

  const unansweredCount = items.filter((i) => i.status === EnumExamStatus.UNANSWERED).length;
  const doubtfulCount = items.filter((i) => i.status === EnumExamStatus.DOUBTFUL).length;

  const handleConfirmSubmit = () => {
    setIsModalOpen(false);
    onSubmit();
  };

  const infoItems = [];
  if (unansweredCount > 0) {
    infoItems.push({
      text: t(($) => $.exam.sessions.cbt.summary.unansweredCount, { count: unansweredCount }),
      icon: <Info className="w-4 h-4 text-slate-400" />,
    });
  }
  if (doubtfulCount > 0) {
    infoItems.push({
      text: t(($) => $.exam.sessions.cbt.summary.doubtfulCount, { count: doubtfulCount }),
      icon: <HelpCircle className="w-4 h-4 text-yellow-500" />,
    });
  }

  return (
    <Card className="py-0 gap-0 overflow-hidden">
      <CardContent
        className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4"
      >
        {/* Title & Subtitle Area */}
        <div className="flex-1 min-w-0 pr-0 md:pr-4 flex items-center gap-2 md:gap-3">
          {onExit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExitModalOpen(true)}
              className="flex-shrink-0 -ml-2"
              title={t(($) => $.exam.sessions.cbt.header.exit)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="min-w-0">
            <h1 className="text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight line-clamp-1">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] md:text-xs text-muted-foreground font-medium line-clamp-1 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Timer & Actions Area */}
        <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4 flex-shrink-0">
          <div className="flex justify-center">
            <div
              className={cn(
                "group relative flex items-center gap-3 px-4 py-2 rounded-2xl border font-mono transition-all duration-500",
                mode === EnumExamSessionMode.TRYOUT &&
                  durationSeconds &&
                  durationSeconds - elapsedSeconds > 0 &&
                  durationSeconds - elapsedSeconds < 300
                  ? "bg-red-50/80 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30 shadow-[0_0_20px_rgba(220,38,38,0.08)] animate-pulse"
                  : "bg-slate-100/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 backdrop-blur-sm",
              )}
            >
              <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-700 pr-3">
                <Clock
                  className={cn(
                    "h-4 w-4 transition-colors duration-500",
                    mode === EnumExamSessionMode.TRYOUT &&
                      durationSeconds &&
                      durationSeconds - elapsedSeconds > 0 &&
                      durationSeconds - elapsedSeconds < 300
                      ? "text-red-500"
                      : "text-primary/60",
                  )}
                />
                <span className="text-[10px] font-sans font-black uppercase tracking-widest opacity-60">
                  {mode === EnumExamSessionMode.TRYOUT
                    ? t(($) => $.exam.sessions.cbt.header.timerExam)
                    : t(($) => $.exam.sessions.cbt.header.timerStudy)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-base font-bold tabular-nums tracking-tight">
                  {formatTime(elapsedSeconds)}
                </span>

                <div className="relative flex h-2 w-2">
                  <span
                    className={cn(
                      "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                      mode === EnumExamSessionMode.TRYOUT &&
                        durationSeconds &&
                        durationSeconds - elapsedSeconds > 0 &&
                        durationSeconds - elapsedSeconds < 300
                        ? "bg-red-400"
                        : "bg-emerald-400",
                    )}
                  ></span>
                  <span
                    className={cn(
                      "relative inline-flex rounded-full h-2 w-2",
                      mode === EnumExamSessionMode.TRYOUT &&
                        durationSeconds &&
                        durationSeconds - elapsedSeconds > 0 &&
                        durationSeconds - elapsedSeconds < 300
                        ? "bg-red-500"
                        : "bg-emerald-500",
                    )}
                  ></span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showSubmit ? (
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                disabled={isSubmitting}
                className="px-5 font-bold shadow-sm"
              >
                {isSubmitting
                  ? t(($) => $.exam.sessions.cbt.header.submitting)
                  : mode === EnumExamSessionMode.TRYOUT
                    ? t(($) => $.exam.sessions.cbt.header.submitExam)
                    : t(($) => $.exam.sessions.cbt.header.finishStudy)}
              </Button>
            ) : onGoToResult ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onGoToResult}
                className="border-primary text-primary hover:bg-primary/5 font-bold"
              >
                {t(($) => $.exam.sessions.cbt.header.viewResult)}
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>

      <DialogModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        modal={{
          title:
            mode === EnumExamSessionMode.TRYOUT
              ? t(($) => $.exam.sessions.cbt.header.submitExam)
              : t(($) => $.exam.sessions.cbt.header.finishStudy),
          desc: t(($) => $.exam.sessions.cbt.session.confirmSubmit),
          textConfirm: t(($) => $.labels.confirm),
          textCancel: t(($) => $.labels.cancel),
          onConfirmClick: handleConfirmSubmit,
          iconType: "question",
          showInfoSection: infoItems.length > 0,
          infoItems: infoItems,
          infoTitle: t(($) => $.exam.sessions.cbt.summary.title),
        }}
      />

      <DialogModal
        open={isExitModalOpen}
        onOpenChange={setIsExitModalOpen}
        modal={{
          title: t(($) => $.exam.sessions.cbt.session.confirmExit),
          desc: t(($) => $.exam.sessions.cbt.session.confirmExitDesc),
          textConfirm: t(($) => $.labels.confirm),
          textCancel: t(($) => $.labels.cancel),
          onConfirmClick: () => {
            setIsExitModalOpen(false);
            onExit?.();
          },
          iconType: "warning",
          showInfoSection: infoItems.length > 0,
          infoItems: infoItems,
          infoTitle: t(($) => $.exam.sessions.cbt.summary.title),
        }}
      />
    </Card>
  );
};
