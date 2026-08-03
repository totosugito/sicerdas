import React from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingView } from "@/components/general";
import { BlockNoteStatic } from "@/components/custom/blocknote";
import { EnumLectureType } from "backend/src/db/schema/course/enums.ts";
import { useAppTranslation } from "@/lib/i18n-typed";
import { string_to_locale_date } from "@/lib/my-utils";
import type { PlayerLecture } from "./PlayerSidebar";

interface PlayerContentProps {
  selected?: PlayerLecture;
  textLoading: boolean;
  textContent?: any[];
  examPending: boolean;
  completePending: boolean;
  onLaunchExam: () => void;
  onMarkComplete: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export function PlayerContent({
  selected,
  textLoading,
  textContent,
  examPending,
  completePending,
  onLaunchExam,
  onMarkComplete,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: PlayerContentProps) {
  const { t, i18n } = useAppTranslation();

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge variant="secondary">{selected?.type?.toUpperCase()}</Badge>
            <CardTitle className="mt-2">{selected?.title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {selected?.description}
            </p>
          </div>
          {selected?.isCompleted && (
            <div className="flex flex-col items-end gap-1">
              <Badge className="bg-emerald-600">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                {t(($) => $.course.public.player.completed)}
              </Badge>
              {selected.completedAt && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  {string_to_locale_date(i18n.language, selected.completedAt, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {!selected && (
          <p className="text-muted-foreground">
            {t(($) => $.course.public.player.empty)}
          </p>
        )}

        {selected?.type === EnumLectureType.TEXT && (
          textLoading ? (
            <LoadingView className="min-h-[180px]" />
          ) : textContent ? (
            <BlockNoteStatic content={textContent} className="rounded-lg" />
          ) : (
            <p className="text-muted-foreground">
              {t(($) => $.course.public.player.noContent)}
            </p>
          )
        )}

        {selected?.type === EnumLectureType.EXAM && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
            <Lock className="mx-auto mb-3 h-8 w-8 text-primary" />
            <p className="mb-4 text-sm text-muted-foreground">
              {t(($) => $.course.public.player.examHint)}
            </p>
            <Button onClick={onLaunchExam} disabled={examPending}>
              {t(($) => $.course.public.player.startExam)}
            </Button>
          </div>
        )}

        {!selected?.isCompleted && selected?.type !== EnumLectureType.EXAM && (
          <Button
            onClick={onMarkComplete}
            disabled={completePending}
            className="w-full sm:w-auto"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {t(($) => $.course.public.player.markComplete)}
          </Button>
        )}

        {selected?.type === EnumLectureType.EXAM && (
          <Button
            onClick={onMarkComplete}
            disabled={completePending}
            variant="outline"
          >
            {t(($) => $.course.public.player.markComplete)}
          </Button>
        )}

        <div className="flex justify-between border-t pt-4">
          <Button variant="outline" onClick={onPrev} disabled={!hasPrev}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t(($) => $.course.public.player.previous)}
          </Button>
          <Button variant="outline" onClick={onNext} disabled={!hasNext}>
            {t(($) => $.course.public.player.next)}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
