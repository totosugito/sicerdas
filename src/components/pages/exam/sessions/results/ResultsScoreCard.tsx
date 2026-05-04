import React from "react";
import { CheckCircle2, XCircle, HelpCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAppTranslation } from "@/lib/i18n-typed";

interface ResultsScoreCardProps {
  score: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  elapsedSeconds: number;
  accuracy: number;
  earnedPoints?: number | null;
  maxPoints?: number | null;
}

export const ResultsScoreCard: React.FC<ResultsScoreCardProps> = ({
  score,
  correctCount,
  wrongCount,
  skippedCount,
  elapsedSeconds,
  accuracy,
  earnedPoints,
  maxPoints,
}) => {
  const { t } = useAppTranslation();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-8 bg-primary/5 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-primary/10">
            <span className="text-sm font-bold uppercase tracking-widest text-primary/60 mb-1">
              {t(($) => $.exam.sessions.results.finalScore)}
            </span>
            <div className="text-7xl font-black text-primary mb-2">{Math.round(score)}</div>
            <div className="text-sm font-medium text-muted-foreground">
              {t(($) => $.exam.sessions.results.scaleInfo)}
            </div>
            {earnedPoints !== null && earnedPoints !== undefined && maxPoints !== null && maxPoints !== undefined && (
              <div className="mt-3 text-xs font-black uppercase tracking-wider text-primary/70 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                {t(($) => $.exam.sessions.results.pointsInfo, {
                  earned: earnedPoints,
                  max: maxPoints,
                })}
              </div>
            )}
          </div>
          <div className="flex-[1.5] p-8 grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {t(($) => $.exam.sessions.results.stats.correct)}
              </div>
              <div className="text-2xl font-bold">{correctCount}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <XCircle className="w-4 h-4 text-red-500" />
                {t(($) => $.exam.sessions.results.stats.wrong)}
              </div>
              <div className="text-2xl font-bold">{wrongCount}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <HelpCircle className="w-4 h-4 text-orange-500" />
                {t(($) => $.exam.sessions.results.stats.skipped)}
              </div>
              <div className="text-2xl font-bold">{skippedCount}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <Clock className="w-4 h-4 text-blue-500" />
                {t(($) => $.exam.sessions.results.stats.time)}
              </div>
              <div className="text-2xl font-bold">{formatTime(elapsedSeconds)}</div>
            </div>
          </div>
        </div>
        <div className="px-8 py-4 bg-muted/30 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">{t(($) => $.exam.sessions.results.accuracy)}</span>
            <span className="text-sm font-bold">{Math.round(accuracy)}%</span>
          </div>
          <Progress value={accuracy} className="h-2 bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
};
