import React from "react";
import { useCbtStore } from "@/stores/useCbtStore";
import { Button } from "@/components/ui/button";
import { useAppTranslation } from "@/lib/i18n-typed";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CbtHeaderProps {
  title: string;
  subtitle?: string;
  mode: "study" | "tryout";
  onSubmit: () => void;
  isSubmitting?: boolean;
  showSubmit?: boolean;
  onGoToResult?: () => void;
  onExit?: () => void;
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
}) => {
  const { t } = useAppTranslation();
  const { elapsedSeconds, isTimerActive } = useCbtStore();

  return (
    <Card className="py-0 gap-0 overflow-hidden">
      <CardContent
        className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4"
      >
        {/* Title & Subtitle Area */}
        <div className="flex-1 min-w-0 pr-0 md:pr-4 flex items-center gap-3">
          {onExit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onExit}
              className="flex-shrink-0 -ml-2 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              title={t(($) => $.exam.sessions.cbt.header.exit)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="min-w-0">
            <h1 className="font-semibold text-slate-800 dark:text-slate-200 leading-snug line-clamp-2 md:line-clamp-1">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2 md:line-clamp-1 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Timer & Actions Area */}
        <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4 flex-shrink-0">
          <div className="flex justify-center">
            {mode === "tryout" || isTimerActive ? (
              <div
                className={`px-4 py-1.5 rounded-full font-mono text-sm font-medium border ${
                  mode === "tryout" && elapsedSeconds < 300
                    ? "bg-destructive/10 text-destructive border-destructive/20 animate-pulse"
                    : "bg-muted border-border"
                }`}
              >
                {formatTime(elapsedSeconds)}
              </div>
            ) : (
              <div className="px-4 py-1.5 rounded-full font-mono text-sm font-medium bg-muted border border-border">
                {formatTime(elapsedSeconds)} ({t(($) => $.exam.sessions.cbt.header.timerStudy)})
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {showSubmit ? (
              <Button variant="default" size="sm" onClick={onSubmit} disabled={isSubmitting}>
                {isSubmitting
                  ? t(($) => $.exam.sessions.cbt.header.submitting)
                  : mode === "tryout"
                    ? t(($) => $.exam.sessions.cbt.header.submitExam)
                    : t(($) => $.exam.sessions.cbt.header.finishStudy)}
              </Button>
            ) : onGoToResult ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onGoToResult}
                className="border-primary text-primary hover:bg-primary/5"
              >
                {t(($) => $.exam.sessions.cbt.header.viewResult)}
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
