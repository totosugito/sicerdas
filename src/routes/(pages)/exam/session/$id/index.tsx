import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCbtStore } from "@/stores/useCbtStore";
import {
  useSessionDetails,
  useSessionQuestion,
  useSaveAnswer,
  useSubmitSession,
} from "@/api/exam-sessions";
import { useAuthStore } from "@/stores/useAuthStore";
import { CreateContentReport } from "@/components/pages/layout/CreateContentReport";
import { EnumContentType } from "backend/src/db/schema/enum/enum-app";
import {
  CbtHeader,
  CbtNavigationGrid,
  GridItemStatus,
  CbtQuestionView,
  CbtAnswerPad,
  CbtSummary,
} from "@/components/pages/exam/sessions/cbt";
import { LoadingView } from "@/components/app/LoadingView";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppRoute } from "@/constants/app-route";
import { showNotifError } from "@/lib/show-notif";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { ErrorPageDetails } from "@/components/app/ErrorPageDetails";
import { EnumExamSessionMode, EnumExamSessionStatus } from "backend/src/db/schema/exam/enums";
import { EnumExamStatus, ExamSessionMode } from "@/constants/exam-var";
import { useAppTranslation } from "@/lib/i18n-typed";

type ExamSessionSearch = {
  q?: string;
};

