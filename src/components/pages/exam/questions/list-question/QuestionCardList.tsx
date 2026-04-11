import React from "react";
import { ListQuestionsResponse, ExamQuestion } from "@/api/exam-questions";
import { PaginationData } from "@/components/custom/table";
import { QuestionCardListItem } from "./QuestionCardListItem";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppTranslation } from "@/lib/i18n-typed";
import { HelpCircle } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";

interface QuestionCardListProps {
  data: ListQuestionsResponse | undefined;
  isLoading: boolean;
  paginationData: PaginationData | undefined;
  onDelete: (question: ExamQuestion) => void;
}

export function QuestionCardList({
  data,
  isLoading,
  paginationData,
  onDelete,
}: QuestionCardListProps) {
  const { t } = useAppTranslation();
  const items = data?.data?.items || [];
  const { openSideMenu } = useAuthStore();

  const gridClass = openSideMenu
    ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  if (isLoading) {
    return (
      <div className={cn(gridClass)}>
        {Array.from({ length: paginationData?.limit || 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-4 border border-border/50 rounded-2xl p-4 bg-card/40"
          >
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-between items-center mt-auto pt-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 bg-card/40 backdrop-blur-sm rounded-3xl border border-dashed border-border/60 text-center animate-in fade-in zoom-in duration-500">
        <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-6 shadow-inner">
          <HelpCircle className="h-10 w-10 text-primary opacity-40" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          {t(($) => $.exam.questions.table.noResult)}
        </h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
          {t(($) => $.exam.questions.description)}
        </p>
      </div>
    );
  }

  return (
    <div className={cn(gridClass)}>
      {items.map((question) => (
        <QuestionCardListItem key={question.id} question={question} onDelete={onDelete} />
      ))}
    </div>
  );
}
