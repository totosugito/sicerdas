import React, { useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Lock, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingView } from "@/components/general";
import { BlockNoteStatic } from "@/components/custom/blocknote";
import { DialogModal } from "@/components/dialog/DialogModal";
import { EnumLectureType } from "@/api/course/types";
import { useAppTranslation } from "@/lib/i18n-typed";
import { string_to_locale_date } from "@/lib/my-utils";
import type { LectureProgressItem } from "@/api/course/user-progress";
import { useSessionHistory } from "@/api/exam/sessions";
import { PlayerCbtView } from "./PlayerCbtView";
import { PlayerExamHistory } from "./PlayerExamHistory";
import { EnumExamSessionStatus } from "@/api/exam/types";
 
interface PlayerContentProps {
  selected?: LectureProgressItem;
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
  examSessionId?: string;
  onSetExamSessionId: (sessionId?: string) => void;
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
  examSessionId,
  onSetExamSessionId,
}: PlayerContentProps) {
  const { t, i18n } = useAppTranslation();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Fetch history if selected is an exam
  const isExam = selected?.type === EnumLectureType.EXAM;
  const { data: historyRes } = useSessionHistory(
    isExam ? (selected?.packageId ?? undefined) : undefined,
    isExam ? (selected?.referenceUrl ?? undefined) : undefined,
    { page: 1, limit: 10 }
  );

  const history = historyRes?.data?.items || [];
  const activeSession = history.find((h) => h.status === EnumExamSessionStatus.IN_PROGRESS);

  // If there's an active inline exam session, render CBT player directly instead of standard lecture card
  if (examSessionId) {
    return (
      <PlayerCbtView
        sessionId={examSessionId}
        packageId={selected?.packageId ?? undefined}
        sectionId={selected?.referenceUrl ?? undefined}
        onFinished={() => onSetExamSessionId(undefined)}
      />
    );
  }

  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
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
          <div className="space-y-6">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
              <Lock className="mx-auto mb-3 h-8 w-8 text-primary" />
              <p className="mb-4 text-sm text-muted-foreground">
                {activeSession
                  ? t(($) => $.exam.sessions.active.continueDesc)
                  : t(($) => $.course.public.player.examHint)}
              </p>
              {activeSession ? (
                <Button
                  size={"sm"}
                  onClick={() => onSetExamSessionId(activeSession.id)}
                  disabled={examPending}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {t(($) => $.exam.sessions.active.continue)}
                </Button>
              ) : (
                <Button onClick={onLaunchExam} disabled={examPending} className="font-bold" size={"sm"}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t(($) => $.course.public.player.startExam)}
                </Button>
              )}
            </div>

            <PlayerExamHistory
              packageId={selected?.packageId ?? undefined}
              sectionId={selected?.referenceUrl ?? undefined}
              onSetExamSessionId={onSetExamSessionId}
            />
          </div>
        )}

        {!selected?.isCompleted && selected?.type !== EnumLectureType.EXAM && (
          <>
            <Button
              onClick={() => setIsConfirmOpen(true)}
              disabled={completePending}
              className="w-full sm:w-auto"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {t(($) => $.course.public.player.markComplete)}
            </Button>

            <DialogModal
              open={isConfirmOpen}
              onOpenChange={setIsConfirmOpen}
              variantSubmit="default"
              modal={{
                title: t(($) => $.course.public.player.markComplete),
                desc: t(($) => $.course.public.player.confirmCompleteDesc),
                textConfirm: t(($) => $.course.public.player.markComplete),
                textCancel: t(($) => $.course.lectures.picker.btnCancel),
                iconType: "question",
                showCloseButton: true,
                onConfirmClick: () => {
                  setIsConfirmOpen(false);
                  onMarkComplete();
                },
                onCancelClick: () => setIsConfirmOpen(false),
              }}
            />
          </>
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
