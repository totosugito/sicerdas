import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppTranslation } from "@/lib/i18n-typed";

interface QuestionNumberGridProps {
  jsonQuestions: any[];
  selectedIndex: number;
  selectedIndices: number[];
  onSelect: (index: number) => void;
  onToggleSelect: (index: number) => void;
  onToggleSelectAll: () => void;
}

export function QuestionNumberGrid({
  jsonQuestions,
  selectedIndex,
  selectedIndices,
  onSelect,
  onToggleSelect,
  onToggleSelectAll,
}: QuestionNumberGridProps) {
  const { t } = useAppTranslation();

  return (
    <div className="sticky top-16 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all"
            checked={selectedIndices.length === jsonQuestions.length && jsonQuestions.length > 0}
            onCheckedChange={onToggleSelectAll}
          />
          <label htmlFor="select-all" className="text-sm font-medium cursor-pointer select-none">
            {t(($) => $.exam.questions.jsonQuestions.globalParameters.selectAll)
              .replace("{selected}", selectedIndices.length.toString())
              .replace("{total}", jsonQuestions.length.toString())}
          </label>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {jsonQuestions.map((_, index) => (
          <div key={index} className="relative group">
            <Button
              variant={selectedIndex === index ? "subtle-primary" : "outline"}
              className="w-12 h-12 p-0 flex flex-col items-center justify-center relative overflow-hidden"
              onClick={() => onSelect(index)}
            >
              <span className="text-xs font-bold">{index + 1}</span>
            </Button>
            <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 z-20">
              <Checkbox
                checked={selectedIndices.includes(index)}
                onCheckedChange={() => onToggleSelect(index)}
                className="bg-background shadow-sm h-5 w-5 border-2"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
