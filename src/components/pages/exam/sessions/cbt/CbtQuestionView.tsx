import React, { useState } from "react";
import { useCbtStore } from "@/stores/useCbtStore";
import { CheckCircle2, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

import { QuestionData, PassageData, OptionData, EvaluationData } from "@/api/exam-sessions";

interface CbtQuestionViewProps {
  question: QuestionData;
  passage?: PassageData | null;
  options: OptionData[];
  evaluation?: EvaluationData | null;
  selectedOptionId: string | null;
  mode: "study" | "tryout";
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
  const { isSaving } = useCbtStore();
  const [showSolution, setShowSolution] = useState(false);

  const getOptionStyles = (optionId: string) => {
    const isSelected = selectedOptionId === optionId;

    if (mode === "study" && evaluation) {
      if (isSelected) {
        return evaluation.isCorrect
          ? "border-green-500 bg-green-500/10 dark:bg-green-500/20 shadow-[0_0_15px_-5px_rgba(34,197,94,0.4)]"
          : "border-red-500 bg-red-500/10 dark:bg-red-500/20 shadow-[0_0_15px_-5px_rgba(239,68,68,0.4)]";
      }

      // Highlight the correct answer if the user picked the wrong one
      if (evaluation.correctOptionId === optionId) {
        return "border-green-500 bg-green-500/5 dark:bg-green-500/10 ring-1 ring-green-500/30";
      }

      return "border-border hover:border-border cursor-default opacity-60";
    }

    if (isSelected) {
      return "border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary";
    }

    if (!allowDirectOptionSelect) {
      return "border-border cursor-default";
    }

    return "border-border hover:border-primary/50 cursor-pointer hover:bg-accent/50";
  };

  const letters = ["A", "B", "C", "D", "E"];

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6 pb-2 border-b border-border/40">
        <h2 className="text-xl font-bold text-primary">
          Soal {questionOrder}{" "}
          <span className="text-muted-foreground font-normal text-sm">dari {totalQuestions}</span>
        </h2>
        {isSaving && (
          <span className="text-xs text-muted-foreground animate-pulse">Menyimpan...</span>
        )}
      </div>

      {passage && (
        <div className="mb-8 p-5 bg-muted/30 rounded-xl border border-border/50">
          {passage.title && <h3 className="font-semibold text-lg mb-4">{passage.title}</h3>}
          <div
            className="prose dark:prose-invert max-w-none text-base"
            dangerouslySetInnerHTML={{ __html: passage.htmlContent }}
          />
        </div>
      )}

      <div className="mb-8">
        <div
          className="prose dark:prose-invert max-w-none text-lg leading-relaxed"
          dangerouslySetInnerHTML={{ __html: question.htmlContent }}
        />
      </div>

      <div className="flex flex-col gap-3 mb-10">
        {options.map((option, index) => {
          const isSelected = selectedOptionId === option.id;

          return (
            <div
              key={option.id}
              onClick={() => {
                if (!allowDirectOptionSelect) return;
                // Lock options in study mode if already answered
                if (mode === "study" && evaluation) return;
                onOptionSelect(option.id);
              }}
              className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${getOptionStyles(option.id)}`}
            >
              <div
                className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border font-semibold ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border"
                }`}
              >
                {letters[index] || "?"}
              </div>

              <div
                className="prose dark:prose-invert max-w-none flex-1 pt-1"
                dangerouslySetInnerHTML={{ __html: option.htmlContent }}
              />

              {mode === "study" &&
                evaluation &&
                (isSelected || evaluation.correctOptionId === option.id) && (
                  <div className="absolute right-4 top-4 animate-in zoom-in duration-300">
                    {evaluation.correctOptionId === option.id ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                )}
            </div>
          );
        })}
      </div>

      {mode === "study" && evaluation && !showSolution && (
        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => setShowSolution(true)}
            variant="outline"
            className="gap-2 px-8 py-6 text-base font-semibold border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 rounded-2xl shadow-sm"
          >
            <Eye className="w-5 h-5" />
            Lihat Pembahasan
          </Button>
        </div>
      )}

      {mode === "study" && evaluation && showSolution && (
        <div className="mt-8 p-6 bg-card rounded-xl border border-border shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <h3 className="text-lg font-bold text-primary flex items-center gap-2 mb-6">
            Pembahasan
          </h3>

          {evaluation.solutions.length > 0 ? (
            <div className="space-y-6">
              {evaluation.solutions.map((sol) => (
                <div key={sol.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-secondary text-secondary-foreground uppercase tracking-wider">
                      {sol.solutionType.replace("_", " ")}
                    </span>
                    <span className="font-medium">{sol.title}</span>
                  </div>
                  <div
                    className="prose dark:prose-invert max-w-none bg-muted/20 p-4 rounded-lg border border-border/50"
                    dangerouslySetInnerHTML={{ __html: sol.htmlContent }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground italic">
              Tidak ada pembahasan tersedia untuk soal ini.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
