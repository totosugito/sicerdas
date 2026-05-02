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
import { useQueryClient } from "@tanstack/react-query";
import { Menu } from "lucide-react";
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
  const { id: sessionId } = Route.useParams();
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
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
  const { data: detailsRes, isLoading: isLoadingDetails } = useSessionDetails(sessionId);
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
    resetAll();
    return () => resetAll();
  }, [sessionId, resetAll]);

  useEffect(() => {
    if (details && !activeQuestionId) {
      setElapsedSeconds(details.session.elapsedSeconds);

      // If q exists in URL and is valid, use it as initial active question
      const isValidQ = q && details.grid.some((item) => item.questionId === q);

      if (isValidQ) {
        setActiveQuestionId(q);
      } else {
        // set active question to first unanswered, or just first question
        const firstUnanswered = details.grid.find((q) => !q.isAnswered);
        setActiveQuestionId(firstUnanswered?.questionId || details.grid[0].questionId);
      }
    }
  }, [details, activeQuestionId, setElapsedSeconds, setActiveQuestionId, q]);

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
    if (!isTimerActive || !details || details.session.status === "completed") return;

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
    if (confirm("Apakah Anda yakin ingin menyelesaikan ujian ini?")) {
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
            message: err.message || "Gagal menyelesaikan ujian. Silakan coba lagi.",
          });
        },
      });
    }
  };

  if (isLoadingDetails || !details) {
    return (
      <div className="flex h-screen items-center justify-center font-semibold text-lg text-muted-foreground animate-pulse">
        Memuat Engine Ujian...
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
      details.session.mode === "tryout" &&
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
      details.session.mode === "tryout" &&
      draftOptionId &&
      draftOptionId !== questionData?.selectedOptionId
    ) {
      handleOptionSelect(draftOptionId);
    }

    setActiveQuestionId(details.grid[currentIndex + 1].questionId);
  };

  // Convert Grid items for UI
  const gridItems = details.grid.map((item) => {
    let status: GridItemStatus = "unanswered";
    if (item.isCorrect === true) status = "correct";
    else if (item.isCorrect === false) status = "wrong";
    else if (item.isDoubtful) status = "doubtful";
    else if (item.isAnswered) status = "answered";

    return {
      questionId: item.questionId,
      order: item.order,
      status,
    };
  });

  const activeGridItem = details.grid.find((q) => q.questionId === activeQuestionId);
  const hasAnswered = activeGridItem?.isAnswered || activeGridItem?.isDoubtful || false;

  return (
    <div className="flex flex-col h-[calc(100dvh-50px)] bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans relative">
      <div className="pt-4 px-4 md:px-6 w-full max-w-7xl mx-auto flex-shrink-0">
        <CbtHeader
          title={details.package?.title || "Sesi Ujian"}
          subtitle={details.section?.title}
          mode={details.session.mode as "study" | "tryout"}
          onSubmit={handleSubmit}
          isSubmitting={submitSessionMutation.isPending}
          showSubmit={details.session.status === "in_progress"}
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
          onReport={() => setIsReportDialogOpen(true)}
        />
      </div>

      <div className="flex flex-1 overflow-hidden relative p-4 md:p-6 gap-6 max-w-7xl mx-auto w-full">
        {/* Main Content Area */}
        <div className="flex-1">
          {isLoadingQuestion || !questionData ? (
            <div className="flex h-full items-center justify-center animate-pulse text-muted-foreground bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              Memuat soal...
            </div>
          ) : (
            <CbtQuestionView
              key={questionData.question.id}
              question={questionData.question}
              passage={questionData.passage}
              options={questionData.options}
              evaluation={questionData.evaluation}
              selectedOptionId={questionData.selectedOptionId}
              mode={details.session.mode as "study" | "tryout"}
              questionOrder={(currentIndex >= 0 ? currentIndex : 0) + 1}
              totalQuestions={details.grid.length}
              onOptionSelect={handleOptionSelect}
            />
          )}
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:flex flex-col gap-6 w-[320px] flex-shrink-0">
          <CbtNavigationGrid
            items={gridItems}
            mode={details.session.mode as "study" | "tryout"}
            onQuestionSelect={setActiveQuestionId}
            onToggleDoubtful={handleToggleDoubtful}
          />

          {questionData && (
            <div className="flex flex-col gap-4">
              <CbtAnswerPad
                options={questionData.options}
                selectedOptionId={questionData.selectedOptionId}
                evaluation={questionData.evaluation}
                mode={details.session.mode as "study" | "tryout"}
                hasAnswered={hasAnswered}
                onOptionSelect={handleOptionSelect}
                onPrevious={handlePrevious}
                onNext={handleNext}
                isFirst={isFirst}
                isLast={isLast}
                layout="vertical"
              />
              <CbtSummary items={gridItems} mode={details.session.mode as "study" | "tryout"} />
            </div>
          )}
        </div>

        {/* Mobile Navigation Drawer */}
        <Drawer open={isMobileGridOpen} onOpenChange={setIsMobileGridOpen}>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader className="sr-only">
              <DrawerTitle>Navigasi Soal</DrawerTitle>
              <DrawerDescription>Pilih soal untuk melihatnya</DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto p-4">
              <CbtNavigationGrid
                items={gridItems}
                mode={details.session.mode as "study" | "tryout"}
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
              mode={details.session.mode as "study" | "tryout"}
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
          title: `Sesi Ujian - Soal ${activeGridItem?.order || 1}`,
          name: user?.user?.name || "",
          email: user?.user?.email || "",
        }}
      />
    </div>
  );
}

