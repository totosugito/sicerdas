import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { OptionData } from "@/api/exam-sessions";

interface CbtAnswerPadProps {
  options: OptionData[];
  selectedOptionId: string | null;
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
  mode,
  hasAnswered,
  onOptionSelect,
  onPrevious,
  onNext,
  isFirst,
  isLast,
}) => {
  const letters = ["A", "B", "C", "D", "E"];

  return (
    <div className="sticky bottom-0 z-40 w-full bg-background/80 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] p-3 md:p-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <Button variant="outline" onClick={onPrevious} disabled={isFirst} className="flex-shrink-0">
          <ChevronLeft className="w-4 h-4 mr-1 md:mr-2" />
          <span className="hidden md:inline">Sebelumnya</span>
        </Button>

        <div className="flex-1 flex justify-center items-center gap-1.5 md:gap-3 overflow-x-auto px-2">
          {options.map((option, index) => {
            const isSelected = selectedOptionId === option.id;
            const letter = letters[index] || "?";

            // In study mode, lock if already answered
            const isDisabled = mode === "study" && hasAnswered;

            return (
              <Button
                key={option.id}
                variant={isSelected ? "default" : "outline"}
                disabled={isDisabled && !isSelected}
                onClick={() => {
                  if (isDisabled) return;
                  onOptionSelect(option.id);
                }}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full p-0 flex-shrink-0 text-base md:text-lg font-bold transition-all ${
                  isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                } ${isDisabled && !isSelected ? "opacity-50" : ""}`}
              >
                {letter}
              </Button>
            );
          })}
        </div>

        <Button variant="outline" onClick={onNext} disabled={isLast} className="flex-shrink-0">
          <span className="hidden md:inline">Selanjutnya</span>
          <ChevronRight className="w-4 h-4 ml-1 md:ml-2" />
        </Button>
      </div>
    </div>
  );
};