export const Route = createFileRoute("/(pages)/exam/session/$id/")({
  validateSearch: (search: Record<string, unknown>): ExamSessionSearch => {
    return {
      q: search.q as string | undefined,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useAppTranslation();
  const { id: sessionId } = Route.useParams();
  const { q } = Route.useSearch();
  const navigate = useNavigate();
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
    resetAll,
  } = useCbtStore();

  const user = useAuthStore((state) => state.user);
  const [isMobileGridOpen, setIsMobileGridOpen] = useState(false);
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

        const isValidQ = q && details.grid.some((item) => item.questionId === q);
        if (isValidQ) {
          setActiveQuestionId(q);
        } else {
          const firstUnanswered = details.grid.find((q) => !q.isAnswered);
          setActiveQuestionId(firstUnanswered?.questionId || details.grid[0].questionId);
        }
      }
      // If it's the SAME session (refresh), just ensure question is set
      else if (!activeQuestionId) {
        const isValidQ = q && details.grid.some((item) => item.questionId === q);
        if (isValidQ) {
          setActiveQuestionId(q);
        } else {
          const firstUnanswered = details.grid.find((q) => !q.isAnswered);
          setActiveQuestionId(firstUnanswered?.questionId || details.grid[0].questionId);
        }
      }
    }
  }, [details, sessionId, storeSessionId, setElapsedSeconds, setSessionId, setActiveQuestionId, q, activeQuestionId]);

  // Sync activeQuestionId to URL
  useEffect(() => {
    if (activeQuestionId && activeQuestionId !== q) {
      navigate({
        to: ".",
        search: (prev: ExamSessionSearch) => ({ ...prev, q: activeQuestionId }),
        replace: true,
      });
    }
  }, [activeQuestionId, q, navigate]);

  // Timer Tick
  useEffect(() => {
    if (!isTimerActive || !details || details.session.status === EnumExamSessionStatus.COMPLETED) return;

    const interval = setInterval(() => {
      incrementElapsedSeconds();
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive, details, incrementElapsedSeconds]);

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
          // Invalidate details to update grid status and question to update selectedOptionId
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
    if (confirm(t(($) => $.exam.sessions.cbt.session.confirmSubmit))) {
      submitSessionMutation.mutate(sessionId, {
        onSuccess: () => {
          // Re-fetch details to switch to completed mode
          queryClient.invalidateQueries({ queryKey: ["exam-session", sessionId] });
          // Navigate to results page
          navigate({
            to: AppRoute.exam.results.url,
            params: { id: sessionId },
          });
        },
        onError: (err: any) => {
          showNotifError({
            message: err.message || t(($) => $.exam.sessions.cbt.session.submitError),
          });
        },
      });
    }
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
        onBack={() =>
          navigate({
            to: AppRoute.exam.exams.url,
          })
        }
        retryLabel={t(($) => $.labels.retry)}
        backLabel={t(($) => $.exam.packages.detail.backToList)}
      />
    );
  }

  if (isLoadingDetails || !details) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50/50 dark:bg-slate-950/50 p-6">
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

    // Auto-save draft if any (only in tryout mode as study mode is one-shot)
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

    // Auto-save draft if any (only in tryout mode as study mode is one-shot)
    if (
      details.session.mode === EnumExamSessionMode.TRYOUT &&
      draftOptionId &&
      draftOptionId !== questionData?.selectedOptionId
    ) {
      handleOptionSelect(draftOptionId);
    }

    setActiveQuestionId(details.grid[currentIndex + 1].questionId);
  };

  // Convert Grid items for UI
  const gridItems = details.grid.map((item) => {
    let status: GridItemStatus = EnumExamStatus.UNANSWERED;
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
  const hasAnswered = activeGridItem?.isAnswered || activeGridItem?.isDoubtful || false;

  return (
    <div className="page-container">
      <div className="w-full">
        <CbtHeader
          title={details.package?.title || t(($) => $.exam.sessions.cbt.session.defaultTitle)}
          subtitle={details.section?.title}
          mode={details.session.mode as ExamSessionMode}
          onSubmit={handleSubmit}
          isSubmitting={submitSessionMutation.isPending}
          showSubmit={details.session.status === EnumExamSessionStatus.IN_PROGRESS}
          onGoToResult={() =>
            navigate({
              to: AppRoute.exam.results.url,
              params: { id: sessionId },
            })
          }
          onExit={() =>
            navigate({
              to: AppRoute.exam.packages.detail.url,
              params: { id: details.session.packageId },
            })
          }
        />
      </div>

      <div className="flex flex-1 relative gap-6 w-full">
        {/* Main Content Area */}
        <div className="flex-1">
          {isLoadingQuestion || !questionData ? (
            <LoadingView
              title={t(($) => $.exam.sessions.cbt.session.loadingQuestion)}
              message={t(($) => $.exam.sessions.cbt.session.loadingQuestionDesc)}
              className="min-h-[400px] lg:min-h-[600px]"
            />
          ) : (
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
            />
          )}
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:flex flex-col gap-6 w-[320px] flex-shrink-0">
          <CbtNavigationGrid
            items={gridItems}
            mode={details.session.mode as ExamSessionMode}
            onQuestionSelect={setActiveQuestionId}
            onToggleDoubtful={handleToggleDoubtful}
          />

          {questionData && (
            <div className="flex flex-col gap-4">
              <CbtAnswerPad
                options={questionData.options}
                selectedOptionId={questionData.selectedOptionId}
                evaluation={questionData.evaluation}
                mode={details.session.mode as ExamSessionMode}
                hasAnswered={hasAnswered}
                onOptionSelect={handleOptionSelect}
                onPrevious={handlePrevious}
                onNext={handleNext}
                isFirst={isFirst}
                isLast={isLast}
                layout="vertical"
              />
              <CbtSummary items={gridItems} mode={details.session.mode as ExamSessionMode} />
            </div>
          )}
        </div>

        {/* Mobile Navigation Drawer */}
        <Drawer open={isMobileGridOpen} onOpenChange={setIsMobileGridOpen}>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader className="sr-only">
              <DrawerTitle>{t(($) => $.exam.sessions.cbt.navigation.title)}</DrawerTitle>
              <DrawerDescription>{t(($) => $.exam.sessions.cbt.session.mobileNavDesc)}</DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto p-4">
              <CbtNavigationGrid
                items={gridItems}
                mode={details.session.mode as ExamSessionMode}
                onQuestionSelect={(id) => {
                  setActiveQuestionId(id);
                  setIsMobileGridOpen(false);
                }}
                onToggleDoubtful={handleToggleDoubtful}
                isMobile={true}
              />
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Mobile Answer Pad */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 w-full z-40 pointer-events-none pb-4 px-4">
        {questionData && (
          <div className="pointer-events-auto w-full">
            <CbtAnswerPad
              options={questionData.options}
              selectedOptionId={questionData.selectedOptionId}
              evaluation={questionData.evaluation}
              mode={details.session.mode as ExamSessionMode}
              hasAnswered={hasAnswered}
              onOptionSelect={handleOptionSelect}
              onPrevious={handlePrevious}
              onNext={handleNext}
              isFirst={isFirst}
              isLast={isLast}
              layout="horizontal"
            />
          </div>
        )}
      </div>

      {/* Mobile Grid Toggle - Adjusted position so it doesn't overlap the floating Answer Pad */}
      <div className="md:hidden fixed top-20 right-4 z-40">
        <Button
          className="rounded-full shadow-lg border border-slate-200 dark:border-slate-800 w-12 h-12 p-0 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          onClick={() => setIsMobileGridOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </Button>
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
}

