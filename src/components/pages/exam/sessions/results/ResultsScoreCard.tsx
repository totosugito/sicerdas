import React from "react";
import { CheckCircle2, XCircle, SkipForward, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppTranslation } from "@/lib/i18n-typed";
import { cn } from "@/lib/utils";

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

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const stats = [
    {
      label: t(($) => $.exam.sessions.results.stats.correct),
      value: correctCount,
      Icon: CheckCircle2,
      tone: "text-success",
      bg: "bg-success-soft"
    },
    {
      label: t(($) => $.exam.sessions.results.stats.wrong),
      value: wrongCount,
      Icon: XCircle,
      tone: "text-destructive",
      bg: "bg-destructive-soft"
    },
    {
      label: t(($) => $.exam.sessions.results.stats.skipped),
      value: skippedCount,
      Icon: SkipForward,
      tone: "text-warning",
      bg: "bg-warning-soft"
    },
    {
      label: t(($) => $.exam.sessions.results.stats.time),
      value: formatTime(elapsedSeconds),
      Icon: Clock,
      tone: "text-primary",
      bg: "bg-primary-soft"
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3 animate-fade-in">
      {/* Score Card Section */}
      <Card className="relative overflow-hidden border-0 bg-gradient-card p-6 shadow-soft md:col-span-1 flex flex-col items-center justify-center min-h-[300px]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-soft/60 via-transparent to-transparent pointer-events-none" aria-hidden />

        <div className="relative flex flex-col items-center text-center w-full">
          <p className="text-xs font-bold uppercase tracking-widest text-primary/80">
            {t(($) => $.exam.sessions.results.finalScore)}
          </p>

          <div className="relative my-6 flex h-44 w-44 items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r={radius} stroke="var(--primary-soft)" strokeWidth="12" fill="none" />
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="url(#resultsScoreGradient)"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="resultsScoreGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--primary-glow)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex flex-col items-center animate-count-up">
              <span className="text-5xl font-black tracking-tight text-primary">{Math.round(score)}</span>
              <span className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">
                {t(($) => $.exam.sessions.results.scaleInfo)}
              </span>
            </div>
          </div>

          {earnedPoints !== null && earnedPoints !== undefined && maxPoints !== null && maxPoints !== undefined && (
            <Badge className="bg-primary/15 text-primary border-0 hover:bg-primary/20 px-4 py-1.5 font-black text-[10px] tracking-widest uppercase">
              {t(($) => $.exam.sessions.results.pointsInfo, {
                earned: earnedPoints,
                max: maxPoints,
              })}
            </Badge>
          )}
        </div>
      </Card>

      {/* Stats Grid Section */}
      <Card className="border-0 bg-card p-8 shadow-soft md:col-span-2 flex flex-col justify-between">
        <div className="grid grid-cols-2 gap-8">
          {stats.map(({ label, value, Icon, tone, bg }) => (
            <div key={label} className="flex items-start gap-4">
              <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", bg)}>
                <Icon className={cn("h-6 w-6", tone)} strokeWidth={2.25} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-foreground uppercase tracking-tight">
              {t(($) => $.exam.sessions.results.accuracy)}
            </p>
            <p className="text-sm font-black text-primary">{Math.round(accuracy)}%</p>
          </div>
          <Progress value={accuracy} className="h-2.5 bg-muted" />
        </div>
      </Card>
    </div>
  );
};
