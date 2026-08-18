import React, { useEffect, useState } from "react";
import { useCbtStore } from "@/stores/useCbtStore";
import {
  useSessionDetails,
  useSessionQuestion,
  useSaveAnswer,
  useSubmitSession,
} from "@/api/exam/sessions";
import { useAuthStore } from "@/stores/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";
import { useAppTranslation } from "@/lib/i18n-typed";
import { showNotifError } from "@/lib/show-notif";
import {
  CbtHeader,
  CbtQuestionView,
} from "@/features/exam/sessions/cbt";
import { ErrorPageDetails, LoadingView } from "@/components/general";
import { EnumExamSessionMode, EnumExamSessionStatus } from "@/api/exam/types";
import { EnumExamStatus, ExamSessionMode, ExamStatus } from "@/constants/exam-var";
import { CreateContentReport } from "@/features/layout/CreateContentReport";
import { EnumContentType } from "@/api/types";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PlayerCbtViewProps {
  sessionId: string;
  packageId?: string;
  sectionId?: string;
  onFinished: () => void;
}

export const PlayerCbtView: React.FC<PlayerCbtViewProps> = ({
  sessionId,
  packageId,
  sectionId,
  onFinished,
}) => {
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();

  const {
    sessionId: storeSessionId,
    setSessionId,
    elapsedSeconds,
    setElapsedSeconds,
    incrementElapsedSeconds,
    activeQuestionId,
    setActiveQuestionId,
    setIsSaving,
    isTimerActive,
    draftOptionId,
    setDraftOptionId,
    resetAll,
  } = useCbtStore();

  const user = useAuthStore((state) => state.user);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  // APIs
  const {
    data: detailsRes,
    isLoading: isLoadingDetails,
    isError: isErrorDetails,
    error: errorDetails,
    refetch: refetchDetails,
  } = useSessionDetails(sessionId);
  const details = detailsRes?.data;

  const { data: questionRes, isLoading: isLoadingQuestion } = useSessionQuestion(
    sessionId,
    activeQuestionId,
  );
  const questionData = questionRes?.data;

  const saveAnswerMutation = useSaveAnswer();
  const submitSessionMutation = useSubmitSession();

  // Initialization & Reset
  useEffect(() => {
    return () => resetAll();
  }, [resetAll]);

  useEffect(() => {
    if (details) {
      // If we are entering a DIFFERENT session, initialize from API
      if (storeSessionId !== sessionId) {
        setSessionId(sessionId);
        setElapsedSeconds(details.session.elapsedSeconds);

        const firstUnanswered = details.grid.find((q) => !q.isAnswered);
        setActiveQuestionId(firstUnanswered?.questionId || details.grid[0].questionId);
      }
      // If it's the SAME session (refresh), just ensure question is set
      else if (!activeQuestionId) {
        const firstUnanswered = details.grid.find((q) => !q.isAnswered);
        setActiveQuestionId(firstUnanswered?.questionId || details.grid[0].questionId);
      }
    }
  }, [details, sessionId, storeSessionId, setElapsedSeconds, setSessionId, setActiveQuestionId, activeQuestionId]);

  // Timer Tick
  useEffect(() => {
    if (!isTimerActive || !details || details.session.status === EnumExamSessionStatus.COMPLETED) return;

    const interval = setInterval(() => {
      incrementElapsedSeconds();
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive, details, incrementElapsedSeconds]);

  // Sync draft with external selection (e.g. on question change)
  useEffect(() => {
    if (questionData) {
      setDraftOptionId(questionData.selectedOptionId);
    }
  }, [questionData?.selectedOptionId, setDraftOptionId, questionData]);

  const handleOptionSelect = (optionId: string) => {
    if (!activeQuestionId) return;

    setIsSaving(true);
    saveAnswerMutation.mutate(
      {
        sessionId,
        questionId: activeQuestionId,
        selectedOptionId: optionId,
        elapsedSeconds,
      },
      {
        onSettled: () => setIsSaving(false),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["exam-session", sessionId] });
          queryClient.invalidateQueries({
            queryKey: ["exam-session-question", sessionId, activeQuestionId],
          });
        },
      },
    );
  };

  const handleToggleDoubtful = (questionId: string, isDoubtful: boolean) => {
    setIsSaving(true);
    saveAnswerMutation.mutate(
      {
        sessionId,
        questionId,
        isDoubtful,
        elapsedSeconds,
      },
      {
        onSettled: () => setIsSaving(false),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["exam-session", sessionId] });
        },
      },
    );
  };

  const handleSubmit = () => {
    if (activeQuestionId) {
      saveAnswerMutation.mutate({
        sessionId,
        questionId: activeQuestionId,
        elapsedSeconds,
      });
    }

    submitSessionMutation.mutate(sessionId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["exam-session", sessionId] });
        if (packageId && sectionId) {
          queryClient.invalidateQueries({
            queryKey: ["exam-session-history", packageId, sectionId],
          });
        }
        onFinished();
      },
      onError: (err: any) => {
        showNotifError({
          message: err.message || t(($) => $.exam.sessions.cbt.session.submitError),
        });
      },
    });
  };

  if (isErrorDetails || (detailsRes && !detailsRes.success)) {
    return (
      <ErrorPageDetails
        icon={AlertCircle}
        title={t(($) => $.exam.sessions.cbt.session.loadError)}
        description={
          detailsRes?.message ||
          (errorDetails as any)?.message ||
          t(($) => $.exam.sessions.cbt.session.loadErrorDesc)
        }
        onRetry={() => refetchDetails()}
        onBack={onFinished}
        retryLabel={t(($) => $.labels.retry)}
        backLabel={t(($) => $.labels.back)}
      />
    );
  }

  if (isLoadingDetails || !details) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center p-6">
        <LoadingView
          title={t(($) => $.exam.sessions.cbt.session.loadingEngine)}
          message={t(($) => $.exam.sessions.cbt.session.loadingEngineDesc)}
          className="max-w-md border-none shadow-none bg-transparent backdrop-blur-none"
        />
      </div>
    );
  }

  const currentIndex = details.grid.findIndex((q) => q.questionId === activeQuestionId);
  const isFirst = currentIndex <= 0;
  const isLast = currentIndex >= details.grid.length - 1;

  const handlePrevious = () => {
    if (isFirst) return;

    if (
      details.session.mode === EnumExamSessionMode.TRYOUT &&
      draftOptionId &&
      draftOptionId !== questionData?.selectedOptionId
    ) {
      handleOptionSelect(draftOptionId);
    }

    setActiveQuestionId(details.grid[currentIndex - 1].questionId);
  };

  const handleNext = () => {
    if (isLast) return;

    if (
      details.session.mode === EnumExamSessionMode.TRYOUT &&
      draftOptionId &&
      draftOptionId !== questionData?.selectedOptionId
    ) {
      handleOptionSelect(draftOptionId);
    }

    setActiveQuestionId(details.grid[currentIndex + 1].questionId);
  };

  const gridItems = details.grid.map((item) => {
    let status: ExamStatus = EnumExamStatus.UNANSWERED;
    if (item.isCorrect === true) status = EnumExamStatus.CORRECT;
    else if (item.isCorrect === false) status = EnumExamStatus.WRONG;
    else if (item.isDoubtful) status = EnumExamStatus.DOUBTFUL;
    else if (item.isAnswered) status = EnumExamStatus.ANSWERED;

    return {
      questionId: item.questionId,
      order: item.order,
      status,
    };
  });

  const activeGridItem = details.grid.find((q) => q.questionId === activeQuestionId);
  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="w-full">
        <CbtHeader
          title={details.package?.title || t(($) => $.exam.sessions.cbt.session.defaultTitle)}
          subtitle={details.section?.title}
          mode={details.session.mode as ExamSessionMode}
          onSubmit={handleSubmit}
          items={gridItems}
          durationSeconds={
            (details.section as any)?.durationMinutes
              ? (details.section as any).durationMinutes * 60
              : undefined
          }
          isSubmitting={submitSessionMutation.isPending}
          showSubmit={details.session.status === EnumExamSessionStatus.IN_PROGRESS}
          onGoToResult={onFinished}
          onExit={() => {
            if (activeQuestionId) {
              saveAnswerMutation.mutate(
                {
                  sessionId,
                  questionId: activeQuestionId,
                  elapsedSeconds,
                },
                {
                  onSettled: onFinished,
                },
              );
            } else {
              onFinished();
            }
          }}
        />
      </div>

      <div className="flex flex-col relative gap-6 w-full">
        <div className="flex-1 min-w-0">
          {isLoadingQuestion || !questionData ? (
            <LoadingView
              title={t(($) => $.exam.sessions.cbt.session.loadingQuestion)}
              message={t(($) => $.exam.sessions.cbt.session.loadingQuestionDesc)}
              className="min-h-[300px] lg:min-h-[400px]"
            />
          ) : (
            <div className="space-y-4">
              <CbtQuestionView
                key={questionData.question.id}
                question={questionData.question}
                passage={questionData.passage}
                options={questionData.options}
                evaluation={questionData.evaluation}
                selectedOptionId={questionData.selectedOptionId}
                mode={details.session.mode as ExamSessionMode}
                questionOrder={(currentIndex >= 0 ? currentIndex : 0) + 1}
                totalQuestions={details.grid.length}
                onOptionSelect={handleOptionSelect}
                onReport={() => setIsReportDialogOpen(true)}
                allowDirectOptionSelect={true}
              />
              <div className="flex justify-end border-t pt-4 bg-transparent items-center">
                {isLast ? (
                  <Button
                    variant="default"
                    onClick={() => {
                      if (
                        details.session.mode === EnumExamSessionMode.TRYOUT &&
                        draftOptionId &&
                        draftOptionId !== questionData?.selectedOptionId
                      ) {
                        saveAnswerMutation.mutate(
                          {
                            sessionId,
                            questionId: activeQuestionId!,
                            selectedOptionId: draftOptionId,
                            elapsedSeconds,
                          },
                          {
                            onSuccess: () => {
                              handleSubmit();
                            },
                          }
                        );
                      } else {
                        handleSubmit();
                      }
                    }}
                    disabled={submitSessionMutation.isPending}
                    className="font-bold px-6 shadow-sm"
                  >
                    {submitSessionMutation.isPending
                      ? t(($) => $.exam.sessions.cbt.header.submitting)
                      : details.session.mode === EnumExamSessionMode.TRYOUT
                        ? t(($) => $.exam.sessions.cbt.header.submitExam)
                        : t(($) => $.exam.sessions.cbt.header.finishStudy)}
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleNext}>
                    {t(($) => $.exam.sessions.cbt.answer.next)}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateContentReport
        isOpen={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        data={{
          contentType: EnumContentType.EXAM,
          referenceId: activeQuestionId || details.session.packageId,
          title: t(($) => $.exam.sessions.cbt.session.reportTitle, {
            order: activeGridItem?.order || 1,
          }),
          name: user?.user?.name || "",
          email: user?.user?.email || "",
        }}
      />
    </div>
  );
};
