import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCbtStore } from "@/stores/useCbtStore";
import {
  useSessionDetails,
  useSessionQuestion,
  useSaveAnswer,
  useSubmitSession,
} from "@/api/exam-sessions";
import {
  CbtHeader,
  CbtNavigationGrid,
  GridItemStatus,
  CbtQuestionView,
  CbtAnswerPad,
} from "@/components/pages/exam/sessions/cbt";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/(pages)/exam/session/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id: sessionId } = Route.useParams();
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
    resetAll,
  } = useCbtStore();

  const [isMobileGridOpen, setIsMobileGridOpen] = useState(false);

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
      // set active question to first unanswered, or just first question
      const firstUnanswered = details.grid.find((q) => !q.isAnswered);
      setActiveQuestionId(firstUnanswered?.questionId || details.grid[0].questionId);
    }
  }, [details, activeQuestionId, setElapsedSeconds, setActiveQuestionId]);

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
          // Maybe navigate to a summary page if needed
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
    if (!isFirst) setActiveQuestionId(details.grid[currentIndex - 1].questionId);
  };

  const handleNext = () => {
    if (!isLast) setActiveQuestionId(details.grid[currentIndex + 1].questionId);
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
    <div className="flex flex-col h-screen bg-background overflow-hidden font-sans">
      <CbtHeader
        title={details.package?.title || "Sesi Ujian"}
        mode={details.session.mode as "study" | "tryout"}
        onSubmit={handleSubmit}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto pb-32">
          {isLoadingQuestion || !questionData ? (
            <div className="flex h-full items-center justify-center animate-pulse text-muted-foreground">
              Memuat soal...
            </div>
          ) : (
            <CbtQuestionView
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
        <div className="hidden md:block w-[320px] flex-shrink-0">
          <CbtNavigationGrid
            items={gridItems}
            mode={details.session.mode as "study" | "tryout"}
            onQuestionSelect={setActiveQuestionId}
            onToggleDoubtful={handleToggleDoubtful}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileGridOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm">
            <div className="w-[85%] max-w-sm h-full shadow-2xl relative animate-in slide-in-from-right-full">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 -left-12 bg-background/50 backdrop-blur"
                onClick={() => setIsMobileGridOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
              <CbtNavigationGrid
                items={gridItems}
                mode={details.session.mode as "study" | "tryout"}
                onQuestionSelect={(id) => {
                  setActiveQuestionId(id);
                  setIsMobileGridOpen(false);
                }}
                onToggleDoubtful={handleToggleDoubtful}
              />
            </div>
          </div>
        )}
      </div>

      {/* Answer Pad */}
      {questionData && (
        <CbtAnswerPad
          options={questionData.options}
          selectedOptionId={questionData.selectedOptionId}
          mode={details.session.mode as "study" | "tryout"}
          hasAnswered={hasAnswered}
          onOptionSelect={handleOptionSelect}
          onPrevious={handlePrevious}
          onNext={handleNext}
          isFirst={isFirst}
          isLast={isLast}
        />
      )}

      {/* Mobile Grid Toggle */}
      <div className="md:hidden fixed bottom-24 right-4 z-40">
        <Button
          className="rounded-full shadow-xl w-12 h-12 p-0"
          onClick={() => setIsMobileGridOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
