import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { OptionData, EvaluationData } from "@/api/exam-sessions";
import { useCbtStore } from "@/stores/useCbtStore";

interface CbtAnswerPadProps {
  options: OptionData[];
  selectedOptionId: string | null;
  evaluation?: EvaluationData | null;
  mode: "study" | "tryout";
  hasAnswered: boolean;
  onOptionSelect: (optionId: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
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
}) => {
  const { draftOptionId, setDraftOptionId } = useCbtStore();
  const letters = ["A", "B", "C", "D", "E"];

  // Sync draft with external selection (e.g. on question change)
  useEffect(() => {
    setDraftOptionId(selectedOptionId);
  }, [selectedOptionId, setDraftOptionId]);

  const isChanged = draftOptionId !== selectedOptionId && draftOptionId !== null;

  return (
    <div className="sticky bottom-0 z-40 w-full bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] transition-all duration-300">
      <div className="max-w-4xl mx-auto p-3 md:p-4 flex flex-col gap-3">
        {/* Save/Confirm Button (Study Mode or Changed Selection) */}
        {isChanged && (
          <div className="flex justify-center animate-in slide-in-from-bottom-2 duration-300">
            <Button
              onClick={() => onOptionSelect(draftOptionId!)}
              className="w-full md:w-auto min-w-[200px] h-11 rounded-xl shadow-lg shadow-primary/20 gap-2 font-bold text-base"
            >
              <Check className="w-5 h-5" />
              {mode === "study" ? "Cek Jawaban" : "Simpan Jawaban"}
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={onPrevious}
            disabled={isFirst}
            className="flex-shrink-0 h-11 px-3 md:px-5 hover:bg-accent/50 text-muted-foreground"
          >
            <ChevronLeft className="w-5 h-5 mr-1 md:mr-2" />
            <span className="hidden md:inline font-medium">Sebelumnya</span>
          </Button>

          <div className="flex-1 flex justify-center items-center gap-2 md:gap-3 overflow-x-auto py-1 scrollbar-hide">
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
                  feedbackStyles = "bg-green-500 text-white border-green-600 hover:bg-green-600";
                } else if (isSelected && !evaluation.isCorrect) {
                  feedbackStyles = "bg-red-500 text-white border-red-600 hover:bg-red-600";
                }
              }

              return (
                <Button
                  key={option.id}
                  variant={isDrafted && !feedbackStyles ? "default" : "outline"}
                  disabled={isDisabled && !isSelected && option.id !== evaluation?.correctOptionId}
                  onClick={() => {
                    if (isDisabled) return;
                    setDraftOptionId(option.id);
                  }}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full p-0 flex-shrink-0 text-base md:text-lg font-bold transition-all duration-200 ${
                    isDrafted && !feedbackStyles
                      ? "ring-4 ring-primary/20 border-primary scale-110"
                      : "border-border/60"
                  } ${isDisabled && !isSelected && option.id !== evaluation?.correctOptionId ? "opacity-50" : ""} ${feedbackStyles}`}
                >
                  {letter}
                </Button>
              );
            })}
          </div>

          <Button
            variant="ghost"
            onClick={onNext}
            disabled={isLast}
            className="flex-shrink-0 h-11 px-3 md:px-5 hover:bg-accent/50 text-muted-foreground"
          >
            <span className="hidden md:inline font-medium">Selanjutnya</span>
            <ChevronRight className="w-5 h-5 ml-1 md:mr-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
