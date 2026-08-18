import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, Menu } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";

interface PlayerHeaderProps {
  courseName?: string | null;
  completedLectures?: number;
  totalLectures?: number;
  progressPercentage?: number;
  onBack: () => void;
  onOpenSyllabus?: () => void;
}

export function PlayerHeader({
  courseName,
  completedLectures = 0,
  totalLectures = 0,
  progressPercentage = 0,
  onBack,
  onOpenSyllabus,
}: PlayerHeaderProps) {
  const { t } = useAppTranslation();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <Button variant="ghost" onClick={onBack} className="-ml-2">
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t(($) => $.labels.back)}
          </Button>
          {onOpenSyllabus && (
            <Button variant="outline" size="sm" onClick={onOpenSyllabus} className="lg:hidden">
              <Menu className="mr-1 h-4 w-4" />
              {t(($) => $.course.public.detail.syllabus)}
            </Button>
          )}
        </div>
        <div className="text-left sm:text-right">
          <h1 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
            {courseName}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
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
