import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { OptionData, EvaluationData } from "@/api/exam-sessions";
import { useCbtStore } from "@/stores/useCbtStore";
import { cn } from "@/lib/utils";
import { useAppTranslation } from "@/lib/i18n-typed";

import { ExamSessionMode, EnumExamStatus, EXAM_STATUS_STYLES } from "@/constants/exam-var";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CbtAnswerPadProps {
  options: OptionData[];
  selectedOptionId: string | null;
  evaluation?: EvaluationData | null;
  mode: ExamSessionMode;
  hasAnswered: boolean;
  onOptionSelect: (optionId: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
  layout?: "horizontal" | "vertical";
}

export const CbtAnswerPad: React.FC<CbtAnswerPadProps> = ({
  options,
  selectedOptionId,
  evaluation,
  mode,
  hasAnswered,
  onOptionSelect,
  onPrevious,
  onNext,
  isFirst,
  isLast,
  layout = "horizontal",
}) => {
  const { draftOptionId, setDraftOptionId } = useCbtStore();
  const { t } = useAppTranslation();
  const letters = ["A", "B", "C", "D", "E"];

  // Sync draft with external selection (e.g. on question change)
  useEffect(() => {
    setDraftOptionId(selectedOptionId);
  }, [selectedOptionId, setDraftOptionId]);

  const isChanged = draftOptionId !== selectedOptionId && draftOptionId !== null;

  const header = (
    <CardHeader className="py-3 px-6 border-b flex flex-row items-center !pb-3">
      <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest w-full text-center">
        {t($ => $.exam.sessions.cbt.answer.title)}
      </CardTitle>
    </CardHeader>
  );

  const renderOptions = () => (
    <div className={cn(
      "flex justify-center items-center overflow-x-auto pb-1 scrollbar-hide",
      layout === "horizontal" ? "flex-1 gap-4 md:gap-6" : "gap-5"
    )}>
      {options.map((option, index) => {
        const isSelected = selectedOptionId === option.id;
        const isDrafted = draftOptionId === option.id;
        const letter = letters[index] || "?";

        // In study mode, lock if already answered
        const isDisabled = mode === "study" && hasAnswered;

        // Style for study mode feedback
        let feedbackStyles = "";
        if (mode === "study" && evaluation) {
          if (evaluation.correctOptionId === option.id) {
            const style = EXAM_STATUS_STYLES[EnumExamStatus.CORRECT_SOLID];
            feedbackStyles = cn(style.bg, style.text, style.border, style.shadow, "font-bold z-20");
          } else if (isSelected && !evaluation.isCorrect) {
            const style = EXAM_STATUS_STYLES[EnumExamStatus.WRONG_SOLID];
            feedbackStyles = cn(style.bg, style.text, style.border, style.shadow, "font-bold z-20");
          }
        }

        return (
          <Button
            key={option.id}
            variant="outline"
            disabled={isDisabled && !isSelected && option.id !== evaluation?.correctOptionId}
            onClick={() => {
              if (isDisabled) return;
              setDraftOptionId(option.id);
            }}
            className={cn(
              "w-10 h-10 md:w-12 md:h-12 rounded-full p-0 flex-shrink-0 text-sm md:text-base font-medium border-2 transition-all duration-200",
              isDrafted && !feedbackStyles && (() => {
                const style = EXAM_STATUS_STYLES[EnumExamStatus.ANSWERED_SOLID];
                return cn(style.bg, style.text, style.border, style.shadow, "z-20 font-bold");
              })(),
              !isDrafted && !feedbackStyles && (() => {
                const style = EXAM_STATUS_STYLES[EnumExamStatus.NEUTRAL];
                return cn(style.bg, style.text, style.border, "hover:border-primary/50");
              })(),
              feedbackStyles,
              isDisabled && !isSelected && option.id !== evaluation?.correctOptionId && "opacity-50"
            )}
          >
            {letter}
          </Button>
        );
      })}
    </div>
  );

  const prevButton = (
    <Button
      variant="ghost"
      onClick={onPrevious}
      disabled={isFirst}
      className={cn(
        "hover:bg-accent/50 text-muted-foreground transition-colors",
        layout === "vertical" ? "flex-1 justify-center" : "flex-shrink-0 px-3 md:px-5"
      )}
    >
      <ChevronLeft className="w-5 h-5 mr-1 md:mr-2" />
      <span className={layout === "vertical" ? "inline text-sm font-medium" : "hidden md:inline text-sm font-medium"}>
        {t($ => $.exam.sessions.cbt.answer.prev)}
      </span>
    </Button>
  );

  const nextButton = (
    <Button
      variant="ghost"
      onClick={onNext}
      disabled={isLast}
      className={cn(
        "hover:bg-accent/50 text-muted-foreground transition-colors",
        layout === "vertical" ? "flex-1 justify-center" : "flex-shrink-0 px-3 md:px-5"
      )}
    >
      <span className={layout === "vertical" ? "inline text-sm font-medium" : "hidden md:inline text-sm font-medium"}>
        {t($ => $.exam.sessions.cbt.answer.next)}
      </span>
      <ChevronRight className="w-5 h-5 ml-1 md:mr-2" />
    </Button>
  );

  const confirmButton = (
    <div className="flex justify-center transition-all duration-300">
      <Button
        variant="outline"
        onClick={() => onOptionSelect(draftOptionId!)}
        disabled={!isChanged}
        className={cn(
          "w-full font-bold text-base transition-all duration-300 border-1",
          layout === "horizontal" ? "md:w-auto min-w-[240px] rounded-xl" : "rounded-lg",
          isChanged
            ? "border-primary text-primary bg-primary/5 hover:bg-primary/10 shadow-lg shadow-primary/15"
            : "opacity-40 grayscale"
        )}
      >
        <Check className="w-5 h-5" />
        {mode === "study" ? t($ => $.exam.sessions.cbt.answer.check) : t($ => $.exam.sessions.cbt.answer.save)}
      </Button>
    </div>
  );

  return (
    <Card className={cn(
      "w-full overflow-hidden transition-all duration-300",
      layout === "vertical"
        ? "h-fit"
        : "fixed bottom-0 left-0 right-0 z-40 shadow-2xl rounded-t-3xl rounded-b-none border-t border-x-0"
    )}>
      <div className={cn(layout === "horizontal" && "max-w-4xl mx-auto flex flex-col gap-0")}>
        {header}
        <CardContent className="p-4 md:p-6">
          {layout === "vertical" ? (
            <>
              {confirmButton}
              {renderOptions()}
              <div className="flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-1">
                {prevButton}
                {nextButton}
              </div>
            </>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <div className="flex items-center justify-center w-full md:w-auto md:flex-1 gap-4 md:gap-8 order-2 md:order-1">
                {prevButton}
                {renderOptions()}
                {nextButton}
              </div>
              <div className="w-full md:w-auto order-1 md:order-2">
                {confirmButton}
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
};
