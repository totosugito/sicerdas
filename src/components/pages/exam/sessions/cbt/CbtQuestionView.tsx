import React, { useState } from "react";
import { useCbtStore } from "@/stores/useCbtStore";
import { CheckCircle2, XCircle, Eye } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppTranslation } from "@/lib/i18n-typed";
import { QuestionData, PassageData, OptionData, EvaluationData } from "@/api/exam-sessions";
import { HtmlViewer } from "@/components/custom/components/block-note";

import { ExamSessionMode, EXAM_STATUS_STYLES, EnumExamStatus } from "@/constants/exam-var";
import { HelpCircle, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { CbtSolutionView } from "./CbtSolutionView";
import { EnumExamSessionMode } from "backend/src/db/schema/exam/enums";

interface CbtQuestionViewProps {
  question: QuestionData;
  passage?: PassageData | null;
  options: OptionData[];
  evaluation?: EvaluationData | null;
  selectedOptionId: string | null;
  mode: ExamSessionMode;
  questionOrder: number;
  totalQuestions: number;
  onOptionSelect: (optionId: string) => void;
  allowDirectOptionSelect?: boolean;
}

export const CbtQuestionView: React.FC<CbtQuestionViewProps> = ({
  question,
  passage,
  options,
  evaluation,
  selectedOptionId,
  mode,
  questionOrder,
  totalQuestions,
  onOptionSelect,
  allowDirectOptionSelect = false,
}) => {
  const { t } = useAppTranslation();
  const { isSaving, fontSize, draftOptionId } = useCbtStore();
  const [showSolution, setShowSolution] = useState(false);

  const textSizes = {
    sm: "text-sm [&_*]:!text-sm",
    base: "text-base [&_*]:!text-base",
    lg: "text-lg [&_*]:!text-lg",
    xl: "text-xl [&_*]:!text-xl",
  };
  const textSizeClass = textSizes[fontSize] || "text-base";

  const getOptionStyles = (optionId: string) => {
    const isSelected = selectedOptionId === optionId;
    const isDrafted = draftOptionId === optionId;

    if (mode === EnumExamSessionMode.STUDY && evaluation) {
      if (isSelected) {
        if (evaluation.isCorrect) {
          const style = EXAM_STATUS_STYLES[EnumExamStatus.CORRECT_DASHED];
          return cn(style.border, style.bg, style.shadow);
        } else {
          const style = EXAM_STATUS_STYLES[EnumExamStatus.WRONG_DASHED];
          return cn(style.border, style.bg, style.shadow);
        }
      }

      // Highlight the correct answer if the user picked the wrong one (dashed border, no bg)
      if (evaluation.correctOptionId === optionId) {
        const style = EXAM_STATUS_STYLES[EnumExamStatus.CORRECT_DASHED];
        return cn(style.border, style.bg, "opacity-80");
      }

      return "border-border/50";
    }

    if (isDrafted) {
      return "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm shadow-primary/5";
    }

    if (!allowDirectOptionSelect) {
      return "border-border cursor-default";
    }

    return "border-border hover:border-primary/40 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50";
  };

  const getCircleStyles = (optionId: string, isSelected: boolean, isDrafted: boolean) => {
    if (mode === EnumExamSessionMode.STUDY && evaluation) {
      if (optionId === evaluation.correctOptionId) {
        const style = EXAM_STATUS_STYLES[EnumExamStatus.CORRECT_SOLID];
        return cn(style.bg, style.text, style.border, style.shadow);
      }
      if (isSelected && !evaluation.isCorrect) {
        const style = EXAM_STATUS_STYLES[EnumExamStatus.WRONG_SOLID];
        return cn(style.bg, style.text, style.border, style.shadow);
      }
    }

    if (isDrafted) {
      const style = EXAM_STATUS_STYLES[EnumExamStatus.ANSWERED_SOLID];
      return cn(style.bg, style.text, style.border, style.shadow);
    }

    const style = EXAM_STATUS_STYLES[EnumExamStatus.NEUTRAL];
    return cn(style.bg, style.text, style.border);
  };

  const letters = ["A", "B", "C", "D", "E"];

  return (
    <Card className="flex flex-col w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden py-0 gap-0">
      <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between !pb-3">
        <div className="flex items-center gap-2 px-1">
          <HelpCircle className="w-4 h-4 text-muted-foreground" />
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {t($ => $.exam.sessions.cbt.question.title)} {questionOrder} <span className="lowercase font-normal opacity-70">{t($ => $.exam.sessions.cbt.question.of)}</span> {totalQuestions}
          </CardTitle>
        </div>
        <div className="flex items-center gap-3">
          {isSaving && (
            <span className="text-[10px] font-bold text-primary/70 uppercase tracking-tighter animate-pulse">{t($ => $.exam.sessions.cbt.question.saving)}</span>
          )}
        </div>
      </CardHeader>

      <CardContent className="">

        {passage && (
          <div className="mb-10 p-6 md:p-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-inner">
            {passage.title && (
              <h3 className="font-bold text-lg md:text-xl text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-primary/60" />
                {passage.title}
              </h3>
            )}
            <HtmlViewer html={passage.htmlContent} className={`prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 ${textSizeClass}`} />
          </div>
        )}

        <HtmlViewer
          html={question.htmlContent}
          className={`prose dark:prose-invert max-w-none leading-relaxed text-slate-800 dark:text-slate-200 font-medium ${textSizeClass}`}
        />

        <div className="relative py-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-[#020617] px-4 text-xs font-bold text-muted-foreground tracking-[0.3em]">
              {t($ => $.exam.sessions.cbt.question.options)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-10">
          {options.map((option, index) => {
            const isSelected = selectedOptionId === option.id;
            const isDrafted = draftOptionId === option.id;

            return (
              <div
                key={option.id}
                onClick={() => {
                  if (!allowDirectOptionSelect) return;
                  // Lock options in study mode if already answered
                  if (mode === EnumExamSessionMode.STUDY && evaluation) return;
                  onOptionSelect(option.id);
                }}
                className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${getOptionStyles(option.id)}`}
              >
                <div
                  className={cn(
                    "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2 font-bold transition-all duration-300",
                    getCircleStyles(option.id, isSelected, isDrafted)
                  )}
                >
                  {letters[index] || "?"}
                </div>

                <HtmlViewer
                  html={option.htmlContent}
                  className={`prose dark:prose-invert max-w-none flex-1 pt-1 ${textSizeClass}`}
                />

                {mode === EnumExamSessionMode.STUDY &&
                  evaluation &&
                  (isSelected || evaluation.correctOptionId === option.id) && (
                    <div className="absolute right-4 top-4 animate-in zoom-in duration-300">
                      {evaluation.correctOptionId === option.id ? (
                        <CheckCircle2 className={cn("w-5 h-5", EXAM_STATUS_STYLES[EnumExamStatus.CORRECT].icon)} />
                      ) : (
                        <XCircle className={cn("w-5 h-5", EXAM_STATUS_STYLES[EnumExamStatus.WRONG].icon)} />
                      )}
                    </div>
                  )}
              </div>
            );
          })}
        </div>

        {mode === EnumExamSessionMode.STUDY && evaluation && !showSolution && (
          <div className="my-6 flex justify-center">
            <Button
              onClick={() => setShowSolution(true)}
              variant="outline"
              className="gap-2 px-8 text-base font-semibold border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
            >
              <Eye className="w-4 h-4" />
              {t($ => $.exam.sessions.cbt.question.viewSolution)}
            </Button>
          </div>
        )}

        <CbtSolutionView
          evaluation={evaluation!}
          showSolution={showSolution}
          textSizeClass={textSizeClass}
        />
      </CardContent>
    </Card>
  );
};
