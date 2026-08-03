import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";

interface PlayerHeaderProps {
  courseName?: string | null;
  completedLectures?: number;
  totalLectures?: number;
  progressPercentage?: number;
  onBack: () => void;
}

export function PlayerHeader({
  courseName,
  completedLectures = 0,
  totalLectures = 0,
  progressPercentage = 0,
  onBack,
}: PlayerHeaderProps) {
  const { t } = useAppTranslation();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          {t(($) => $.labels.back)}
        </Button>
        <div className="text-right">
          <h1 className="font-bold text-slate-900 dark:text-white">
            {courseName}
          </h1>
          <p className="text-xs text-muted-foreground">
            {completedLectures}/{totalLectures} {t(($) => $.course.public.player.completed)}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-2 p-4">
          <div className="flex justify-between text-sm">
            <span>{t(($) => $.course.public.player.progress)}</span>
            <span>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} />
        </CardContent>
      </Card>
    </div>
  );
}
