import React, { useState } from "react";
import { useSessionQuestion } from "@/api/exam/sessions";
import { LoadingView } from "@/components/app/LoadingView";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppTranslation } from "@/lib/i18n-typed";
import { CbtQuestionView } from "@/components/pages/exam/sessions/cbt";
import { EnumExamSessionMode } from "backend/src/db/schema/exam/enums";
import { CreateContentReport } from "@/components/pages/layout/CreateContentReport";
import { EnumContentType } from "backend/src/db/schema/enum/enum-app";
import { useAuthStore } from "@/stores/useAuthStore";

interface QuestionReviewSectionProps {
  sessionId: string;
  questionId: string;
  grid: any[];
}

export const QuestionReviewSection: React.FC<QuestionReviewSectionProps> = ({
  sessionId,
  questionId,
  grid,
}) => {
  const { t } = useAppTranslation();
  const { user } = useAuthStore();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const {
    data: questionRes,
    isLoading: isLoadingQuestion,
    isError: isErrorQuestion,
    error: errorQuestion,
    refetch: refetchQuestion,
  } = useSessionQuestion(sessionId, questionId);
  const qData = questionRes?.data;
  const item = grid.find((g) => g.questionId === questionId);

  if (isLoadingQuestion) {
    return (
      <LoadingView
        title={t(($) => $.exam.sessions.cbt.session.loadingQuestion)}
        message={t(($) => $.exam.sessions.cbt.session.loadingQuestionDesc)}
        className="min-h-[400px] lg:min-h-[600px] border-2 border-dashed bg-muted/5"
      />
    );
  }

  if (isErrorQuestion || (questionRes && !questionRes.success)) {
    return (
      <Card className="border-2 border-destructive/20 bg-destructive/5">
        <CardContent className="py-16 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-destructive">
              {t(($) => $.exam.sessions.results.review.loadDetail)}
            </p>
            <p className="text-sm text-muted-foreground max-w-xs">
              {questionRes?.message ||
                (errorQuestion as any)?.message ||
                t(($) => $.exam.sessions.results.review.loadDetailDesc)}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetchQuestion()} className="mt-2">
            {t(($) => $.exam.sessions.results.review.retry)}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!qData) return null;

  return (
    <div className="space-y-8 pb-20">
      <CbtQuestionView
        question={qData.question}
        passage={qData.passage}
        options={qData.options}
        evaluation={qData.evaluation}
        selectedOptionId={qData.selectedOptionId}
        mode={EnumExamSessionMode.STUDY}
        questionOrder={item?.order || 1}
        totalQuestions={grid.length}
        onOptionSelect={() => { }}
        onReport={() => setIsReportDialogOpen(true)}
        allowDirectOptionSelect={false}
      />

      <CreateContentReport
        isOpen={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        data={{
          contentType: EnumContentType.EXAM,
          referenceId: questionId,
          title: t(($) => $.exam.sessions.cbt.session.reportTitle, {
            order: item?.order || 1,
          }),
          name: user?.user?.name || "",
          email: user?.user?.email || "",
        }}
      />
    </div>
  );
};
