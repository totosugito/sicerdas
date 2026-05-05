import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSessionDetails } from "@/api/exam-sessions";
import { AppRoute } from "@/constants/app-route";
import { useState, useMemo } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { AlertCircle } from "lucide-react";
import { LoadingView } from "@/components/app/LoadingView";
import { ErrorPageDetails } from "@/components/app/ErrorPageDetails";
import { Button } from "@/components/ui/button";
import {
  ResultsHeader,
  ResultsActions,
  ResultsScoreCard,
  ResultsQuestionReview,
  QuestionReviewSection,
} from "@/components/pages/exam/sessions/results";
import { cn } from "@/lib/utils";

type ResultsSearch = {
  view?: "grid" | "list";
  page?: number;
  q?: string;
};

export const Route = createFileRoute("/(pages)/exam/session/$id/results")({
  validateSearch: (search: Record<string, unknown>): ResultsSearch => {
    return {
      view: (search.view as "grid" | "list") || "grid",
      page: Number(search.page) || 1,
      q: search.q as string | undefined,
    };
  },
  component: SessionResultsComponent,
});

function SessionResultsComponent() {
  const { t } = useAppTranslation();
  const { id: sessionId } = Route.useParams();
  const { view: viewMode, page, q: selectedReviewId } = Route.useSearch();
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate({ from: Route.fullPath });

  const setViewMode = (view: "grid" | "list") => {
    navigate({
      search: (prev: ResultsSearch) => ({ ...prev, view, page: 1 }),
      resetScroll: false,
    });
  };

  const setPage = (newPage: number) => {
    navigate({
      search: (prev: ResultsSearch) => ({ ...prev, page: newPage }),
      resetScroll: false,
    });
  };

  const setSelectedReviewId = (q: string | null) => {
    navigate({
      search: (prev: ResultsSearch) => ({ ...prev, q: q || undefined }),
      resetScroll: false,
    });
  };
  const {
    data: detailsRes,
    isLoading: isLoadingDetails,
    isError: isErrorDetails,
    error: errorDetails,
    refetch: refetchDetails,
  } = useSessionDetails(sessionId);
  const details = detailsRes?.data;

  const getSnippet = (content: any[] | null) => {
    if (!content || !Array.isArray(content)) return "";
    return (
      content
        .map((block) => {
          if (block.content && Array.isArray(block.content)) {
            return block.content.map((c: any) => c.text || "").join("");
          }
          return "";
        })
        .join(" ")
        .substring(0, 150) + "..."
    );
  };

  const filteredGrid = useMemo(() => {
    const grid = details?.grid || [];
    if (!searchQuery) return grid;
    return grid.filter((item) => {
      const snippet = getSnippet(item.questionContent).toLowerCase();
      return (
        snippet.includes(searchQuery.toLowerCase()) || item.order.toString().includes(searchQuery)
      );
    });
  }, [details?.grid, searchQuery]);

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

  const { session, grid, package: pkg, section } = details;
  const totalQuestions = grid.length;
  const correctCount = grid.filter((q) => q.isCorrect === true).length;
  const wrongCount = grid.filter((q) => q.isCorrect === false).length;
  const skippedCount = grid.filter((q) => q.isCorrect === null && !q.isAnswered).length;

  const score = session.score ?? 0;
  const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

  const handleReview = (questionId: string) => {
    setSelectedReviewId(questionId);
  };

  return (
    <div className={cn("page-full-no-pad", "max-w-7xl mx-auto px-6")}>
      <ResultsHeader
        title={t(($) => $.exam.sessions.results.title)}
        description={t(($) => $.exam.sessions.results.description)}
        packageTitle={pkg?.title}
        sectionTitle={section?.title}
        gradeName={pkg?.grade?.name ?? undefined}
      >
        <ResultsActions sessionId={sessionId} packageId={pkg?.id} />
      </ResultsHeader>

      <div className="w-full space-y-6">
        <ResultsScoreCard
          score={score}
          correctCount={correctCount}
          wrongCount={wrongCount}
          skippedCount={skippedCount}
          elapsedSeconds={session.elapsedSeconds}
          accuracy={accuracy}
          earnedPoints={session.earnedPoints}
          maxPoints={session.maxPoints}
        />

        <ResultsQuestionReview
          totalQuestions={totalQuestions}
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          grid={grid}
          filteredGrid={filteredGrid}
          onReview={handleReview}
          selectedReviewId={selectedReviewId}
          getSnippet={getSnippet}
          page={page}
          setPage={setPage}
        />

        {selectedReviewId && (
          <div
            id="review-section"
            className="pt-8 animate-in fade-in slide-in-from-bottom-8 duration-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <div className="w-2 h-8 bg-primary rounded-full" />
                {t(($) => $.exam.sessions.results.reviewDetail)}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedReviewId(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                {t(($) => $.exam.sessions.results.closeReview)}
              </Button>
            </div>
            <QuestionReviewSection
              sessionId={sessionId}
              questionId={selectedReviewId}
              grid={grid}
            />
          </div>
        )}
      </div>
    </div>
  );
}
